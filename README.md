# Multi-Service Web Application

This project is a full-stack web application using Docker Compose to orchestrate multiple services including a frontend, a backend API, MySQL database, and Redis for caching.

## Architecture

The application consists of the following components:

- **Frontend**: A web interface that communicates with the backend API
- **Backend**: Node.js Express server that handles business logic and data access
- **MySQL Database**: Persistent storage for application data
- **Redis**: In-memory data structure store used for caching

## Features

- RESTful API endpoints for message management
- Database integration with MySQL
- Redis caching to improve performance
- Cross-origin resource sharing (CORS) support
- Docker containerization for consistent development and deployment

## API Endpoints

### GET `/api/message`
Returns a simple hello message from the backend.

### GET `/api/cache`
Checks Redis cache first for the most recent message. If not found, fetches from the database and caches it for one hour.

### GET `/api/messages`
Retrieves all messages from the database, ordered by creation date (newest first).

### POST `/api/messages`
Adds a new message to the database.
- Requires a JSON body with a `text` field

### GET `/api/cache/reset` 
Clears the message cache, forcing the next cache request to fetch fresh data from the database.

## Caching Strategy

The application implements a simple caching strategy:

1. When `/api/cache` is called, it first checks Redis for data with the key `cached_message`
2. If found, the cached data is returned immediately
3. If not found, the most recent message is fetched from the database and stored in Redis with a 30 seconds expiration
4. Subsequent requests within the hour will receive the cached message

## Setup and Deployment

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

### Getting Started

1. Clone the repository
2. Navigate to the project directory
3. Run the application:

```bash
make up-detached
```

This will build and start all services defined in the docker-compose.yml file.

### Environment Variables

The backend service uses the following environment variables:

- `MYSQL_HOST`: MySQL database hostname (default: 'db')
- `MYSQL_USER`: MySQL username (default: 'root')
- `MYSQL_PASSWORD`: MySQL password
- `MYSQL_DATABASE`: MySQL database name (default: 'appdb')
- `REDIS_HOST`: Redis hostname (default: 'redis')

## Development

### Database Initialization

The MySQL database is initialized with the schema defined in `./backend/db-init.sql`. This SQL script is automatically executed when the container starts for the first time.

### Volumes

The application uses Docker volumes to persist data:

- `db-data`: Stores MySQL database files
- `redis-data`: Stores Redis data
