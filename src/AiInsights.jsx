import './App.css'

function AIInsights() {
  const insights = [
    {
      category: 'Growth',
      title: 'Explore short-form content',
      description:
        'Test more short videos and compare their performance with your regular content.',
      priority: 'High',
      icon: '↗'
    },
    {
      category: 'Engagement',
      title: 'Understand your audience',
      description:
        'Compare engagement across posts to discover which topics encourage more interaction.',
      priority: 'Medium',
      icon: '◎'
    },
    {
      category: 'Monetization',
      title: 'Explore revenue opportunities',
      description:
        'Consider digital products or memberships that match your audience interests.',
      priority: 'Medium',
      icon: '◆'
    }
  ]

  return (
    <section className="ai-insights">
      <div className="ai-insights-heading">
        <div>
          <span className="ai-label">AFLIT INTELLIGENCE</span>
          <h2>AI Insights</h2>
          <p>Ideas to help you grow as a creator.</p>
        </div>

        <span className="ai-status">● Preview</span>
      </div>

      <div className="insights-list">
        {insights.map((insight) => (
          <article
            className="insight-card"
            key={insight.title}
          >
            <div className="insight-icon">
              {insight.icon}
            </div>

            <div className="insight-content">
              <div className="insight-meta">
                <span className="insight-category">
                  {insight.category}
                </span>

                <span className={`priority ${insight.priority.toLowerCase()}`}>
                  {insight.priority} priority
                </span>
              </div>

              <h3>{insight.title}</h3>
              <p>{insight.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default AIInsights