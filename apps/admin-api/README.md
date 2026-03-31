# Mercado Oriental Admin API

A Node.js API built with TypeScript, Express, and Prisma.

## Setup

1. Install dependencies:

```bash
yarn install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Set up the database:

```bash
# Generate Prisma Client
yarn prisma:generate

# Run migrations
yarn prisma:migrate
```

## Development

Run the development server:

```bash
yarn dev
```

The server will start on `http://localhost:3000` (or the PORT specified in your .env file).

## Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build TypeScript to JavaScript
- `yarn start` - Run the production build
- `yarn prisma:generate` - Generate Prisma Client
- `yarn prisma:migrate` - Run database migrations
- `yarn prisma:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
src/
  index.ts          # Main application entry point
prisma/
  schema.prisma     # Prisma schema definition
dist/               # Compiled JavaScript (generated)
```
# mercado-oriantal-admin-api
