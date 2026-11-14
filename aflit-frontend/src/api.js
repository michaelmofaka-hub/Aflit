
const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://aflit.onrender.com";


let refreshPromise = null;


async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(
        `${API_BASE_URL}/users/refresh`,
        {
          method: "POST",
          credentials: "include"
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
        }

        throw new Error("Session renewal failed.");
      }

      const data = await response.json();

      localStorage.setItem("token", data.access_token);

      return data.access_token;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}


async function sendRequest(
  endpoint,
  options,
  retry = true,
  timeoutMs = 15000
) {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  try {
    const headers = new Headers(options.headers || {});

    const token = localStorage.getItem("token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
        credentials: "include",
        signal: controller.signal
      }
    );

    if (
      response.status === 401 &&
      retry &&
      endpoint !== "/users/login" &&
      endpoint !== "/users/refresh" &&
      endpoint !== "/users/logout"
    ) {
      const newToken = await refreshAccessToken();

      headers.set(
        "Authorization",
        `Bearer ${newToken}`
      );

      return await sendRequest(
        endpoint,
        {
          ...options,
          headers
        },
        false,
        timeoutMs
      );
    }

    const data = response.status === 204
      ? null
      : await response.json();

    if (!response.ok) {
      throw new Error(
        data?.detail ||
        data?.message ||
        "Request failed."
      );
    }

    return data;

  } catch (error) {
    console.error("API request failed:", error);

    if (error.name === "AbortError") {
      throw new Error(
        "The server took too long to respond. Please try again."
      );
    }

    throw error;

  } finally {
    clearTimeout(timeout);
  }
}


export async function apiRequest(endpoint, options = {}) {
  const {
    timeoutMs = 15000,
    ...requestOptions
  } = options;

  console.log(
    "Sending request:",
    `${API_BASE_URL}${endpoint}`,
    requestOptions.method || "GET"
  );

  return sendRequest(
    endpoint,
    requestOptions,
    true,
    timeoutMs
  );
}
