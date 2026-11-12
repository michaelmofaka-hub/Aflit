
import { useState, useEffect } from 'react'

import Welcome from './Welcome.jsx'
import MetricCard from './Metric.jsx'
import AnalyticSection from './AnalyticsSection.jsx'
import useAnalyticsData from './useAnalytics.jsx'
import AnalyticsSummary from './AnalyticsSummary.jsx'
import Sidebar from './Sidebar.jsx'
import ContentPerformance from './ContentPerformance.jsx'
import AudienceAnalytics from './AudienceAnalytics.jsx'
import AIInsights from './AiInsights.jsx'
import PlatformsSection from './PlatformSection.jsx'
import ContentPage from './ContentPage.jsx'
import AudiencePage from './AudiencePage.jsx'
import MonetizationPage from './MonetizationPage.jsx'
import AIInsightsPage from './AIInsightsPage.jsx'
import LandingPage from './Landing.jsx'
import AuthPage from './AuthPage.jsx'
import PrivacyPolicy from './PrivacyPolicy.jsx'
import { apiRequest } from './api'

import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState(() => {
    const path = window.location.pathname

    if (path === '/privacy') {
      return 'Privacy'
    }

    return localStorage.getItem('token')
      ? 'Dashboard'
      : 'Landing'
  })

  const [overview, setOverview] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [youtubeConnected, setYoutubeConnected] = useState(false)

  // Shared analytics data for Dashboard and Analytics.
  const {
    history,
    dailyHistory,
    loading: historyLoading,
    error: historyError,
    refreshHistory
  } = useAnalyticsData(
    activeSection !== 'Landing' &&
    activeSection !== 'Auth' &&
    activeSection !== 'Privacy'
  )

  // Dashboard metric data.
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

  // Detect successful YouTube connection.
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

  // Fetch live YouTube channel overview.
  useEffect(() => {
    if (activeSection !== 'Dashboard') return

    const token = localStorage.getItem('token')
    if (!token) return

    let cancelled = false

    async function loadOverview() {
      try {
        const data = await apiRequest(
          '/analytics/youtube/overview',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!cancelled) {
          setOverview({
            ...data,
            platform: 'youtube'
          })
        }
      } catch (error) {
        console.error(
          'Could not load platform overview:',
          error
        )
      }
    }

    loadOverview()

    return () => {
      cancelled = true
    }
  }, [activeSection])

  // Navigate to a public page.
  function handlePublicNavigation(section, path) {
    window.history.pushState({}, '', path)
    setActiveSection(section)
  }

  // Handle browser back and forward navigation.
  useEffect(() => {
    function handlePopState() {
      const path = window.location.pathname

      if (path === '/privacy') {
        setActiveSection('Privacy')
      } else {
        setActiveSection(
          localStorage.getItem('token')
            ? 'Dashboard'
            : 'Landing'
        )
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // Log out the current user.
  function handleLogout() {
    localStorage.removeItem('token')
    setActiveSection('Landing')
    setOverview(null)
    setYoutubeConnected(false)
    window.history.pushState({}, '', '/')
  }

  // Shared props for detailed analytics.
  const analyticsProps = {
    dailyHistory,
    historyLoading,
    historyError,
    onHistoryRefresh: refreshHistory
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
            onPrivacy={() =>
              handlePublicNavigation('Privacy', '/privacy')
            }
          />
        )

      case 'Privacy':
        return (
          <PrivacyPolicy
            onBack={() =>
              handlePublicNavigation('Landing', '/')
            }
          />
        )

      case 'Dashboard':
        return (
          <>
            <Welcome />

            <MetricCard
              platform="youtube"
              metrics={metrics}
            />

            <AnalyticsSummary data={dailyHistory} />

            <ContentPerformance
              onViewAll={() => setActiveSection('Content')}
            />

            <AudienceAnalytics />

            <AIInsights />

            <PlatformsSection />
          </>
        )
      case 'Analytics':
        return <AnalyticSection {...analyticsProps} />

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
        activeSection !== 'Auth' &&
        activeSection !== 'Privacy' && (
          <Sidebar
            activeSection={activeSection}
            onNavigate={setActiveSection}
            onLogout={handleLogout}
          />
        )}

      <main className="main-content">
        {renderSection()}

        {youtubeConnected && (
          <p>YouTube connected successfully</p>
        )}
      </main>
    </div>
  )
}

export default App
