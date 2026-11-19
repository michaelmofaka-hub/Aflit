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
import AIAgentPage from './AIAgentPage.jsx'
import PlatformsSection from './PlatformSection.jsx'
import ContentPage from './ContentPage.jsx'
import AudiencePage from './AudiencePage.jsx'
import MonetizationPage from './MonetizationPage.jsx'
import LandingPage from './Landing.jsx'
import AuthPage from './AuthPage.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import PrivacyPolicy from './PrivacyPolicy.jsx'
import SettingsPage from './SettingsPage.jsx'

import { apiRequest } from './api'

import './App.css'


function App() {
  // 1. INITIAL APPLICATION STATE

  const [activeSection, setActiveSection] = useState(() => {
    const path = window.location.pathname

    if (path === '/privacy') return 'Privacy'
    if (path === '/forgot-password') return 'ForgotPassword'

    return 'Landing'
  })

  const [overview, setOverview] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [youtubeConnected, setYoutubeConnected] = useState(false)

  // Authentication is checked silently in the background.
  // This state does not control or render a checker window.
  const [authStatus, setAuthStatus] = useState('checking')


  // 2. DETERMINE WHETHER AN ERROR MEANS UNAUTHORIZED ACCESS

  function isUnauthorized(error) {
    const status = error?.status || error?.statusCode

    if (status === 401) {
      return true
    }

    const message = error?.message || ''

    return /401|unauthorized|could not validate credentials|token.*(expired|invalid)/i
      .test(message)
  }


  // 3. INITIAL AUTHENTICATION CHECK

  useEffect(() => {
    let cancelled = false

    async function checkAuthentication() {
      const token = localStorage.getItem('token')

      // No token means the user is not authenticated.

      if (!token) {
        if (cancelled) return

        setAuthStatus('unauthenticated')

        setActiveSection(current =>
          current === 'Privacy' || current === 'ForgotPassword'
            ? current
            : 'Landing'
        )

        return
      }

      try {
        // Verify the JWT using the existing FastAPI endpoint.
        // api.js handles access-token renewal when necessary.

        await apiRequest('/users/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (cancelled) return

        setAuthStatus('authenticated')

        if (
          window.location.pathname !== '/privacy' &&
          window.location.pathname !== '/forgot-password'
        ) {
          setActiveSection('Dashboard')
        }

      } catch (error) {
        if (cancelled) return

        console.error(
          'Authentication verification failed:',
          error
        )

        // api.js removes the token if refresh returns 401.
        // If the token remains, treat the failure as temporary
        // and preserve the user's session.

        if (
          !localStorage.getItem('token') ||
          isUnauthorized(error)
        ) {
          localStorage.removeItem('token')

          setAuthStatus('unauthenticated')

          setActiveSection(current =>
            current === 'Privacy' || current === 'ForgotPassword'
              ? current
              : 'Landing'
          )

        } else {
          // No checker window and no retry window are rendered.
          // The potentially valid token is preserved.

          setAuthStatus('error')
        }
      }
    }

    checkAuthentication()

    return () => {
      cancelled = true
    }
  }, [])


  // 4. SHARED ANALYTICS DATA

  const {
    dailyHistory,
    loading: historyLoading,
    error: historyError,
    refreshHistory
  } = useAnalyticsData(
    authStatus === 'authenticated' &&
    activeSection !== 'Landing' &&
    activeSection !== 'Auth' &&
    activeSection !== 'Privacy' &&
    activeSection !== 'ForgotPassword'
  )


  // 5. DASHBOARD METRICS

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


  // 6. YOUTUBE CONNECTION DETECTION

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    )

    if (params.get('youtube_connected') === '1') {
      setYoutubeConnected(true)

      window.history.replaceState(
        {},
        '',
        window.location.pathname
      )
    }
  }, [])


  // 7. FETCH YOUTUBE OVERVIEW

  useEffect(() => {
    if (
      authStatus !== 'authenticated' ||
      activeSection !== 'Dashboard'
    ) {
      return
    }

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

        if (
          !cancelled &&
          (
            !localStorage.getItem('token') ||
            isUnauthorized(error)
          )
        ) {
          localStorage.removeItem('token')
          setOverview(null)
          setAuthStatus('unauthenticated')
          setActiveSection('Landing')
        }
      }
    }

    loadOverview()

    return () => {
      cancelled = true
    }
  }, [activeSection, authStatus])


  // 8. PUBLIC NAVIGATION

  function handlePublicNavigation(section, path) {
    window.history.pushState({}, '', path)
    setActiveSection(section)
  }


  // 9. FORGOT PASSWORD NAVIGATION

  function handleForgotPassword() {
    window.history.pushState(
      {},
      '',
      '/forgot-password'
    )

    setAuthMode('login')
    setActiveSection('ForgotPassword')
  }


  function handleBackToLogin() {
    window.history.pushState(
      {},
      '',
      '/'
    )

    setAuthMode('login')
    setActiveSection('Auth')
  }


  // 10. BROWSER BACK AND FORWARD

  useEffect(() => {
    function handlePopState() {
      const path = window.location.pathname

      if (path === '/privacy') {
        setActiveSection('Privacy')

      } else if (path === '/forgot-password') {
        setActiveSection('ForgotPassword')

      } else if (authStatus === 'authenticated') {
        setActiveSection('Dashboard')

      } else {
        setActiveSection('Landing')
      }
    }

    window.addEventListener(
      'popstate',
      handlePopState
    )

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      )
    }
  }, [authStatus])


  // 11. LOGOUT

  function handleLogout() {
    localStorage.removeItem('token')

    setAuthStatus('unauthenticated')
    setActiveSection('Landing')
    setOverview(null)
    setYoutubeConnected(false)

    window.history.pushState({}, '', '/')
  }


  // 12. ANALYTICS PROPS

  const analyticsProps = {
    dailyHistory,
    historyLoading,
    historyError,
    onHistoryRefresh: refreshHistory
  }


  // 13. RENDER APPLICATION SECTIONS

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


      case 'Auth':
        return (
          <AuthPage
            mode={authMode}

            onSwitchMode={() => {
              setAuthMode(currentMode =>
                currentMode === 'register'
                  ? 'login'
                  : 'register'
              )
            }}

            onBack={() => setActiveSection('Landing')}

            onForgotPassword={handleForgotPassword}

            onLoginSuccess={() => {
              setAuthStatus('authenticated')
              setActiveSection('Dashboard')
            }}
          />
        )


      case 'ForgotPassword':
        return (
          <ForgotPassword
            onBack={handleBackToLogin}
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

            <AnalyticsSummary
              data={dailyHistory}
            />

            <ContentPerformance
              onViewAll={() =>
                setActiveSection('Content')
              }
            />

            <AudienceAnalytics />

            <AIInsights />

            <PlatformsSection />
          </>
        )


      case 'Analytics':
        return (
          <AnalyticSection {...analyticsProps} />
        )


      case 'Content':
        return <ContentPage />


      case 'Audience':
        return <AudiencePage />


      case 'Monetization':
        return <MonetizationPage />


      case 'AI Insights':
        return <AIAgentPage />


      case 'Platforms':
        return <PlatformsSection />


      case 'Settings':
        return <SettingsPage />


      default:
        return <Welcome />
    }
  }


  // 14. APPLICATION LAYOUT
  // There are deliberately no authentication checker,
  // loading, backend-error, or retry windows in this component.

  return (
    <div className="app-layout">

      {authStatus === 'authenticated' &&
        activeSection !== 'Privacy' &&
        activeSection !== 'Landing' &&
        activeSection !== 'Auth' &&
        activeSection !== 'ForgotPassword' && (

          <Sidebar
            activeSection={activeSection}
            onNavigate={setActiveSection}
            onLogout={handleLogout}
          />
        )}

      <main className="main-content">
        {renderSection()}
      </main>

    </div>
  )
}

export default App
