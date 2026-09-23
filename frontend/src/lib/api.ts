type ApiErrorBody = {
  detail?: unknown;
  message?: unknown;
};

function formatValidationError(detail: unknown): string | null {
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const error = item as { loc?: unknown[]; msg?: unknown };
        const field = Array.isArray(error.loc) ? error.loc.at(-1) : null;
        const message = typeof error.msg === 'string' ? error.msg : null;
        if (!message) return null;
        return field && field !== 'body' ? `${String(field)}: ${message}` : message;
      })
      .filter((message): message is string => Boolean(message));

    return messages.length > 0 ? messages.join(' ') : null;
  }

  return null;
}

function getStatusMessage(status: number): string {
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 404) return 'The requested item was not found.';
  if (status === 422) return 'Please check the entered values and try again.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'The server could not complete your request. Please try again.';
  return 'The request could not be completed. Please check your input and try again.';
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('datastraw_session_token');
  let res: Response;

  try {
    res = await fetch(path, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error('Unable to reach the server. Make sure the backend is running and try again.');
  }

  if (!res.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      // Use the HTTP status message when the response has no JSON body.
    }

    const detailMessage = formatValidationError(body.detail) || formatValidationError(body.message);
    throw new Error(detailMessage || getStatusMessage(res.status));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
