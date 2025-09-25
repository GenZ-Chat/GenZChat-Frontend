
import axios from "axios"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})


// Log file API requests
api.interceptors.request.use(request => {
  console.log('[FILE API REQUEST]', {
    url: request.url,
    method: request.method,
    headers: {
      'Content-Type': request.headers['Content-Type'],
      'Content-Length': request.headers['Content-Length']
    },
    timestamp: new Date().toISOString()
  });
  return request;
});

// Log file API responses
api.interceptors.response.use(
  response => {
    console.log('[FILE API RESPONSE]', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    if (error.response) {
      console.error('[FILE API ERROR]', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.error('[FILE API ERROR]', error);
    }
    return Promise.reject(error);
  }
);

// Log all API requests
api.interceptors.request.use(request => {
  console.log('[API REQUEST]', {
    url: request.url,
    method: request.method,
    data: request.data,
    params: request.params,
    headers: request.headers
  });
  return request;
});

// Log all API responses
api.interceptors.response.use(
  response => {
    console.log('[API RESPONSE]', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    if (error.response) {
      console.error('[API ERROR]', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.error('[API ERROR]', error);
    }
    return Promise.reject(error);
  }
);

// Logger for requests
api.interceptors.request.use(request => {
  console.log(`[API REQUEST]`, {
    url: request.url,
    method: request.method,
    data: request.data,
    params: request.params,
    headers: request.headers
  });
  return request;
});

// Logger for responses
api.interceptors.response.use(
  response => {
    console.log(`[API RESPONSE]`, {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    if (error.response) {
      console.error(`[API ERROR]`, {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.error(`[API ERROR]`, error);
    }
    return Promise.reject(error);
  }
);
