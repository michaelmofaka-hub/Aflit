
import './App.css'

function AnalyticsSummary({ data = [] }) {
  const totalGrowth = data.reduce(
    (total, item) => total + item.views,
    0
  )

  const averageGrowth = data.length
    ? Math.round(totalGrowth / data.length)
    : 0

  const bestPeriod = data.length
    ? data.reduce((best, item) =>
        item.views > best.views ? item : best
      )
    : null

  return (
    <section className="analytics-summary">
      <div className="summary-card">
        <p>Total Views Gained</p>
        <h2>{totalGrowth.toLocaleString()}</h2>
        <span>Across recorded sync periods</span>
      </div>

      <div className="summary-card">
        <p>Average Growth</p>
        <h2>{averageGrowth.toLocaleString()}</h2>
        <span>Average views gained per period</span>
      </div>

      <div className="summary-card">
        <p>Strongest Growth Period</p>
        <h2>{bestPeriod ? bestPeriod.day : 'N/A'}</h2>
        <span>
          {bestPeriod
            ? `${bestPeriod.views.toLocaleString()} views gained`
            : 'No growth data available yet'}
        </span>
      </div>
    </section>
  )
}

export default AnalyticsSummary
