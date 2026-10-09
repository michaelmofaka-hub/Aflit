import { useState } from 'react'
import './App.css'

function AudiencePage() {
  const [period, setPeriod] = useState('7 days')

  const audienceData = {
    '7 days': {
      returning: 38,
      newViewers: 62,
      subscribers: 284,
      countries: [
        { name: 'Kenya', percentage: 45 },
        { name: 'United States', percentage: 28 },
        { name: 'United Kingdom', percentage: 17 },
        { name: 'Other', percentage: 10 }
      ]
    },
    '30 days': {
      returning: 42,
      newViewers: 58,
      subscribers: 920,
      countries: [
        { name: 'Kenya', percentage: 48 },
        { name: 'United States', percentage: 25 },
        { name: 'United Kingdom', percentage: 16 },
        { name: 'Other', percentage: 11 }
      ]
    },
    '90 days': {
      returning: 35,
      newViewers: 65,
      subscribers: 2450,
      countries: [
        { name: 'Kenya', percentage: 43 },
        { name: 'United States', percentage: 29 },
        { name: 'United Kingdom', percentage: 18 },
        { name: 'Other', percentage: 10 }
      ]
    }
  }

  const audience = audienceData[period]

  return (
    <section className="audience-page">
      <div className="audience-page-heading">
        <div>
          <h1>Audience</h1>
          <p>Understand who watches your content.</p>
        </div>

        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          aria-label="Audience reporting period"
        >
          <option value="7 days">Last 7 days</option>
          <option value="30 days">Last 30 days</option>
          <option value="90 days">Last 90 days</option>
        </select>
      </div>

      <div className="audience-page-metrics">
        <div className="audience-page-card">
          <p>Returning Viewers</p>
          <h2>{audience.returning}%</h2>
        </div>

        <div className="audience-page-card">
          <p>New Viewers</p>
          <h2>{audience.newViewers}%</h2>
        </div>

        <div className="audience-page-card">
          <p>Subscribers Gained</p>
          <h2>{audience.subscribers.toLocaleString()}</h2>
        </div>
      </div>

      <div className="audience-location-card">
        <h2>Top Audience Locations</h2>
        <p>Audience distribution by country</p>

        {audience.countries.map((country) => (
          <div className="audience-location-row" key={country.name}>
            <div className="audience-location-label">
              <span>{country.name}</span>
              <span>{country.percentage}%</span>
            </div>

            <div className="audience-location-track">
              <div
                className="audience-location-bar"
                style={{ width: `${country.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default AudiencePage