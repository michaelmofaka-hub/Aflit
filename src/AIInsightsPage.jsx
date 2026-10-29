import { useState } from 'react'
import './App.css'

function AIInsightsPage() {
  const [filter, setFilter] = useState('All')

  const insights = [
    {
      id: 1,
      category: 'Growth',
      priority: 'High',
      title: 'Explore short-form content',
      explanation:
        'Short videos may help your content reach new viewers.',
      action:
        'Test short videos and compare their views with your other posts.'
    },
    {
      id: 2,
      category: 'Engagement',
      priority: 'Medium',
      title: 'Understand your audience',
      explanation:
        'Knowing what your viewers respond to can guide future content.',
      action:
        'Compare engagement across your recent posts.'
    },
    {
      id: 3,
      category: 'Monetization',
      priority: 'Medium',
      title: 'Explore revenue opportunities',
      explanation:
        'Different content formats may create different earning opportunities.',
      action:
        'Review eligible monetization options on your connected platforms.'
    }
  ]

  const categories = [
    'All',
    'Growth',
    'Engagement',
    'Monetization'
  ]

  const filteredInsights =
    filter === 'All'
      ? insights
      : insights.filter(
          (insight) => insight.category === filter
        )

  return (
    <section className="ai-insights-page">
      <div className="ai-insights-heading">
        <div>
          <h1>AI Insights</h1>
          <p>
            Discover opportunities to improve your creator
            performance.
          </p>
        </div>
        <span className="demo-label">DEMO INSIGHTS</span>
      </div>

      <div className="insight-filters">
        {categories.map((category) => (
          <button
            key={category}
            className={
              filter === category
                ? 'range-button active'
                : 'range-button'
            }
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="ai-insights-list">
        {filteredInsights.map((insight) => (
          <article
            className="ai-insight-detail"
            key={insight.id}
          >
            <div className="ai-insight-detail-top">
              <span className="insight-category">
                {insight.category}
              </span>

              <span
                className={`priority ${
                  insight.priority.toLowerCase()
                }`}
              >
                {insight.priority} priority
              </span>
            </div>

            <h2>{insight.title}</h2>
            <p>{insight.explanation}</p>

            <div className="insight-action">
              <strong>Suggested action</strong>
              <p>{insight.action}</p>
            </div>
          </article>
        ))}
      </div>

      <p className="insights-disclaimer">
        These are sample recommendations, not yet generated
        from your real platform analytics.
      </p>
    </section>
  )
}

export default AIInsightsPage