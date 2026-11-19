
import { useEffect, useState } from 'react'
import { apiRequest } from './api'
import './App.css'

function AudiencePage() {
  const [overview, setOverview] = useState(null)
  const [engagement, setEngagement] = useState(null)
  const [topVideos, setTopVideos] = useState([])
  const [subscriberGrowth, setSubscriberGrowth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadAudienceData() {
      try {
        setLoading(true)
        setError('')

        const token = localStorage.getItem('token')

        if (!token) {
          throw new Error('Please log in first.')
        }

        const headers = {
          Authorization: `Bearer ${token}`
        }

        const [channel, content, records, history] =
          await Promise.all([
            apiRequest('/analytics/youtube/overview', { headers }),
            apiRequest('/content', { headers }),
            apiRequest('/analytics', { headers }),
            apiRequest('/audience/youtube/history', { headers })
          ])

        // Calculate subscriber growth from saved snapshots.
        const sortedHistory = [...history].sort(
          (a, b) =>
            new Date(a.recorded_at) -
            new Date(b.recorded_at)
        )

        let growth = null

        if (sortedHistory.length >= 2) {
          const first = sortedHistory[0]
          const latest = sortedHistory[sortedHistory.length - 1]

          const change =
            Number(latest.subscribers) -
            Number(first.subscribers)

          const percentage = Number(first.subscribers)
            ? (change / Number(first.subscribers)) * 100
            : null

          growth = {
            change,
            percentage,
            available: true
          }
        } else {
          growth = {
            change: 0,
            percentage: null,
            available: false
          }
        }

        const youtubeContent = content.filter(
          video => video.platform?.toLowerCase() === 'youtube'
        )

        const latestSnapshots = {}

        records
          .filter(record =>
            record.platform?.toLowerCase() === 'youtube'
          )
          .forEach(record => {
            const previous =
              latestSnapshots[record.content_id]

            if (
              !previous ||
              new Date(record.recorded_at) >
                new Date(previous.recorded_at)
            ) {
              latestSnapshots[record.content_id] = record
            }
          })

        const videoEngagement = youtubeContent.map(video => {
          const snapshot =
            latestSnapshots[video.content_id]

          const metrics = snapshot?.metrics || {}

          return {
            ...video,
            views: Number(metrics.views || 0),
            likes: Number(metrics.likes || 0),
            comments: Number(metrics.comments || 0),
            interactions:
              Number(metrics.likes || 0) +
              Number(metrics.comments || 0),
            hasAnalytics: Boolean(snapshot)
          }
        })

        videoEngagement.sort(
          (a, b) => b.interactions - a.interactions
        )

        const totals = videoEngagement.reduce(
          (result, video) => ({
            likes: result.likes + video.likes,
            comments: result.comments + video.comments,
            interactions:
              result.interactions + video.interactions,
            syncedVideos:
              result.syncedVideos +
              (video.hasAnalytics ? 1 : 0)
          }),
          {
            likes: 0,
            comments: 0,
            interactions: 0,
            syncedVideos: 0
          }
        )

        if (!cancelled) {
          setOverview(channel)
          setEngagement(totals)
          setTopVideos(videoEngagement.slice(0, 5))
          setSubscriberGrowth(growth)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || 'Could not load audience data.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadAudienceData()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <section className="audience-page">
        <p>Loading your audience overview...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="audience-page">
        <h1>Audience</h1>
        <p className="connection-error">{error}</p>
      </section>
    )
  }

  return (
    <section className="audience-page">
      <div className="audience-live-heading">
        <div>
          <span className="section-eyebrow">
            AUDIENCE INTELLIGENCE
          </span>
          <h1>Audience Overview</h1>
          <p>
            Understand the reach and engagement of your
            YouTube audience.
          </p>
        </div>

        <span className="audience-live-status">
          YouTube connected
        </span>
      </div>

      <div className="audience-live-metrics">
        <article className="audience-live-card">
          <span>Total Subscribers</span>
          <h2>
            {Number(overview?.subscribers || 0).toLocaleString()}
          </h2>
          <small>Current channel total</small>
        </article>

        <article className="audience-live-card">
          <span>Subscriber Growth</span>
          <h2>
            {subscriberGrowth?.available
              ? `${subscriberGrowth.change > 0 ? '+' : ''}${subscriberGrowth.change.toLocaleString()}`
              : '—'}
          </h2>
          <small>
            {subscriberGrowth?.available
              ? `${subscriberGrowth.percentage === null
                  ? 'Percentage unavailable'
                  : `${subscriberGrowth.percentage.toFixed(2)}% since first snapshot`}`
              : 'Sync again to build growth history'}
          </small>
        </article>

        <article className="audience-live-card">
          <span>Total Channel Views</span>
          <h2>
            {Number(overview?.views || 0).toLocaleString()}
          </h2>
          <small>Lifetime channel views</small>
        </article>

        <article className="audience-live-card">
          <span>Published Videos</span>
          <h2>
            {Number(overview?.video_count || 0).toLocaleString()}
          </h2>
          <small>Current channel total</small>
        </article>
      </div>

      <div className="audience-engagement-panel">
        <div className="audience-panel-heading">
          <div>
            <span className="section-eyebrow">
              ENGAGEMENT SIGNALS
            </span>
            <h2>How viewers interact</h2>
            <p>
              Latest recorded metrics across synchronized videos.
            </p>
          </div>
        </div>

        <div className="audience-engagement-metrics">
          <div>
            <strong>{engagement.likes.toLocaleString()}</strong>
            <span>Likes</span>
          </div>

          <div>
            <strong>{engagement.comments.toLocaleString()}</strong>
            <span>Comments</span>
          </div>

          <div>
            <strong>{engagement.interactions.toLocaleString()}</strong>
            <span>Total interactions</span>
          </div>

          <div>
            <strong>{engagement.syncedVideos.toLocaleString()}</strong>
            <span>Videos synchronized</span>
          </div>
        </div>
      </div>

      <div className="audience-top-videos">
        <div className="audience-panel-heading">
          <div>
            <span className="section-eyebrow">
              AUDIENCE RESPONSE
            </span>
            <h2>Most Engaging Videos</h2>
            <p>
              Videos ranked by recorded likes and comments.
            </p>
          </div>
        </div>

        {topVideos.length === 0 ? (
          <p>No YouTube videos found yet.</p>
        ) : (
          <div className="audience-video-list">
            {topVideos.map((video, index) => (
              <article
                className="audience-video-item"
                key={video.content_id}
              >
                <span className="audience-video-rank">
                  {index + 1}
                </span>

                {video.external_content_id ? (
                  <img
                    src={`https://img.youtube.com/vi/${video.external_content_id}/mqdefault.jpg`}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <div className="audience-video-placeholder">
                    YouTube
                  </div>
                )}

                <div className="audience-video-info">
                  <strong>{video.title}</strong>
                  <span>{video.views.toLocaleString()} views</span>
                </div>

                <div className="audience-video-interactions">
                  <strong>
                    {video.interactions.toLocaleString()}
                  </strong>
                  <span>Interactions</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="audience-data-note">
        <strong>About these figures</strong>
        <p>
          Channel totals come from YouTube. Subscriber growth
          compares the oldest and latest saved audience snapshots.
          Engagement totals use the latest saved snapshot for each
          synchronized video. These are not unique viewer counts
          or demographic reports.
        </p>
      </div>

      <div className="audience-future-panel">
        <div>
          <span className="section-eyebrow">
            DEEPER AUDIENCE INTELLIGENCE
          </span>
          <h2>Know who's behind the views.</h2>
          <p>
            Audience retention, new and returning viewers,
            geographic distribution and demographic insights
            require YouTube Analytics reporting integration.
          </p>
        </div>
        <span>Coming in a future integration</span>
      </div>
    </section>
  )
}

export default AudiencePage
