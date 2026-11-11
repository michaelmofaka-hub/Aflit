
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

  // Load YouTube platform ID.
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

  // Start YouTube synchronization.
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

          const updatedAnalytics = await apiRequest(
            '/analytics/youtube/overview',
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )

          setAnalytics(updatedAnalytics)

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

  // Group snapshots by individual video.
  const snapshotsByContent = history.reduce((groups, record) => {
    if (!record.content_id || !record.recorded_at) {
      return groups
    }

    if (!groups[record.content_id]) {
      groups[record.content_id] = []
    }

    groups[record.content_id].push(record)

    return groups
  }, {})

  // Calculate views gained between consecutive snapshots.
  const growthByDate = {}

  Object.values(snapshotsByContent).forEach((snapshots) => {
    snapshots.sort(
      (a, b) =>
        new Date(a.recorded_at) - new Date(b.recorded_at)
    )

    for (let i = 1; i < snapshots.length; i++) {
      const previousViews = Number(
        snapshots[i - 1].metrics?.views || 0
      )

      const currentViews = Number(
        snapshots[i].metrics?.views || 0
      )

      const viewsGained = Math.max(
        currentViews - previousViews,
        0
      )

      const date = new Date(
        snapshots[i].recorded_at
      ).toISOString().slice(0, 10)

      if (!growthByDate[date]) {
        growthByDate[date] = {
          date,
          views: 0
        }
      }

      growthByDate[date].views += viewsGained
    }
  })

  // Prepare chronological growth history.
  const dailyHistory = Object.values(growthByDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      day: new Date(
        `${item.date}T00:00:00`
      ).toLocaleDateString(),
      views: item.views
    }))

  const maxDailyViews = Math.max(
    ...dailyHistory.map((item) => item.views),
    1
  )

  // Chart dimensions.
  const chartWidth = 720
  const chartHeight = 260
  const chartPadding = 36

  // Calculate chart coordinates.
  const chartPoints = dailyHistory.map((item, index) => {
    const x = dailyHistory.length === 1
      ? chartWidth / 2
      : chartPadding +
        index *
        ((chartWidth - chartPadding * 2) /
          (dailyHistory.length - 1))

    const y =
      chartHeight -
      chartPadding -
      (item.views / maxDailyViews) *
        (chartHeight - chartPadding * 2)

    return {
      x,
      y,
      day: item.day,
      views: item.views
    }
  })

  const chartLine = chartPoints
    .map((point) => `${point.x},${point.y}`)
    .join(' ')

  // Loading state.
  if (loading) {
    return (
      <div className="analytics-page">
        <header className="analytics-page-header">
          <div className="analytics-page-heading">
            <h1>Analytics</h1>
            <p>
              Understand what's driving your channel's growth.
            </p>
          </div>
        </header>

        <div className="analytics-section">
          <h2>YouTube Analytics</h2>
          <p>Loading channel analytics...</p>
        </div>
      </div>
    )
  }

  // Error state.
  if (error) {
    return (
      <div className="analytics-page">
        <header className="analytics-page-header">
          <div className="analytics-page-heading">
            <h1>Analytics</h1>
            <p>
              Understand what's driving your channel's growth.
            </p>
          </div>
        </header>

        <div className="analytics-section">
          <h2>YouTube Analytics</h2>
          <p className="connection-error">{error}</p>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  const metrics = [
    { label: 'Total views', value: analytics.views },
    { label: 'Subscribers', value: analytics.subscribers },
    { label: 'Videos', value: analytics.video_count }
  ]

  return (
    <div className="analytics-page">

      {/* Page heading */}
      <header className="analytics-page-header">
        <div className="analytics-page-heading">
          <h1>Analytics</h1>
          <p>
            Understand what's driving your channel's growth.
          </p>
        </div>
      </header>

      <div className="analytics-section">

        <h2>YouTube Analytics</h2>

        <p>
          Channel performance for {analytics.channel_title}.
        </p>

        {/* Synchronization */}
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

        {/* Performance metrics */}
        <div className="analytics-metrics-grid">
          {metrics.map((metric, index) => (
            <div
              className="analytics-metric-card"
              key={metric.label}
            >
              <span className="analytics-metric-label">
                {metric.label}
              </span>

              <strong className="analytics-metric-value">
                {Number(metric.value).toLocaleString()}
              </strong>

              <span className="analytics-metric-caption">
                {index === 0
                  ? 'Lifetime channel views'
                  : index === 1
                  ? 'Current subscribers'
                  : 'Published videos'}
              </span>
            </div>
          ))}
        </div>

        {/* Visual growth chart */}
        <div className="analytics-history">
          <div className="analytics-chart-heading">
            <div>
              <h3>Channel growth</h3>
              <p>Views gained between syncs</p>
            </div>
          </div>

          {dailyHistory.length === 0 ? (
            <div className="analytics-chart-empty">
              <p>No growth history available yet.</p>
              <span>
                Sync your YouTube account again to start
                measuring growth.
              </span>
            </div>
          ) : (
            <>
              <div className="analytics-chart-container">
                <svg
                  className="analytics-growth-svg"
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Views gained between YouTube syncs"
                >
                  {/* Horizontal grid lines */}
                  {[0, 1, 2, 3].map((line) => {
                    const y =
                      chartPadding +
                      line *
                      ((chartHeight - chartPadding * 2) / 3)

                    return (
                      <line
                        key={line}
                        x1={chartPadding}
                        y1={y}
                        x2={chartWidth - chartPadding}
                        y2={y}
                        className="analytics-chart-gridline"
                      />
                    )
                  })}

                  {/* Growth line */}
                  {chartPoints.length > 1 && (
                    <polyline
                      points={chartLine}
                      className="analytics-chart-line"
                    />
                  )}

                  {/* Data points */}
                  {chartPoints.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="5"
                      className="analytics-chart-point"
                    >
                      <title>
                        {point.day}: {point.views.toLocaleString()} views gained
                      </title>
                    </circle>
                  ))}
                </svg>
              </div>

              {/* Date labels */}
              <div className="analytics-chart-labels">
                {chartPoints.map((point, index) => (
                  <span key={index}>
                    {point.day}
                  </span>
                ))}
              </div>

              <div className="analytics-chart-footer">
                <span>
                  {dailyHistory.length} recorded growth periods
                </span>
                <strong>
                  {dailyHistory
                    .reduce((total, item) => total + item.views, 0)
                    .toLocaleString()} views gained
                </strong>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

export default AnalyticsSection