/**
 * RULE-3: Rate Limiting Bypass Test
 * Tests endpoints for rate limiting vulnerabilities by sending rapid requests
 */

const rateLimitingBypassTest = {
  name: "Rate Limiting Bypass",
  id: "RULE-3",
  description: "Tests endpoints for rate limiting bypass vulnerabilities",

  transform: (request) => {
    const modifiedRequests = [];
    const numRequests = Math.floor(Math.random() * (100 - 50 + 1)) + 50; // Random number between 50-100

    // Create multiple identical requests
    for (let i = 0; i < numRequests; i++) {
      // Deep clone the request to avoid modifying the original
      const modifiedRequest = JSON.parse(JSON.stringify(request));

      // Add a timestamp to track request timing
      modifiedRequest._timestamp = Date.now();

      modifiedRequests.push(modifiedRequest);
    }

    return modifiedRequests;
  },

  checkResponse: (responses) => {
    const indicators = {
      hasError: false,
      details: [],
    };

    let successCount = 0;
    let totalTime = 0;
    let previousTimestamp = null;

    // Analyze all responses
    responses.forEach((response, index) => {
      // Check if request was successful
      if (response.status === 200) {
        successCount++;
      }

      // Calculate time between requests
      if (previousTimestamp) {
        totalTime += response._timestamp - previousTimestamp;
      }
      previousTimestamp = response._timestamp;

      // Check for rate limiting headers
      const rateLimitHeaders = [
        "x-ratelimit-limit",
        "x-ratelimit-remaining",
        "retry-after",
        "x-rate-limit-reset",
      ];

      const hasRateLimitHeaders = rateLimitHeaders.some(
        (header) => response.headers && response.headers[header]
      );

      if (!hasRateLimitHeaders && response.status === 200) {
        indicators.details.push("No rate limiting headers detected");
      }
    });

    // Calculate success rate
    const successRate = successCount / responses.length;

    // Check if too many requests were successful
    if (successRate > 0.9) {
      indicators.hasError = true;
      indicators.details.push(
        `High success rate (${(successRate * 100).toFixed(
          2
        )}%) for rapid requests - possible rate limiting bypass vulnerability`
      );
    }

    // Check for server slowdown
    const averageTimeBetweenRequests = totalTime / (responses.length - 1);
    if (averageTimeBetweenRequests < 50) {
      // Less than 50ms between requests
      indicators.hasError = true;
      indicators.details.push(
        "Server accepting requests too quickly - possible rate limiting bypass vulnerability"
      );
    }

    // Check for consistent 200 responses
    if (!responses.some((r) => r.status === 429)) {
      indicators.details.push("No 429 Too Many Requests responses detected");
    }

    return indicators;
  },
};

module.exports = rateLimitingBypassTest;
