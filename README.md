Here's the updated README with the MySQL and Redis installation guide included:

---

# Key-Value Store Service

A high-performance, scalable key-value data store service built with TypeScript, supporting TTL, batch operations, and multi-tenancy for enhanced isolation and performance.

## Features

- **CRUD Operations**: Supports Create, Read, and Delete operations on key-value pairs.
- **TTL Support**: Allows setting a Time-to-Live (TTL) for each key, automatically expiring data beyond this period.
- **Batch API**: Provides a batch create API to handle multiple key-value pairs in a single request, enhancing efficiency.
- **Multi-Tenancy**: Implements tenant-based isolation, ensuring each client has separate storage limits.
- **Rate Limiting**: Prevents abuse by limiting the number of requests per tenant.
- **Periodic Cleanup**: Includes a background job to clear expired keys based on TTL.

---

## Project Structure

```plaintext
key-value-store
├── src
│   ├── config
│   │   ├── config.ts
│   │   └── database.ts
│   ├── controllers
│   │   └── objectController.ts
│   ├── middlewares
│   │   ├── rateLimiter.ts
│   │   └── errorHandler.ts
│   ├── models
│   │   └── kvModel.ts
│   ├── services
│   │   └── objectService.ts
│   ├── utils
│   │   ├── cleanupExpired.ts
│   │   └── logger.ts
│   ├── cache
│   │   └── redisClient.ts
│   ├── index.ts
│   └── types
│       └── index.d.ts
├── tests
│   └── object.test.ts
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Setup

### 1. Install Dependencies
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory with the following configuration:

```plaintext
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=key_value_store
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Database Setup (MySQL)
1. **Install MySQL**:
   - On **macOS**:  
     ```bash
     brew install mysql
     ```
   - On **Ubuntu**:  
     ```bash
     sudo apt update
     sudo apt install mysql-server
     ```

2. **Start MySQL Service**:
   - On **macOS**:  
     ```bash
     brew services start mysql
     ```
   - On **Ubuntu**:  
     ```bash
     sudo service mysql start
     ```

3. **Create Database**:
   Log in to MySQL and create the database:
   ```bash
   mysql -u root -p
   CREATE DATABASE key_value_store;
   ```

4. **Set Database User**:
   Update `.env` with the correct `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.

### 4. Redis Setup
1. **Install Redis**:
   - On **macOS**:
     ```bash
     brew install redis
     ```
   - On **Ubuntu**:
     ```bash
     sudo apt update
     sudo apt install redis-server
     ```

2. **Start Redis**:
   - On **macOS**:
     ```bash
     brew services start redis
     ```
   - On **Ubuntu**:
     ```bash
     sudo service redis-server start
     ```

3. **Configure Redis**:
   Update `.env` with the correct `REDIS_HOST` and `REDIS_PORT`.

### 5. Run the Service
Start the application in development mode:
```bash
npm run dev
```

### 6. Testing
Run the test suite:
```bash
npm test
```

---

## API Endpoints

### **POST /api/object**
Creates a new key-value pair.

- **Request Body**:
  ```json
  {
    "key": "<String>",
    "data": "<Object>",
    "ttl": "<Number>"
  }
  ```
- **Responses**:
  - `201 Created` if successful.
  - `400 Bad Request` if the key already exists or input validation fails.

### **GET /api/object/:key**
Retrieves the value associated with a given key.

- **Response**:
  - `200 OK` with the JSON data if the key is found.
  - `404 Not Found` if the key does not exist.

### **DELETE /api/object/:key**
Deletes a key-value pair by key.

- **Response**:
  - `200 OK` if the key is deleted successfully.
  - `404 Not Found` if the key does not exist.

### **POST /api/batch**
Creates multiple key-value pairs in a single batch request.

- **Request Body**:
  ```json
  [
    {
      "key": "<String>",
      "data": "<Object>",
      "ttl": "<Number>"
    },
    ...
  ]
  ```
- **Responses**:
  - `201 Created` if all key-value pairs are created successfully.
  - `400 Bad Request` if any keys are duplicated or validation fails.

---

## Design Decisions

- **Redis Caching**: Integrated Redis to store TTL-based data and improve retrieval speeds. Keys with TTL are cached for faster access and automatic expiration.
- **Tenant Isolation**: Enforces tenant-specific storage limits for isolated, fair usage.
- **Periodic Cleanup**: Uses a cron job to regularly remove expired entries from the database.
- **Rate Limiting**: Limits requests per tenant to ensure system stability and prevent abuse.

---

## Additional Information

### Concurrency
Implemented transaction handling and database locking to allow concurrent data access.

### Error Handling
Comprehensive error responses are provided for invalid requests, including exceeding limits, duplicate keys, and other common edge cases.

### Logging
Basic logging setup with `winston` for tracking errors and activity.

---

## Scripts

- **`npm run dev`** - Starts the development server.
- **`npm run build`** - Builds TypeScript files to JavaScript in the `dist` directory.
- **`npm start`** - Runs the compiled code in production.
- **`npm test`** - Runs tests with Jest.

---

## Testing

The project includes unit and integration tests covering:

- CRUD functionality for key-value pairs.
- TTL expiration.
- Multi-tenancy and storage limits.
- Rate limiting.

---

## Future Enhancements

- **Advanced Caching Strategies**: Implement caching based on read frequency with eviction policies.
- **Enhanced Rate Limiting**: Dynamic rate limits based on tenant activity.
- **Database Flexibility**: Add support for PostgreSQL and other databases.
- **High Availability**: Explore sharding and replication for larger deployments.

---

## Example Usage

Use `curl` to test the API endpoints:

```bash
curl -X POST http://localhost:3000/api/object \
-H "Content-Type: application/json" \
-H "tenant-id: tenant1" \
-d '{
  "key": "exampleKey",
  "data": { "message": "Hello, World!" },
  "ttl": 3600
}'
```

---

## License

This project is licensed under the MIT License.

## Author

Muniyappan Mani

---

This version has the MySQL and Redis installation guides added for a complete setup. Let me know if you need any further updates!