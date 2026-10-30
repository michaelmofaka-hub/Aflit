import './App.css'

function AudienceAnalytics() {
  const audience = [
    { label: 'Returning viewers', value: '38%', change: '+6.2%' },
    { label: 'New viewers', value: '62%', change: '+12.4%' },
    { label: 'Subscribers gained', value: '284', change: '+8.7%' }
  ]

  const demographics = [
    { country: 'Kenya', percentage: 45 },
    { country: 'United States', percentage: 28 },
    { country: 'United Kingdom', percentage: 17 },
    { country: 'Other', percentage: 10 }
  ]

  return (
    <section className="audience-section">
      <div className="audience-heading">
        <div>
          <h2>Audience Analytics</h2>
          <p>Understand who watches your content.</p>
        </div>
        <span className="audience-period">Last 30 days</span>
      </div>

      <div className="audience-metrics">
        {audience.map((item) => (
          <div className="audience-card" key={item.label}>
            <p>{item.label}</p>
            <h3>{item.value}</h3>
            <span>{item.change} vs previous period</span>
          </div>
        ))}
      </div>

      <div className="audience-demographics">
        <h3>Top Audience Locations</h3>
        <p>Where your viewers are from.</p>

        {demographics.map((item) => (
          <div className="country-row" key={item.country}>
            <div className="country-info">
              <span>{item.country}</span>
              <strong>{item.percentage}%</strong>
            </div>

            <div className="country-bar-track">
              <div
                className="country-bar"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default AudienceAnalytics