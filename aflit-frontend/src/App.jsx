
import { useState, useEffect } from 'react'
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
import LandingPage from './Landing.jsx'
import AuthPage from './AuthPage.jsx'
import { apiRequest } from './api'
import './App.css'

function App() {

  const [activeSection, setActiveSection] = useState(
    localStorage.getItem('token') ? 'Dashboard' : 'Landing'
  )

  const [overview, setOverview] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [youtubeConnected, setYoutubeConnected] = useState(false)

  const [analytics, setAnalytics] = useState([
    { day: 'Mon', views: 1200 },
    { day: 'Tue', views: 1800 },
    { day: 'Wed', views: 1500 },
    { day: 'Thu', views: 2400 },
    { day: 'Fri', views: 2100 }
  ])

  const [amount, setAmount] = useState(500)

  const metrics = [
    {
      title: 'Views',
      value: overview?.views != null
        ? Number(overview.views).toLocaleString()
        : '—'
    },
    {
      title: 'Subscribers',
      value: overview?.subscribers != null
        ? Number(overview.subscribers).toLocaleString()
        : '—'
    },
    {
      title: 'Revenue',
      value: '—'
    }
  ]

  // Detect successful YouTube connection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get('youtube_connected') === '1') {
      setYoutubeConnected(true)

      window.history.replaceState(
        {},
        '',
        window.location.pathname
      )
    }
  }, [])

  // Fetch platform overview
  useEffect(() => {
    console.log(
      'Overview effect ran. Active section:',
      activeSection
    )

    if (activeSection !== 'Dashboard') return

    const token = localStorage.getItem('token')
    if (!token) return

    apiRequest('/analytics/youtube/overview', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((data) => {
        setOverview({
          ...data,
          platform: data.platform || 'youtube'
        })
      })
      .catch((error) => {
        console.error(
          'Could not load platform overview:',
          error
        )
      })

  }, [activeSection])

  function handleLogout() {
    localStorage.removeItem('token')
    setActiveSection('Landing')
    setOverview(null)
  }

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

      case 'Landing':
        return (
          <LandingPage
            onGetStarted={() => {
              setAuthMode('register')
              setActiveSection('Auth')
            }}
            onLogin={() => {
              setAuthMode('login')
              setActiveSection('Auth')
            }}
          />
        )

      case 'Dashboard':
        return (
          <>
            <Welcome />

            <MetricCard
              platform={overview?.platform || 'youtube'}
              metrics={metrics}
            />

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
        return <ContentPage />

      case 'Audience':
        return <AudiencePage />

      case 'Monetization':
        return <MonetizationPage />

      case 'AI Insights':
        return <AIInsightsPage />

      case 'Platforms':
        return <PlatformsSection />

      case 'Auth':
        return (
          <AuthPage
            mode={authMode}
            onSwitchMode={() => {
              setAuthMode((currentMode) =>
                currentMode === 'register'
                  ? 'login'
                  : 'register'
              )
            }}
            onBack={() => setActiveSection('Landing')}
            onLoginSuccess={() =>
              setActiveSection('Dashboard')
            }
          />
        )

      default:
        return <Welcome />
    }
  }

  return (
    <div className="app-layout">

      {activeSection !== 'Landing' &&
        activeSection !== 'Auth' && (
          <Sidebar
            activeSection={activeSection}
            onNavigate={setActiveSection}
            onLogout={handleLogout}
          />
        )}

      <main className="main-content">
        {renderSection()}

        {youtubeConnected && (
          <p>Youtube connected successfully</p>
        )}
      </main>

    </div>
  )
}

export default App
