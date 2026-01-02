/**
 * HTTP client abstraction for cross-origin requests.
 * Provides GM_xmlhttpRequest, fetch, and mock implementations.
 */

/** HTTP response interface */
export interface HttpResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}

/** Request options interface */
export interface HttpRequestOptions {
    headers?: Record<string, string>;
    timeout?: number;
}

/** HTTP client interface for dependency injection */
export interface HttpClient {
    get<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
    post<T>(url: string, body: unknown, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
    put<T>(url: string, body: unknown, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
    delete<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
}

/**
 * Parses response headers string into an object.
 */
function parseResponseHeaders(headersString: string): Record<string, string> {
    const headers: Record<string, string> = {};
    if (!headersString) return headers;

    const lines = headersString.trim().split('\n');
    for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim().toLowerCase();
            const value = line.substring(colonIndex + 1).trim();
            headers[key] = value;
        }
    }
    return headers;
}

/**
 * Makes a GM_xmlhttpRequest call wrapped in a Promise.
 */
function gmRequest<T>(
    method: string,
    url: string,
    body?: unknown,
    options?: HttpRequestOptions
): Promise<HttpResponse<T>> {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: method as 'GET' | 'POST' | 'PUT' | 'DELETE',
            url,
            headers: options?.headers,
            timeout: options?.timeout,
            data: body ? JSON.stringify(body) : undefined,
            responseType: 'json',
            onload: (response) => {
                if (response.status >= 200 && response.status < 300) {
                    resolve({
                        data: response.response as T,
                        status: response.status,
                        statusText: response.statusText,
                        headers: parseResponseHeaders(response.responseHeaders),
                    });
                } else {
                    reject(new Error(`HTTP ${response.status}: ${response.statusText}`));
                }
            },
            onerror: (error) => {
                reject(new Error(`Request failed: ${error.error || 'Unknown error'}`));
            },
            ontimeout: () => {
                reject(new Error('Request timed out'));
            },
        });
    });
}

/**
 * GM_xmlhttpRequest-based HTTP client for cross-origin requests.
 */
export const gmHttpClient: HttpClient = {
    get<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
        return gmRequest<T>('GET', url, undefined, options);
    },

    post<T>(url: string, body: unknown, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
        return gmRequest<T>('POST', url, body, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options?.headers },
        });
    },

    put<T>(url: string, body: unknown, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
        return gmRequest<T>('PUT', url, body, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options?.headers },
        });
    },

    delete<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
        return gmRequest<T>('DELETE', url, undefined, options);
    },
};

/** Mock HTTP client with call tracking */
export interface MockHttpClient extends HttpClient {
    calls: { method: string; url: string; body?: unknown; options?: HttpRequestOptions }[];
    mockGet: <T>(response: HttpResponse<T>) => void;
    mockPost: <T>(response: HttpResponse<T>) => void;
    mockPut: <T>(response: HttpResponse<T>) => void;
    mockDelete: <T>(response: HttpResponse<T>) => void;
    mockError: (error: Error) => void;
}

/**
 * Creates a mock HTTP client for testing.
 */
export function createMockHttpClient(): MockHttpClient {
    let mockResponse: HttpResponse<unknown> | null = null;
    let mockErr: Error | null = null;
    const calls: MockHttpClient['calls'] = [];

    const makeRequest = async <T>(
        method: string,
        url: string,
        body?: unknown,
        options?: HttpRequestOptions
    ): Promise<HttpResponse<T>> => {
        calls.push({ method, url, body, options });
        if (mockErr) throw mockErr;
        if (mockResponse) return mockResponse as HttpResponse<T>;
        return { data: {} as T, status: 200, statusText: 'OK', headers: {} };
    };

    return {
        calls,
        get: <T>(url: string, options?: HttpRequestOptions) => makeRequest<T>('GET', url, undefined, options),
        post: <T>(url: string, body: unknown, options?: HttpRequestOptions) => makeRequest<T>('POST', url, body, options),
        put: <T>(url: string, body: unknown, options?: HttpRequestOptions) => makeRequest<T>('PUT', url, body, options),
        delete: <T>(url: string, options?: HttpRequestOptions) => makeRequest<T>('DELETE', url, undefined, options),
        mockGet: <T>(response: HttpResponse<T>) => { mockResponse = response; },
        mockPost: <T>(response: HttpResponse<T>) => { mockResponse = response; },
        mockPut: <T>(response: HttpResponse<T>) => { mockResponse = response; },
        mockDelete: <T>(response: HttpResponse<T>) => { mockResponse = response; },
        mockError: (error: Error) => { mockErr = error; },
    };
}
