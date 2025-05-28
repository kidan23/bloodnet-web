// Error handling utilities for API responses

export interface ApiErrorDetail {
  message: string;
  field?: string;
  value?: any;
}

export interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  category: string;
  errors: ApiErrorDetail[];
  stack?: string;
}

/**
 * Extract user-friendly error message from API error response
 * @param error - The error object from the API call
 * @returns A user-friendly error message
 */
export function extractErrorMessage(error: any): string {
  // Handle case where error.response.data contains the structured error
  if (error?.response?.data) {
    const errorData = error.response.data as ApiErrorResponse;
    
    // If we have structured errors, extract the messages
    if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      // If there's only one error, return just the message
      if (errorData.errors.length === 1) {
        return errorData.errors[0].message;
      }
      
      // If there are multiple errors, combine them
      const messages = errorData.errors.map(err => err.message);
      return messages.join('. ');
    }
  }
  
  // Handle case where error has a direct message
  if (error?.message) {
    return error.message;
  }
  
  // Handle case where error.response has a status text
  if (error?.response?.statusText) {
    return error.response.statusText;
  }
  
  // Final fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Extract error summary for toast notification
 * @param error - The error object from the API call
 * @returns An object with summary and detail for toast
 */
export function extractErrorForToast(error: any): { summary: string; detail: string } {
  const errorMessage = extractErrorMessage(error);
  
  // Handle case where error.response.data contains the structured error
  if (error?.response?.data) {
    const errorData = error.response.data as ApiErrorResponse;
    
    // Determine summary based on error category
    let summary = 'Error';
    
    if (errorData.category) {
      switch (errorData.category) {
        case 'VALIDATION_ERROR':
          summary = 'Validation Error';
          break;
        case 'AUTHENTICATION_ERROR':
          summary = 'Authentication Error';
          break;
        case 'AUTHORIZATION_ERROR':
          summary = 'Authorization Error';
          break;
        case 'DATABASE_ERROR':
        case 'MONGOOSE_ERROR':
          summary = 'Database Error';
          break;
        case 'API_ERROR':
          summary = 'API Error';
          break;
        default:
          summary = 'Error';
      }
    }
    
    return {
      summary,
      detail: errorMessage
    };
  }
  
  return {
    summary: 'Error',
    detail: errorMessage
  };
}

/**
 * Check if error is a validation error
 * @param error - The error object from the API call
 * @returns true if it's a validation error
 */
export function isValidationError(error: any): boolean {
  return error?.response?.data?.category === 'VALIDATION_ERROR';
}

/**
 * Check if error is an authentication error
 * @param error - The error object from the API call
 * @returns true if it's an authentication error
 */
export function isAuthenticationError(error: any): boolean {
  return error?.response?.data?.category === 'AUTHENTICATION_ERROR';
}

/**
 * Check if error is an authorization error
 * @param error - The error object from the API call
 * @returns true if it's an authorization error
 */
export function isAuthorizationError(error: any): boolean {
  return error?.response?.data?.category === 'AUTHORIZATION_ERROR';
}
