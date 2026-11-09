
import './App.css'

const platformBackgrounds = {
  youtube: '/youtube.png',
  tiktok: '/tiktok.png',
  instagram: '/instagram.png',
  facebook: '/facebook.png'
}

function MetricCard({ platform = 'youtube', metrics = [] }) {
  const platformName =
    platform.charAt(0).toUpperCase() + platform.slice(1)

  const backgroundImage =
    platformBackgrounds[platform.toLowerCase()] || '/default.png'

  return (
    <section
      className="metrics-overview"
      style={{
        backgroundImage: `url("${backgroundImage}")`
      }}
    >
      <div className="metrics-overview-top">
        <div>
          <span className="overview-label">PLATFORM OVERVIEW</span>
          <h2>{platformName}</h2>
        </div>

        <span className="overview-platform-status">
          {platformName} Analytics
        </span>
      </div>

      <div className="metrics-overview-bottom">
        {metrics.map((metric) => (
          <article className="overview-metric" key={metric.title}>
            <p>{metric.title}</p>
            <h3>{metric.value}</h3>
          </article>
        ))}
      </div>
    </section>
  )
}

export default MetricCard
