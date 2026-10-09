import { useState } from 'react'
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

  const [selectedPlatform, setSelectedPlatform] =
    useState(null)

  function toggleConnection(platformName) {
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
                {platform.connected
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
              className={
                platform.connected
                  ? 'platform-button disconnect'
                  : 'platform-button'
              }
              onClick={() =>
                toggleConnection(platform.name)
              }
            >
              {platform.connected
                ? 'Disconnect'
                : 'Connect account'}
            </button>
          </article>
        ))}
      </div>

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
              : 'A real connection will require the platform authorization flow and secure backend token storage.'}
          </p>

          <button
            className="platform-button"
            onClick={() => setSelectedPlatform(null)}
          >
            Close details
          </button>
        </div>
      )}

      <p className="platforms-note">
        Demo mode: connection changes are temporary and reset
        when you reload the page. No social account is
        actually authorized.
      </p>
    </section>
  )
}

export default PlatformsSection