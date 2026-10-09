import './App.css'

function MetricCard({ title, value }) {
  return (
    <div className="metricCard">
      <h2>{title}</h2>
      <p className="metric-value">{value}</p>
    </div>
  )
}

export default MetricCard