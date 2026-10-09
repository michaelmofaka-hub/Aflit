import { useState } from 'react'
import Welcome from './Welcome.jsx'
import MetricCard from './Metric.jsx'
import AnalyticSection from './AnalyticsSection.jsx'
import Sidebar from './Sidebar.jsx'
import ContentPerformance from './ContentPerformance.jsx'
import AudienceAnalytics from './AudienceAnalytics.jsx'
import AIInsights from './AiInsights.jsx'
import PlatformsSection from './PlatformSection.jsx'
import AnalyticsSummary from './AnalyticsSummary.jsx'
import ContentPage from './ContentPage.jsx'
import AudiencePage from './AudiencePage.jsx'
import MonetizationPage from './MonetizationPage.jsx'
import AIInsightsPage from './AIInsightsPage.jsx'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState('Dashboard')

  const [analytics, setAnalytics] = useState([
    { day: 'Mon', views: 1200 },
    { day: 'Tue', views: 1800 },
    { day: 'Wed', views: 1500 },
    { day: 'Thu', views: 2400 },
    { day: 'Fri', views: 2100 }
  ])

  const [amount, setAmount] = useState(500)

  const metrics = [
    { title: 'Views', value: '12,450' },
    { title: 'Subscribers', value: '1,240' },
    { title: 'Revenue', value: 'KSh 8,500' }
  ]

  function updateAnalytics() {
    setAnalytics((prevAnalytics) =>
      prevAnalytics.map((item) => ({
        ...item,
        views: item.views + Number(amount)
      }))
    )
  }

  function renderSection() {
    switch (activeSection) {
      case 'Dashboard':
        return (
          <>
            <Welcome />

            <div className="metrics">
              {metrics.map((metric) => (
                <MetricCard
                  key={metric.title}
                  title={metric.title}
                  value={metric.value}
                />
              ))}
            </div>

            <AnalyticSection data={analytics} />
            <ContentPerformance />
            <AudienceAnalytics />
            <AIInsights />
            <PlatformsSection />
          </>
        )

      case 'Analytics':
        return (
          <>
      <h1>Analytics</h1>
      <p>Understand your content performance.</p>

      <AnalyticsSummary data={analytics} />

      <AnalyticSection data={analytics} />

      <div className="analytics-controls">
        <label>
          Increase each day's views by:
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
          />
        </label>

        <button onClick={updateAnalytics}>
          Update Analytics
        </button>
      </div>
    </>
        )

      case 'Content':
        return (
          <>
            <ContentPerformance />
            <ContentPage />
          </>
        )

      case 'Audience':
        return (
        <>
          <AudienceAnalytics />
          <AudiencePage />
        </>  
        )

      case 'Monetization':
        return (
          <>
          <section className="page-section">
            <h1>Monetization</h1>
            <p>
              Track creator revenue and explore ways to monetize
              your content.
            </p>

            <div className="metrics">
              <MetricCard
                title="Estimated Revenue"
                value="KSh 8,500"
              />
            </div>

            <p>
              Monetization analytics will be expanded as real
              platform data becomes available.
            </p>
          </section>
            <MonetizationPage />
          </>
        )

      case 'AI Insights':
        return (
          <>
            <AIInsights />
            <AIInsightsPage />
          </>
        )

      case 'Platforms':
        return <PlatformsSection />

      default:
        return <Welcome />
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />

      <main className="main-content">
        {renderSection()}
      </main>
    </div>
  )
}

export default App