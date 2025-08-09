# Plated

## Steps to Run

1. Create a `.env` file based on `env.sample.txt`
    - Add the foursquare api key to `FOURSQUARE_API_KEY`
    - Add the direct connection supabase url to `DATABASE_URL`
    - Add your local postgres information to `PGUSER`, `PGDATABSE`, and `PGPASSWORD`
2. Install dependencies
    - `npm i`

### For Local App and Local DB

1. Setup local postgres db
    - `npm run local-db:update`
2. Run app
    - `npm run start:local`

### For Local App and Supabase DB
1. Run app
    - `npm run start:prod`
2. **If needed** update schema of production database. This will erase db content.
    - `npm run db:update`

### For Production App and Supabase DB
`https:\\plated.fly.dev`