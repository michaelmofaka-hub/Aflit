
import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import "./App.css";

const INITIAL_PLATFORMS = [
  {
    name: "YouTube",
    icon: "▶",
    color: "#FF4545",
    connected: false,
    account: "",
    backendId: null,
    status: "disconnected",
    description: "Videos, views, subscribers and revenue.",
  },
  {
    name: "TikTok",
    icon: "♪",
    color: "#5EEAD4",
    connected: false,
    account: "",
    backendId: null,
    status: "disconnected",
    description: "Video views, followers and engagement.",
  },
  {
    name: "Instagram",
    icon: "◎",
    color: "#E879F9",
    connected: false,
    account: "",
    backendId: null,
    status: "disconnected",
    description: "Reels, followers and audience engagement.",
  },
  {
    name: "Facebook",
    icon: "f",
    color: "#60A5FA",
    connected: false,
    account: "",
    backendId: null,
    status: "disconnected",
    description: "Page reach, video views and audience growth.",
  },
];

function PlatformsSection() {
  const [platforms, setPlatforms] = useState(INITIAL_PLATFORMS);
  const [connectingPlatform, setConnectingPlatform] = useState(null);
  const [loadingPlatforms, setLoadingPlatforms] = useState(true);
  const [connectionError, setConnectionError] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPlatforms() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in to load your platforms.");
        }

        const data = await apiRequest("/platform", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the platforms API.");
        }

        if (cancelled) return;

        setPlatforms((current) =>
          current.map((platform) => {
            const match = data.find(
              (item) =>
                String(item.platform_name || "").toLowerCase() ===
                platform.name.toLowerCase()
            );

            if (!match) {
              return {
                ...platform,
                connected: false,
                account: "",
                backendId: null,
                status: "disconnected",
              };
            }

            const status = String(
              match.status || "disconnected"
            ).toLowerCase();

            return {
              ...platform,
              connected: status === "connected",
              account:
                match.channel_title ||
                match.account_name ||
                match.external_account_name ||
                "",
              backendId: match.platform_id || match._id || null,
              status,
            };
          })
        );
      } catch (error) {
        if (!cancelled) {
          setConnectionError(
            error instanceof Error
              ? error.message
              : "Unable to load platform connections."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingPlatforms(false);
        }
      }
    }

    loadPlatforms();

    return () => {
      cancelled = true;
    };
  }, []);

  async function connectYouTube() {
    if (connectingPlatform) return;

    setConnectionError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setConnectionError("Please log in before connecting YouTube.");
      return;
    }

    setConnectingPlatform("YouTube");

    try {
      const data = await apiRequest("/platform/youtube/connect", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!data || typeof data.authorization_url !== "string") {
        throw new Error(
          "The backend did not return an authorization URL. Check the YouTube connect route."
        );
      }

      // Navigate to Google's authorization page.
      window.location.assign(data.authorization_url);
    } catch (error) {
      setConnectionError(
        error instanceof Error
          ? error.message
          : "Unable to start YouTube authorization."
      );
      setConnectingPlatform(null);
    }
  }

  async function disconnectPlatform(platform) {
    if (connectingPlatform) return;

    if (!platform.backendId) {
      setConnectionError(
        `Cannot disconnect ${platform.name}: the backend connection ID is missing.`
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setConnectionError("Please log in again.");
      return;
    }

    setConnectionError("");
    setConnectingPlatform(platform.name);

    try {
      await apiRequest(`/platform/${platform.backendId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPlatforms((current) =>
        current.map((item) =>
          item.name === platform.name
            ? {
                ...item,
                connected: false,
                account: "",
                backendId: null,
                status: "disconnected",
              }
            : item
        )
      );

      setSelectedPlatform(platform.name);
    } catch (error) {
      setConnectionError(
        error instanceof Error
          ? error.message
          : `Unable to disconnect ${platform.name}.`
      );
    } finally {
      setConnectingPlatform(null);
    }
  }

  function handlePlatformClick(platform) {
    setConnectionError("");

    if (platform.connected) {
      disconnectPlatform(platform);
      return;
    }

    if (platform.name === "YouTube") {
      connectYouTube();
      return;
    }

    setConnectionError(
      `${platform.name} authorization is not implemented yet.`
    );
  }

  function getStatusLabel(platform) {
    if (loadingPlatforms) return "Loading...";

    if (connectingPlatform === platform.name) {
      return platform.name === "YouTube" && !platform.connected
        ? "Connecting..."
        : "Disconnecting...";
    }

    if (platform.status === "expired") return "Connection expired";
    if (platform.status === "error") return "Connection error";

    return platform.connected ? "Connected" : "Not connected";
  }

  const connectedCount = platforms.filter(
    (platform) => platform.connected
  ).length;

  const selected = platforms.find(
    (platform) => platform.name === selectedPlatform
  );

  return (
    <section className="platforms-section">
      <div className="platforms-heading">
        <div>
          <h1>Creator Platforms</h1>
          <p>Manage the social accounts you want to track.</p>
        </div>

        <div className="platforms-count">
          {connectedCount} of {platforms.length} connected
        </div>
      </div>

      {connectionError && (
        <p role="alert" className="connection-error">
          {connectionError}
        </p>
      )}

      <div className="platforms-grid">
        {platforms.map((platform) => (
          <article className="platform-card" key={platform.name}>
            <div className="platform-card-heading">
              <span
                className="platform-icon"
                style={{ color: platform.color }}
              >
                {platform.icon}
              </span>

              <span
                className={
                  platform.connected
                    ? "connection-status connected"
                    : "connection-status"
                }
              >
                {getStatusLabel(platform)}
              </span>
            </div>

            <h2>{platform.name}</h2>
            <p>{platform.description}</p>

            {platform.connected && platform.account && (
              <div className="platform-account">
                Account: {platform.account}
              </div>
            )}

            <button
              type="button"
              className={
                platform.connected
                  ? "platform-button disconnect"
                  : "platform-button"
              }
              disabled={loadingPlatforms || connectingPlatform !== null}
              onClick={() => handlePlatformClick(platform)}
            >
              {connectingPlatform === platform.name
                ? platform.connected
                  ? "Disconnecting..."
                  : "Connecting..."
                : platform.connected
                  ? "Disconnect"
                  : "Connect account"}
            </button>

            <button
              type="button"
              className="platform-details-button"
              onClick={() => setSelectedPlatform(platform.name)}
            >
              View details
            </button>
          </article>
        ))}
      </div>

      {selected && (
        <div className="platform-details">
          <h2>{selected.name} connection details</h2>
          <p>
            Status: <strong>{getStatusLabel(selected)}</strong>
          </p>
          <p>
            {selected.connected
              ? "Aflit's backend reports this platform as connected."
              : "This platform is not currently connected."}
          </p>

          <button
            type="button"
            className="platform-button"
            onClick={() => setSelectedPlatform(null)}
          >
            Close details
          </button>
        </div>
      )}

      <p className="platforms-note">
        Connection status comes from Aflit's backend. YouTube uses Google
        authorization. Other platform authorization flows are not yet enabled.
      </p>
    </section>
  );
}

export default PlatformsSection;
