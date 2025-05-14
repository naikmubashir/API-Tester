/**
 * RULE-4: Basic Availability Test
 * Simple test to verify endpoint availability and response
 */

const basicAvailabilityTest = {
    name: "Basic Availability",
    id: "RULE-4",
    description: "Tests if endpoints are available and responding",

    transform: (request) => {
        // Simply pass through the original request
        const modifiedRequest = JSON.parse(JSON.stringify(request));
        return [modifiedRequest]; // Return array with single request
    },

    checkResponse: (response) => {
        const indicators = {
            hasError: false,
            details: []
        };

        // Consider 2xx and 3xx responses as successful
        if (response.status >= 200 && response.status < 400) {
            indicators.details.push("Endpoint is accessible and responding");
        } else {
            indicators.hasError = true;
            indicators.details.push(`Endpoint returned status ${response.status}`);
        }

        return indicators;
    }
};

module.exports = basicAvailabilityTest;