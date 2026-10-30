
const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://aflit.onrender.com";


export async function apiRequest(endpoint, options = {}) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {
    console.log(
      "Sending request:",
      `${API_BASE_URL}${endpoint}`,
      options.method || "GET"
    );

    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        signal: controller.signal,
      }
    );

    console.log("Response received:", response.status);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || data.message || "Request failed."
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