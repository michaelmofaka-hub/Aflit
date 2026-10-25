import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import './App.css'

function PlatformsSection() {
  const [platforms, setPlatforms] = useState([
    {
      name: 'YouTube',
      icon: '▶',
      color: '#FF4545',
      connected: true,
      account: 'Demo Creator',
      description: 'Videos, views, subscribers and revenue.'
    },
    {
      name: 'TikTok',
      icon: '♪',
      color: '#5EEAD4',
      connected: false,
      account: '',
      description: 'Video views, followers and engagement.'
    },
    {
      name: 'Instagram',
      icon: '◎',
      color: '#E879F9',
      connected: false,
      account: '',
      description: 'Reels, followers and audience engagement.'
    },
    {
      name: 'Facebook',
      icon: 'f',
      color: '#60A5FA',
      connected: false,
      account: '',
      description: 'Page reach, video views and audience growth.'
    }
  ])
  useEffect(() => {
  async function loadPlatforms() {
    const token = localStorage.getItem("token");

    // We'll add the API request here.
    if (!token) {
  setConnectionError("Please log in to load your platforms.");
  return;
}
    const data = await apiRequest("/platform", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
    setPlatforms((previousPlatforms) =>
  previousPlatforms.map((platform) => {
    const backendPlatform = data.find(
      (item) => item.platform_name === platform.name
    );

    if (!backendPlatform) {
      return platform;
    }

    return {
      ...platform,
      connected: backendPlatform.status === "connected",
    };
  })
);
  }

  loadPlatforms();
}, []);
  const [selectedPlatform, setSelectedPlatform] =
    useState(null)

  const [connectingPlatform, setConnectingPlatform] =
    useState(null)

  const [connectionError, setConnectionError] =
    useState('')

  async function toggleConnection(platformName) {
    // Prevent another connection attempt while one is running.
    if (connectingPlatform !== null) return

    // Clear errors from previous attempts.
    setConnectionError('')

    // Show which platform is processing.
    setConnectingPlatform(platformName)

    try {
      // DEMO ONLY: simulate a short connection delay.
      // This does not contact Aflit's backend.
      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      )

      setPlatforms((previousPlatforms) =>
        previousPlatforms.map((platform) =>
          platform.name === platformName
            ? {
                ...platform,
                connected: !platform.connected,
                account: platform.connected
                  ? ''
                  : 'Demo Account'
              }
            : platform
        )
      )

      setSelectedPlatform(platformName)
    } catch (error) {
      setConnectionError(
        error instanceof Error
          ? error.message
          : 'Unable to update the connection.'
      )
    } finally {
      // Always stop the loading state.
      setConnectingPlatform(null)
    }
  }

  const connectedCount = platforms.filter(
    (platform) => platform.connected
  ).length

  const selected = platforms.find(
    (platform) => platform.name === selectedPlatform
  )

  return (
    <section className="platforms-section">
      <div className="platforms-heading">
        <div>
          <h1>Creator Platforms</h1>
          <p>
            Manage the social accounts you want to track.
          </p>
        </div>

        <div className="platforms-count">
          {connectedCount} of {platforms.length} connected
        </div>
      </div>

      <div className="platforms-grid">
        {platforms.map((platform) => (
          <article
            className="platform-card"
            key={platform.name}
          >
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
                    ? 'connection-status connected'
                    : 'connection-status'
                }
              >
                {connectingPlatform === platform.name
                  ? 'Connecting...'
                  : platform.connected
                    ? 'Connected'
                    : 'Not connected'}
              </span>
            </div>

            <h2>{platform.name}</h2>
            <p>{platform.description}</p>

            {platform.connected && (
              <div className="platform-account">
                Account: {platform.account}
              </div>
            )}

            <button
              type="button"
              className={
                platform.connected
                  ? 'platform-button disconnect'
                  : 'platform-button'
              }
              disabled={connectingPlatform !== null}
              onClick={() =>
                toggleConnection(platform.name)
              }
            >
              {connectingPlatform === platform.name
                ? 'Connecting...'
                : platform.connected
                  ? 'Disconnect'
                  : 'Connect account'}
            </button>
          </article>
        ))}
      </div>

      {connectionError && (
        <p role="alert">
          {connectionError}
        </p>
      )}

      {selected && (
        <div className="platform-details">
          <h2>{selected.name} connection details</h2>

          <p>
            Status:{' '}
            <strong>
              {selected.connected
                ? 'Connected in demo mode'
                : 'Not connected'}
            </strong>
          </p>

          <p>
            {selected.connected
              ? 'This is a simulated connection. Real account data is not being retrieved yet.'
              : 'A real connection requires platform authorization and secure backend token storage.'}
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
        Demo mode: connection changes are temporary and
        reset when you reload the page. No social account
        is actually authorized.
      </p>
    </section>
  )
}

export default PlatformsSection
