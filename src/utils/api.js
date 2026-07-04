/**
 * Custom error class for API failures
 */
export class APIError extends Error {
  constructor(type, message, details, status = null) {
    super(message);
    this.type = type;
    this.details = details;
    this.status = status;
    this.name = 'APIError';
  }
}

/**
 * Reusable fetch wrapper that handles network errors, timeouts, and HTTP errors consistently.
 * 
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<any>} - Resolves to the parsed JSON or throws an APIError
 */
export async function fetchWithHandling(url, options = {}) {
  // Add an abort controller for timeouts (default 15s)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    let data = null;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new APIError(
          'NOT_FOUND',
          'The requested resource could not be found.',
          data?.error || data || '404 Not Found',
          404
        );
      } else if (response.status >= 500) {
        throw new APIError(
          'SERVER_ERROR',
          'The server encountered an unexpected error. Please try again.',
          data?.error || data || '500 Server Error',
          response.status
        );
      } else {
        throw new APIError(
          'CLIENT_ERROR',
          data?.error || 'An error occurred with your request.',
          data || `HTTP ${response.status}`,
          response.status
        );
      }
    }

    return data;
  } catch (error) {
    // Determine the type of error if not already an APIError
    if (error instanceof APIError) {
      throw error;
    }
    
    if (error.name === 'AbortError') {
      throw new APIError(
        'TIMEOUT',
        'The request timed out. Please try again.',
        'Request exceeded the maximum allowed time of 15 seconds.'
      );
    }

    // Network error (Failed to fetch)
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new APIError(
        'NETWORK',
        'Unable to connect to the backend server. Please make sure the backend server is running.',
        error.message
      );
    }

    // Generic fallback error
    throw new APIError(
      'UNKNOWN',
      'An unexpected error occurred while communicating with the server.',
      error.message
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
