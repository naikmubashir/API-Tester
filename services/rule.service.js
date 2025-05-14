const axios = require("axios");
const Request = require("../models/Request");
const ProcessedRequest = require("../models/ProcessedRequest");
const sqlInjectionRule = require("../rules/sql-injection");
const nosqlInjectionRule = require("../rules/nosql-injection");
const rateLimitingRule = require("../rules/rate-limiting-bypass");
const basicAvailabilityTest = require('../rules/basic-availability');

const RULES = {
  "RULE-1": sqlInjectionRule,
  "RULE-2": nosqlInjectionRule,
  "RULE-3": rateLimitingRule,
  'RULE-4': basicAvailabilityTest
};

const applyRuleToRequest = async (requestId, ruleId, scanId) => {
  // 1. Load request document
  const reqDoc = await Request.findById(requestId);
  if (!reqDoc) throw new Error("Request not found");
        console.log('[CHECK 6]')

  // 2. Get the appropriate rule
  const rule = RULES[ruleId];
  if (!rule) throw new Error("Rule not found");

  // 3. Execute the rule transformation
  const modifiedRequests = rule.transform(reqDoc);
          console.log('[CHECK 7]', 'TRANSFORMED',modifiedRequests)

  // Process and store each modified request
  const processedRequests = await Promise.all(
    modifiedRequests.map(async (modifiedReq) => {
              console.log('[CHECK 8]')

      const processed = new ProcessedRequest({
        path: modifiedReq.path || reqDoc.path,
        method: modifiedReq.method || reqDoc.method,
        scan: scanId,
        request: {
          body: modifiedReq.body || reqDoc.body,
          headers: modifiedReq.headers || reqDoc.headers,
          query: modifiedReq.query || reqDoc.query,
        },
      });
        console.log('[CHECK 9]')

      try {
        const method = processed.method?.toLowerCase() || "get";
        const fullUrl = `${process.env.HOST}${processed.path}`;

        const response = await axios({
          method,
          url: fullUrl,
          headers: processed.request.headers,
          data: processed.request.body,
          params: processed.request.query,
        });
        console.log('[CHECK 10]')

        processed.response = {
          status: response.status,
          headers: response.headers,
          body: response.data,
        };

        // Apply rule's response check
        const checkResult = rule.checkResponse(processed.response);
        console.log('CheCKReSULT',checkResult)
        processed.vulnerabilities = checkResult;
      } catch (error) {
        processed.response = {
          status: error.response?.status || 500,
          error: error.message,
        };
        // Even for errors, check the response
        processed.vulnerabilities = rule.checkResponse(processed.response);
      }

      return processed.save();
    })
  );

  return processedRequests;
};

const applyRuleToAllRequests = async (ruleId, scanId) => {
  // Get all requests
  const reqDocs = await Request.find();

  // Get the appropriate rule
  const rule = RULES[ruleId];
  if (!rule) throw new Error("Rule not found");

  // Process all requests
  const processedRequests = await Promise.all(
    reqDocs.map(async (req) => {
      return await applyRuleToRequest(req._id, ruleId, scanId);
    })
  );

  // Flatten the array since each request might generate multiple processed requests
  return processedRequests.flat();
};

// Export the functions and rules that need to be used by other modules
module.exports = {
  RULES,
  applyRuleToRequest,
  applyRuleToAllRequests,
};
