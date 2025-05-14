/**
 * Format success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @returns {Object} - Formatted response object
 */
export const formatSuccess = (data, message = 'Success') => {
    return {
      success: true,
      message,
      data
    };
  };
  
  /**
   * Format error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @returns {Object} - Formatted error object
   */
  export const formatError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  };