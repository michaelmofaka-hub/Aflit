import { useState } from 'react'
import './App.css'

function MonetizationPage() {
  const [period, setPeriod] = useState('30 days')

  const revenueData = {
    '7 days': {
      total: 2100,
      previous: 1800,
      sources: [
        { name: 'Advertising', amount: 1400 },
        { name: 'Subscriptions', amount: 450 },
        { name: 'Other', amount: 250 }
      ]
    },
    '30 days': {
      total: 8500,
      previous: 7200,
      sources: [
        { name: 'Advertising', amount: 5200 },
        { name: 'Subscriptions', amount: 2100 },
        { name: 'Other', amount: 1200 }
      ]
    },
    '90 days': {
      total: 24500,
      previous: 21000,
      sources: [
        { name: 'Advertising', amount: 15000 },
        { name: 'Subscriptions', amount: 6200 },
        { name: 'Other', amount: 3300 }
      ]
    }
  }

  const revenue = revenueData[period]

  const change = revenue.previous
    ? ((revenue.total - revenue.previous) / revenue.previous) * 100
    : 0

  const maxRevenue = Math.max(
    ...revenue.sources.map((source) => source.amount),
    1
  )

  return (
    <section className="monetization-page">
      <div className="monetization-heading">
        <div>
          <h1>Monetization</h1>
          <p>Understand your creator revenue.</p>
        </div>

        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          aria-label="Revenue reporting period"
        >
          <option value="7 days">Last 7 days</option>
          <option value="30 days">Last 30 days</option>
          <option value="90 days">Last 90 days</option>
        </select>
      </div>

      <p className="sample-notice">
        Demo data — not connected to real earnings.
      </p>

      <div className="monetization-metrics">
        <div className="monetization-card">
          <p>Estimated Revenue</p>
          <h2>
            KSh {revenue.total.toLocaleString()}
          </h2>
          <span>
            {change >= 0 ? '+' : ''}
            {change.toFixed(1)}% vs previous period
          </span>
        </div>

        <div className="monetization-card">
          <p>Revenue Sources</p>
          <h2>{revenue.sources.length}</h2>
          <span>Illustrative categories</span>
        </div>
      </div>

      <div className="revenue-breakdown">
        <h2>Revenue Breakdown</h2>
        <p>Compare your earnings by source.</p>

        {revenue.sources.map((source) => (
          <div className="revenue-row" key={source.name}>
            <div className="revenue-label">
              <span>{source.name}</span>
              <strong>
                KSh {source.amount.toLocaleString()}
              </strong>
            </div>

            <div className="revenue-track">
              <div
                className="revenue-bar"
                style={{
                  width: `${(source.amount / maxRevenue) * 100}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MonetizationPage