import './App.css'

function ContentPerformance() {
  const content = [
    {
      title: "How I Grew My Channel",
      platform: "YouTube",
      views: "8,420",
      engagement: "6.8%"
    },
    {
      title: "My Creator Journey",
      platform: "TikTok",
      views: "5,210",
      engagement: "8.2%"
    },
    {
      title: "Behind the Scenes",
      platform: "Instagram",
      views: "3,840",
      engagement: "4.5%"
    }
  ]

  return (
    <section className="content-performance">
      <h2>Content Performance</h2>

      <p className="section-description">
        See how your content is performing across platforms.
      </p>

      <div className="content-list">
        <div className="content-header">
  <span>Content</span>
  <span>Views</span>
  <span>Engagement</span>
</div>
        {content.map((item) => (
          <div className="content-item" key={item.title}>
            <div className="content-details">
              <h3>{item.title}</h3>
              <span className={`platform-badge ${item.platform.toLowerCase()}`}>
  {item.platform}
</span>
            </div>

            <div className="content-stat">
              <span>Views</span>
              <strong>{item.views}</strong>
            </div>

            <div className="content-stat">
              <span>Engagement</span>
              <strong>{item.engagement}</strong>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ContentPerformance