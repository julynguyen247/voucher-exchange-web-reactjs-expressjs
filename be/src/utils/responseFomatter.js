/**
 * Creates a standardized success response
 * @param {string} message - Success message
 * @param {object} data - Response data payload (optional)
 * @returns {object} Standardized success response
 */
const successResponse = (message, data = null) => {
  const response = {
    success: true,
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  return response;
};

/**
 * Creates a standardized error response
 * @param {string} message - Error message
 * @param {string|number} code - Error code (optional) 
 * @param {object} details - Additional error details (optional)
 * @returns {object} Standardized error response
 */
const errorResponse = (message, code = null, details = null) => {
  const response = {
    success: false,
    message
  };
  
  if (code || details) {
    response.error = {};
    
    if (code) {
      response.error.code = code;
    }
    
    if (details) {
      response.error.details = details;
    }
  }
  
  return response;
};

module.exports = {
  successResponse,
  errorResponse
};