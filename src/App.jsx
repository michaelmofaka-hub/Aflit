import { useState } from 'react'
import { useEffect } from "react";
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
import { apiRequest } from "./api";
import './App.css'

function App() {
  
  const [activeSection, setActiveSection] = useState(
    localStorage.getItem('token') ? 'Dashboard' : 'Landing'
  )

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
    { title: 'Views', value: '12,450' },
    { title: 'Subscribers', value: '1,240' },
    { title: 'Revenue', value: 'KSh 8,500' }
  ]
    useEffect(() => {
  const params = new URLSearchParams(window.location.search)

  if (params.get("youtube_connected") === "1") {
    setYoutubeConnected(true)
  
      window.history.replaceState({}, "", window.location.pathname)
  }
  }, []);

  function handleLogout() {
  // Your first line: remove the token
  localStorage.removeItem('token')
  // Your second line: change the active section to Landing
  setActiveSection('Landing')
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
        return <ContentPage />

      case 'Audience':
        return <AudiencePage />

      case 'Monetization':
        return (
          <>

            <MonetizationPage />
          </>
        )

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
                currentMode === 'register' ? 'login' : 'register'
              )
            }}
            onBack={() => setActiveSection('Landing')}
            onLoginSuccess={() => setActiveSection('Dashboard')}
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
        {youtubeConnected && (<p>youtube connected successfully</p>)}
        {renderSection()}
      </main>
    </div>
    
  )
}


export default App