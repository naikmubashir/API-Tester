/**
 * RULE-1: SQL Injection Test
 * Attempts to detect SQL injection vulnerabilities by replacing parameters with malicious SQL strings
 */

const sqlInjectionTest = {
  name: "SQL Injection",
  id: "RULE-1",
  description: "Tests endpoints for SQL injection vulnerabilities",

  transform: (request) => {
    const sqlPayloads = [
      "' OR '1'='1",
      "' OR 1=1--",
      "' OR '1'='1'--",
      '" OR "1"="1',
      "' UNION SELECT NULL--",
      "admin'--",
    ];

    const modifiedRequests = [];

    // Create variations of the request with SQL injection payloads
    for (const payload of sqlPayloads) {
      // Deep clone the request to avoid modifying the original
      const modifiedRequest = JSON.parse(JSON.stringify(request));

      // Modify query parameters if they exist
      if (modifiedRequest.params) {
        Object.keys(modifiedRequest.params).forEach((key) => {
          modifiedRequest.params[key] = payload;
        });
      }

      // Modify body parameters if they exist
      if (modifiedRequest.body && typeof modifiedRequest.body === "object") {
        Object.keys(modifiedRequest.body).forEach((key) => {
          if (typeof modifiedRequest.body[key] === "string") {
            modifiedRequest.body[key] = payload;
          }
        });
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

    // Check for common SQL error messages
    const sqlErrorPatterns = [
      /sql\s*error/i,
      /syntax\s*error/i,
      /ODBC\s*error/i,
      /database\s*error/i,
      /ORA-[0-9]{5}/,
      /mysql_fetch/i,
      /syntax\s*error\s*in\s*sql\s*statement/i,
    ];

    // Check response status
    if (response.status === 500) {
      indicators.hasError = true;
      indicators.details.push(
        "Server returned HTTP 500 error - possible SQL injection vulnerability"
      );
    }

    // Check response body for SQL error patterns
    if (response.data) {
      const responseStr =
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data);

      sqlErrorPatterns.forEach((pattern) => {
        if (pattern.test(responseStr)) {
          indicators.hasError = true;
          indicators.details.push(`SQL error pattern detected: ${pattern}`);
        }
      });
    }

    return indicators;
  },
};

module.exports = sqlInjectionTest;
