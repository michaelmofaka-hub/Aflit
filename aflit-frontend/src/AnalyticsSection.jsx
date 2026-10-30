import { useState } from 'react'
import './App.css'

function AnalyticsSection({ data }) {
  const [timeRange, setTimeRange] = useState('7 days')

  const sampleData = {
    '7 days': data,
    '30 days': [
      { day: 'Week 1', views: 8200 },
      { day: 'Week 2', views: 10400 },
      { day: 'Week 3', views: 9600 },
      { day: 'Week 4', views: 12800 }
    ],
    '90 days': [
      { day: 'Month 1', views: 28500 },
      { day: 'Month 2', views: 34200 },
      { day: 'Month 3', views: 41900 }
    ]
  }

  const visibleData = sampleData[timeRange]
  const maxViews = Math.max(...visibleData.map((item) => item.views))

  return (
    <div className="analytics-section">
      <h2>Analytics</h2>
      <p>Your content performance over time.</p>

      <div className="time-range-selector">
        {['7 days', '30 days', '90 days'].map((range) => (
          <button
            key={range}
            className={
              timeRange === range
                ? 'range-button active'
                : 'range-button'
            }
            onClick={() => setTimeRange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      {visibleData.map((item) => {
        const width = (item.views / maxViews) * 100

        return (
          <div className="analytics-row" key={item.day}>
            <span>{item.day}</span>

            <div className="analytics-bar-container">
              <div
                className="analytics-bar"
                style={{ width: `${width}%` }}
              />
            </div>

            <span className="analytics-views">
              {item.views.toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default AnalyticsSection