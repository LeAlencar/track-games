# Data Fetching Scripts

This directory contains scripts for populating the database with external data sources.

## RAWG API Data Fetcher

The `fetch-rawg-games.ts` script fetches game data from the RAWG Video Games Database API and stores it in your local PostgreSQL database.

### Prerequisites

1. **RAWG API Key**: Get your free API key from [RAWG API Documentation](https://rawg.io/apidocs)
2. **Database Setup**: Ensure your PostgreSQL database is running and migrated
3. **Environment Variables**: Copy `env.example` to `.env` and fill in your values

### Usage

#### Basic Usage

```bash
# Fetch 10 pages (200 games) with default settings
npm run fetch-games
```

#### Advanced Usage

```bash
# Fetch 5 pages with 40 games per page (200 total games)
npm run fetch-games -- --pages 5 --page-size 40

# Fetch 20 pages with default page size (400 total games)
npm run fetch-games -- --pages 20

# Show help
npm run fetch-games:help
```

#### Options

- `--pages <number>`: Number of pages to fetch (default: 10)
- `--page-size <number>`: Games per page, max 40 (default: 20)
- `--help`: Show help information

### Features

- ✅ **Rate Limiting**: Automatically handles RAWG API rate limits
- ✅ **Error Recovery**: Retries failed requests with exponential backoff
- ✅ **Duplicate Prevention**: Updates existing games instead of creating duplicates
- ✅ **Rich Data**: Fetches screenshots, trailers, and store information
- ✅ **Progress Tracking**: Shows real-time progress and statistics
- ✅ **Steam Integration**: Extracts Steam app IDs when available

### Data Collected

The script fetches comprehensive game data including:

- **Basic Info**: Name, description, release date, genres, platforms
- **Ratings**: RAWG community ratings, Metacritic scores
- **Media**: Screenshots, trailers, cover images
- **Development**: Developers, publishers
- **Classification**: ESRB ratings, tags
- **External Links**: Official websites, store links
- **Steam Data**: Steam app IDs (prices can be added later)

### Performance

- **Rate Limiting**: 1 request per second to respect API limits
- **Batch Processing**: Processes multiple games per API call
- **Efficient Updates**: Only updates changed data
- **Memory Efficient**: Processes games in streaming fashion

### Troubleshooting

#### Common Issues

1. **API Key Error**

   ```
   ❌ RAWG_API_KEY environment variable is required
   ```

   **Solution**: Add your RAWG API key to your `.env` file

2. **Database Connection Error**

   ```
   ❌ DATABASE_URL environment variable is required
   ```

   **Solution**: Ensure your database is running and DATABASE_URL is correct

3. **Rate Limiting**

   ```
   ⚠️  Rate limited. Waiting 2000ms...
   ```

   **Solution**: This is normal - the script automatically handles rate limits

4. **Network Errors**
   ```
   ❌ Request failed (attempt 1): fetch failed
   ```
   **Solution**: Check your internet connection; the script will retry automatically

### Best Practices

1. **Start Small**: Begin with a few pages to test your setup
2. **Monitor Progress**: Watch the console output for any errors
3. **Regular Updates**: Re-run the script periodically to get new games
4. **Database Backups**: Back up your database before large imports

### Example Output

```
🎮 RAWG Games Data Fetcher

🚀 Starting RAWG data fetch...
📋 Parameters: 5 pages, 20 games per page
📊 Expected total: ~100 games

📄 Processing page 1/5...
🌐 Fetching: /games (attempt 1)
📦 Found 20 games on page 1
➕ Inserted: Cyberpunk 2077
➕ Inserted: The Witcher 3: Wild Hunt
✅ Processed 10 games...

📊 Final Statistics:
   Total Processed: 100
   Total Inserted: 95
   Total Updated: 5
   Total Errors: 0

✨ Data fetch completed!
```

### Next Steps

After running the script:

1. Use `npm run db:studio` to browse your populated database
2. Check the `games` table to see your imported data
3. Build your application features using the rich game data
4. Consider setting up automated runs for regular updates
