
import { useEffect, useState } from 'react'
import { apiRequest } from './api'
import './App.css'

function AnalyticsSection() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  const [youtubePlatformId, setYoutubePlatformId] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')

  // Load the YouTube platform ID.
  useEffect(() => {
    let cancelled = false

    async function loadYouTubePlatform() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const platforms = await apiRequest('/platform', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const youtube = platforms.find(
          (platform) =>
            platform.platform_name?.toLowerCase() === 'youtube'
        )

        if (!cancelled) {
          setYoutubePlatformId(
            youtube?.platform_id || youtube?._id || null
          )
        }
      } catch (err) {
        console.error('Could not load YouTube platform:', err)
      }
    }

    loadYouTubePlatform()

    return () => {
      cancelled = true
    }
  }, [])

  // Fetch live YouTube channel totals.
  useEffect(() => {
    let cancelled = false

    async function loadAnalytics() {
      try {
        setLoading(true)
        setError('')

        const token = localStorage.getItem('token')

        if (!token) {
          throw new Error('Please log in to view your analytics.')
        }

        const result = await apiRequest(
          '/analytics/youtube/overview',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!cancelled) {
          setAnalytics(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || 'Could not load YouTube analytics.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadAnalytics()

    return () => {
      cancelled = true
    }
  }, [])

  // Fetch saved analytics snapshots.
  useEffect(() => {
    let cancelled = false

    async function loadHistory() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const records = await apiRequest('/analytics', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!cancelled) {
          setHistory(
            records.filter(
              (record) => record.platform === 'youtube'
            )
          )
        }
      } catch (err) {
        console.error('Could not load analytics history:', err)
      }
    }

    loadHistory()

    return () => {
      cancelled = true
    }
  }, [])

  // Start a YouTube sync job and monitor its status.
  async function handleSync() {
    if (syncing) return

    try {
      setSyncing(true)
      setSyncMessage('Starting YouTube sync...')

      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please log in first.')
      }

      if (!youtubePlatformId) {
        throw new Error('YouTube platform ID not found.')
      }

      const job = await apiRequest('/sync-jobs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform_id: youtubePlatformId,
          platform: 'youtube'
        })
      })

      setSyncMessage('Sync job created. Waiting for worker...')

      // Check job status every 5 seconds.
      const maxAttempts = 60

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 5000))

        const status = await apiRequest(
          `/sync-jobs/${job.sync_job_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (status.status === 'completed') {
          setSyncMessage('YouTube sync completed successfully.')

          // Refresh overview.
          const updatedAnalytics = await apiRequest(
            '/analytics/youtube/overview',
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )

          setAnalytics(updatedAnalytics)

          // Refresh history.
          const updatedHistory = await apiRequest('/analytics', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })

          setHistory(
            updatedHistory.filter(
              (record) => record.platform === 'youtube'
            )
          )

          return
        }

        if (status.status === 'failed') {
          throw new Error(
            status.error || 'YouTube synchronization failed.'
          )
        }

        setSyncMessage(
          status.status === 'running'
            ? 'YouTube data is being synchronized...'
            : 'Sync job is waiting in the queue...'
        )
      }

      setSyncMessage(
        'Sync is taking longer than expected. Check again shortly.'
      )
    } catch (err) {
      setSyncMessage(
        err.message || 'Could not synchronize YouTube.'
      )
    } finally {
      setSyncing(false)
    }
  }

  // Group saved snapshots by date.
  const dailyHistory = Object.values(
    history.reduce((groups, record) => {
      const date = new Date(
        record.recorded_at
      ).toLocaleDateString()

      if (!groups[date]) {
        groups[date] = {
          day: date,
          views: 0
        }
      }

      groups[date].views += record.metrics?.views || 0

      return groups
    }, {})
  ).sort(
    (a, b) => new Date(a.day) - new Date(b.day)
  )

  if (loading) {
    return (
      <div className="analytics-section">
        <h2>YouTube Analytics</h2>
        <p>Loading channel analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics-section">
        <h2>YouTube Analytics</h2>
        <p className="connection-error">{error}</p>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  const metrics = [
    { label: 'Total views', value: analytics.views },
    { label: 'Subscribers', value: analytics.subscribers },
    { label: 'Videos', value: analytics.video_count }
  ]

  return (
    <div className="analytics-section">
      <h2>YouTube Analytics</h2>

      <p>
        Channel performance for {analytics.channel_title}.
      </p>

      <button
        type="button"
        onClick={handleSync}
        disabled={syncing || !youtubePlatformId}
      >
        {syncing ? 'Syncing...' : 'Sync YouTube'}
      </button>

      {syncMessage && (
        <p role="status">{syncMessage}</p>
      )}

      <div className="analytics-summary">
        {metrics.map((metric) => (
          <div
            className="analytics-summary-item"
            key={metric.label}
          >
            <span>{metric.label}</span>
            <strong>
              {Number(metric.value).toLocaleString()}
            </strong>
          </div>
        ))}
      </div>

      <div className="analytics-history">
        <h3>Video views</h3>

        {dailyHistory.length === 0 ? (
          <p>
            No saved snapshots yet. Sync your YouTube account
            to start building history.
          </p>
        ) : (
          dailyHistory.map((item) => (
            <div
              className="analytics-row"
              key={item.day}
            >
              <span>{item.day}</span>

              <strong className="analytics-views">
                {item.views.toLocaleString()}
              </strong>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AnalyticsSection
