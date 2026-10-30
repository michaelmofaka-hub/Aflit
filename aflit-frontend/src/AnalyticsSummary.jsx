import './App.css'

function AnalyticsSummary({ data }) {
  const totalViews = data.reduce(
    (total, item) => total + item.views,
    0
  )

  const averageViews = data.length
    ? Math.round(totalViews / data.length)
    : 0

  const bestDay = data.length
    ? data.reduce((best, item) =>
        item.views > best.views ? item : best
      )
    : null

  return (
    <section className="analytics-summary">
      <div className="summary-card">
        <p>Total Views</p>
        <h2>{totalViews.toLocaleString()}</h2>
      </div>

      <div className="summary-card">
        <p>Daily Average</p>
        <h2>{averageViews.toLocaleString()}</h2>
      </div>

      <div className="summary-card">
        <p>Best-Performing Day</p>
        <h2>{bestDay ? bestDay.day : 'N/A'}</h2>
        <span>
          {bestDay
            ? `${bestDay.views.toLocaleString()} views`
            : 'No data available'}
        </span>
      </div>
    </section>
  )
}

export default AnalyticsSummary