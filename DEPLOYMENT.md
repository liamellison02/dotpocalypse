# Deployment Configuration for Dotcom Bubble Simulator

This file contains instructions for deploying the Dotcom Bubble Portfolio Simulator web application.

## Environment Variables

Create a `.env` file in the app directory with the following variables:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

## Build Instructions

To build the application for production:

```bash
cd dotcom-bubble-simulator/app
npm install
npm run build
```

This will create a `build` directory with the production-ready application.

## Supabase Setup

1. Create a new Supabase project
2. Set up the following tables:

### users table (handled by Supabase Auth)

### saved_games table
```sql
CREATE TABLE saved_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  game_name TEXT NOT NULL,
  market_state JSONB NOT NULL,
  stocks JSONB NOT NULL,
  portfolio JSONB NOT NULL,
  cash NUMERIC NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX saved_games_user_id_idx ON saved_games(user_id);

-- Set up RLS (Row Level Security)
ALTER TABLE saved_games ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own saved games
CREATE POLICY "Users can view their own saved games" 
  ON saved_games FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own saved games
CREATE POLICY "Users can insert their own saved games" 
  ON saved_games FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own saved games
CREATE POLICY "Users can update their own saved games" 
  ON saved_games FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own saved games
CREATE POLICY "Users can delete their own saved games" 
  ON saved_games FOR DELETE 
  USING (auth.uid() = user_id);
```

## Deployment Options

### Option 1: Static Site Hosting (Recommended)

Deploy the built application to a static site hosting service:

1. Netlify
2. Vercel
3. GitHub Pages
4. AWS S3 + CloudFront

### Option 2: Traditional Web Hosting

Upload the contents of the `build` directory to your web server.

### Option 3: Docker Deployment

Create a Dockerfile in the project root:

```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY app/package*.json ./
RUN npm install
COPY app/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run the Docker container:

```bash
docker build -t dotcom-bubble-simulator .
docker run -p 80:80 dotcom-bubble-simulator
```

## Post-Deployment

After deployment, verify:

1. User authentication works correctly
2. Supabase connection is established
3. OpenAI API integration functions properly
4. Game mechanics operate as expected
5. Save/load functionality works
