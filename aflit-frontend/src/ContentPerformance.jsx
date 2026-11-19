
import { useEffect, useState } from 'react'
import { apiRequest } from './api'
import './App.css'

function ContentPerformance({ onViewAll }) {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadContent() {
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

        const [videos, records] = await Promise.all([
          apiRequest('/content', { headers }),
          apiRequest('/analytics', { headers })
        ])

        const youtubeVideos = videos.filter(
          video => video.platform?.toLowerCase() === 'youtube'
        )

        const latestSnapshots = {}

        records
          .filter(record =>
            record.platform?.toLowerCase() === 'youtube'
          )
          .forEach(record => {
            const previous = latestSnapshots[record.content_id]

            if (
              !previous ||
              new Date(record.recorded_at) >
                new Date(previous.recorded_at)
            ) {
              latestSnapshots[record.content_id] = record
            }
          })

        const rankedVideos = youtubeVideos
          .map(video => {
            const snapshot = latestSnapshots[video.content_id]
            const metrics = snapshot?.metrics || {}

            return {
              ...video,
              views: Number(metrics.views || 0),
              likes: Number(metrics.likes || 0),
              comments: Number(metrics.comments || 0)
            }
          })
          .sort((a, b) => b.views - a.views)
          .slice(0, 3)

        if (!cancelled) {
          setContent(rankedVideos)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || 'Could not load content performance.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadContent()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="content-performance">
      <div className="content-performance-heading">
        <div>
          <span className="section-eyebrow">
            CONTENT INTELLIGENCE
          </span>
          <h2>Top Performing Content</h2>
          <p className="section-description">
            Discover which videos are attracting the most attention.
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="content-view-all"
        >
          View all content →
        </button>
      </div>

      {loading ? (
        <p>Loading your top videos...</p>
      ) : error ? (
        <p className="connection-error">{error}</p>
      ) : content.length === 0 ? (
        <div className="analytics-chart-empty">
          <p>Your content performance will appear here.</p>
          <span>
            Connect YouTube and synchronize your videos to get started.
          </span>
        </div>
      ) : (
        <div className="content-preview-list">
          {content.map((video, index) => (
            <article
              className="content-preview-item"
              key={video.content_id}
            >
              <span className="content-rank">
                {index + 1}
              </span>

              <img
                className="content-thumbnail"
                src={`https://img.youtube.com/vi/${video.external_content_id}/mqdefault.jpg`}
                alt=""
                loading="lazy"
              />

              <div className="content-preview-details">
                <h3>{video.title}</h3>
                <span>YouTube</span>
              </div>

              <div className="content-preview-stats">
                <strong>{video.views.toLocaleString()}</strong>
                <span>Views</span>
              </div>

              <div className="content-preview-stats">
                <strong>
                  {(video.likes + video.comments).toLocaleString()}
                </strong>
                <span>Interactions</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default ContentPerformance
