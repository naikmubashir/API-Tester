# API-Tester

A powerful security testing platform designed for penetration testers, security professionals, and developers to identify and assess vulnerabilities in API endpoints through comprehensive security testing.

## Overview

API-Tester is a security assessment platform that streamlines API security testing workflow. It leverages Swagger/OpenAPI documentation to import API endpoints and applies targeted security rules to identify potential vulnerabilities. The platform supports various security test cases including SQL injection, NoSQL injection, rate limiting bypass attempts, and more. With detailed reporting and historical tracking, it helps teams maintain robust API security across their applications.

## Key Features

### API Documentation Integration

- Seamless integration with any Swagger/OpenAPI specification URL
- Intelligent endpoint analysis and security testing
- Support for multiple API versions and endpoints
- Customizable request parameters for thorough testing

### Security Testing Capabilities

1. **SQL Injection Testing (RULE-1)**

   - Multiple SQL injection patterns
   - Error-based detection
   - Union-based injection attempts
   - Authentication bypass attempts

2. **NoSQL Injection Testing (RULE-2)**

   - MongoDB operator injection
   - Null byte injection
   - Boolean-based attacks
   - Authentication bypass using NoSQL operators

3. **Rate Limiting Tests (RULE-3)**

   - Concurrent request flooding
   - Rate limit bypass detection
   - Header manipulation tests
   - Response time analysis

4. **Basic Availability Testing (RULE-4)**
   - Endpoint accessibility verification
   - Response code validation
   - Basic health checks

### Advanced Features

- Real-time test execution and monitoring
- Detailed vulnerability reports
- Historical scan results tracking
- Request/Response analysis
- Customizable test parameters

## Technical Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React, TypeScript, Vite
- **Database**: MongoDB
- **Documentation**: Swagger/OpenAPI
- **Testing Framework**: Custom rule-based testing engine

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd API-Tester

# Install dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Create environment file
cp .env.example .env

# Start the application
npm run dev
```

## Usage

### 1. API Documentation Import

```bash
# Import Swagger documentation
POST /api/fetch
{
  "url": "https://your-api.com/swagger.json"
}
```

### 2. Running Security Scans

```bash
# Start a new scan
POST /api/scans
{
  "ruleId": "RULE-1",  // SQL Injection Test
  "apiInfoId": "your-api-id"
}
```

### 3. Viewing Results

- Access the dashboard at `http://localhost:3000`
- View detailed scan reports
- Analyze individual endpoint results

## API Endpoints

### Core Endpoints

- `POST /api/fetch` - Import Swagger documentation
- `GET /api/requests` - List all API endpoints
- `POST /api/scans` - Start new security scan
- `GET /api/processed-requests` - View test results

### Rule Management

- `GET /api/rules` - List available security rules
- `GET /api/rules/:id` - Get a custom rule

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security

For security issues, please email snapsec@gmail.com or create a security advisory issue.
Contributions are welcome. Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
