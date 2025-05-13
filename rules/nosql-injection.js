/**
 * RULE-2: NoSQL Injection Test
 * Tests endpoints for NoSQL injection vulnerabilities by injecting special MongoDB operators
 */

const nosqlInjectionTest = {
  name: "NoSQL Injection",
  id: "RULE-2",
  description: "Tests endpoints for NoSQL injection vulnerabilities",

  transform: (request) => {
    const nosqlPayloads = [
      { $ne: null },
      { $gt: "" },
      { $where: "1==1" },
      { $exists: true },
      { $gt: null },
      { $regex: ".*" },
    ];

    const modifiedRequests = [];

    // Create variations of the request with NoSQL injection payloads
    for (const payload of nosqlPayloads) {
      // Deep clone the request to avoid modifying the original
      const modifiedRequest = JSON.parse(JSON.stringify(request));

      // Modify body parameters if they exist
      if (modifiedRequest.body && typeof modifiedRequest.body === "object") {
        Object.keys(modifiedRequest.body).forEach((key) => {
          modifiedRequest.body[key] = payload;
        });
      }

      // Special case for authentication endpoints
      if (
        modifiedRequest.body &&
        (modifiedRequest.body.username || modifiedRequest.body.email)
      ) {
        modifiedRequest.body = {
          username: { $ne: null },
          password: { $ne: null },
        };
      }

      modifiedRequests.push(modifiedRequest);
    }

    return modifiedRequests;
  },

  checkResponse: (response) => {
    const indicators = {
      hasError: false,
      details: [],
    };

    // Check for successful response with invalid credentials
    if (response.status === 200) {
      indicators.hasError = true;
      indicators.details.push(
        "Endpoint returned 200 OK with potentially invalid credentials - possible NoSQL injection vulnerability"
      );
    }

    // Check for MongoDB-specific error messages
    const nosqlErrorPatterns = [
      /mongodb/i,
      /mongoose/i,
      /bson/i,
      /objectid/i,
      /\$where/i,
      /\$ne/i,
    ];

    // Check response body for NoSQL error patterns
    if (response.data) {
      const responseStr =
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data);

      nosqlErrorPatterns.forEach((pattern) => {
        if (pattern.test(responseStr)) {
          indicators.hasError = true;
          indicators.details.push(`NoSQL error pattern detected: ${pattern}`);
        }
      });
    }

    return indicators;
  },
};

module.exports = nosqlInjectionTest;
