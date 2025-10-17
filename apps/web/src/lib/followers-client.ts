interface FollowResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface FollowStatusResponse {
  success: boolean;
  isFollowing: boolean;
  error?: string;
}

export class FollowersClientService {
  /**
   * Follow a user
   */
  static async followUser(
    followingId: string,
    followerId: string
  ): Promise<FollowResponse> {
    try {
      const response = await fetch(`/api/users/${followingId}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ followerId }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error following user:", error);
      return {
        success: false,
        error: "Failed to follow user",
      };
    }
  }

  /**
   * Unfollow a user
   */
  static async unfollowUser(
    followingId: string,
    followerId: string
  ): Promise<FollowResponse> {
    try {
      const response = await fetch(
        `/api/users/${followingId}/follow?followerId=${followerId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error unfollowing user:", error);
      return {
        success: false,
        error: "Failed to unfollow user",
      };
    }
  }

  /**
   * Check if a user is following another user
   */
  static async checkFollowStatus(
    followingId: string,
    followerId: string
  ): Promise<FollowStatusResponse> {
    try {
      const response = await fetch(
        `/api/users/${followingId}/follow?followerId=${followerId}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking follow status:", error);
      return {
        success: false,
        isFollowing: false,
        error: "Failed to check follow status",
      };
    }
  }

  /**
   * Toggle follow status (follow if not following, unfollow if following)
   */
  static async toggleFollow(
    followingId: string,
    followerId: string
  ): Promise<{
    success: boolean;
    isFollowing: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // First check current status
      const statusResponse = await this.checkFollowStatus(
        followingId,
        followerId
      );

      if (!statusResponse.success) {
        return {
          success: false,
          isFollowing: false,
          error: statusResponse.error,
        };
      }

      // Toggle based on current status
      const followResponse = statusResponse.isFollowing
        ? await this.unfollowUser(followingId, followerId)
        : await this.followUser(followingId, followerId);

      return {
        success: followResponse.success,
        isFollowing: !statusResponse.isFollowing,
        message: followResponse.message,
        error: followResponse.error,
      };
    } catch (error) {
      console.error("Error toggling follow:", error);
      return {
        success: false,
        isFollowing: false,
        error: "Failed to toggle follow status",
      };
    }
  }
}
