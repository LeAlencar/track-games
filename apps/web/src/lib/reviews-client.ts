// Client-side service for reviews that calls API routes instead of database directly
// Types defined locally to avoid server-side imports

export interface CreateReviewData {
  platform: string;
  rating: number; // 1-5 stars
  title?: string;
  content?: string;
  hoursPlayed?: number;
  isRecommended?: boolean;
  isVerifiedPurchase?: boolean;
}

export interface UpdateReviewData {
  platform?: string;
  rating?: number;
  title?: string;
  content?: string;
  hoursPlayed?: number;
  isRecommended?: boolean;
}

export interface Review {
  id: string;
  userId: string;
  gameId: string;
  platform: string;
  rating: number;
  title: string | null;
  content: string | null;
  hoursPlayed: number | null;
  isRecommended: boolean | null;
  isVerifiedPurchase: boolean;
  likesCount: number;
  dislikesCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewWithGame extends Review {
  game: any; // Game object
}

export interface ReviewWithUser extends Review {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export class ReviewsClientService {
  /**
   * Create a new review for a game
   */
  static async createReview(
    userId: string,
    gameId: string,
    data: CreateReviewData
  ): Promise<{ review: Review }> {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        gameId,
        ...data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create review");
    }

    return await response.json();
  }

  /**
   * Get user's reviews
   */
  static async getUserReviews(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{ reviews: ReviewWithGame[]; count: number; hasMore: boolean }> {
    const response = await fetch(
      `/api/reviews?userId=${userId}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch user reviews");
    }

    return await response.json();
  }

  /**
   * Get a specific user's review for a game
   */
  static async getUserReviewForGame(
    userId: string,
    gameId: string
  ): Promise<{ review: ReviewWithGame | null }> {
    const response = await fetch(
      `/api/reviews?userId=${userId}&gameId=${gameId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch user review");
    }

    return await response.json();
  }

  /**
   * Get all reviews for a game
   */
  static async getGameReviews(
    gameId: string,
    limit = 20,
    offset = 0
  ): Promise<{ reviews: ReviewWithUser[]; count: number; hasMore: boolean }> {
    const response = await fetch(
      `/api/reviews?gameId=${gameId}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch game reviews");
    }

    return await response.json();
  }

  /**
   * Get all reviews (public feed)
   */
  static async getAllReviews(
    limit = 20,
    offset = 0
  ): Promise<{
    reviews: (ReviewWithGame & ReviewWithUser)[];
    count: number;
    hasMore: boolean;
  }> {
    const response = await fetch(
      `/api/reviews?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch reviews");
    }

    return await response.json();
  }

  /**
   * Update an existing review
   */
  static async updateReview(
    reviewId: string,
    userId: string,
    data: UpdateReviewData
  ): Promise<{ review: Review }> {
    const response = await fetch("/api/reviews", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewId,
        userId,
        ...data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update review");
    }

    return await response.json();
  }

  /**
   * Delete a review
   */
  static async deleteReview(
    reviewId: string,
    userId: string
  ): Promise<{ success: boolean }> {
    const response = await fetch(
      `/api/reviews?reviewId=${reviewId}&userId=${userId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete review");
    }

    return await response.json();
  }
}

/**
 * Helper function to get star rating display
 */
export function getStarRating(rating: number): string {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  return stars;
}

/**
 * Helper function to format review date
 */
export function formatReviewDate(date: Date | string): string {
  const reviewDate = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "Ontem";
  } else if (diffDays < 7) {
    return `${diffDays} dias atrás`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} semana${weeks > 1 ? "s" : ""} atrás`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} mês${months > 1 ? "es" : ""} atrás`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} ano${years > 1 ? "s" : ""} atrás`;
  }
}
