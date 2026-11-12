import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from './api'
import './App.css'

function formatDate(value) {
  if (!value) return 'Date unavailable'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function ContentPage() {
  const [videos, setVideos] = useState([])
  const [selectedContentId, setSelectedContentId] = useState(null)
  const [selectedPlatform, setSelectedPlatform] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createMessage, setCreateMessage] = useState('')

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

        const [contentRecords, analyticsRecords] =
          await Promise.all([
            apiRequest('/content', { headers }),
            apiRequest('/analytics', { headers })
          ])

        const snapshotsByContent = {}

        analyticsRecords.forEach(record => {
          if (!record.content_id) return

          if (!snapshotsByContent[record.content_id]) {
            snapshotsByContent[record.content_id] = []
          }

          snapshotsByContent[record.content_id].push(record)
        })

        const preparedVideos = contentRecords.map(video => {
          const history = (
            snapshotsByContent[video.content_id] || []
          ).sort(
            (a, b) =>
              new Date(a.recorded_at) -
              new Date(b.recorded_at)
          )

          const latestSnapshot = history[history.length - 1]
          const metrics = latestSnapshot?.metrics || {}

          return {
            ...video,
            history,
            views: Number(metrics.views || 0),
            likes: Number(metrics.likes || 0),
            comments: Number(metrics.comments || 0)
          }
        })

        preparedVideos.sort((a, b) => b.views - a.views)

        if (!cancelled) {
          setVideos(preparedVideos)

          setSelectedContentId(currentId => {
            const stillExists = preparedVideos.some(
              video => video.content_id === currentId
            )

            return stillExists
              ? currentId
              : preparedVideos[0]?.content_id || null
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || 'Could not load your content.'
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

  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      const matchesPlatform =
        selectedPlatform === 'All' ||
        video.platform?.toLowerCase() ===
          selectedPlatform.toLowerCase()

      const matchesSearch =
        video.title?.toLowerCase().includes(
          search.toLowerCase()
        )

      return matchesPlatform && matchesSearch
    })
  }, [videos, selectedPlatform, search])

  const selectedVideo = videos.find(
    video => video.content_id === selectedContentId
  )

  const chartPoints = useMemo(() => {
    if (!selectedVideo?.history?.length) return []

    const history = selectedVideo.history
    const values = history.map(record =>
      Number(record.metrics?.views || 0)
    )

    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const range = maxValue - minValue || 1

    return history.map((record, index) => {
      const x = history.length === 1
        ? 350
        : 30 + (index / (history.length - 1)) * 640

      const y =
        175 -
        ((Number(record.metrics?.views || 0) - minValue) /
          range) *
          135

      return {
        x,
        y,
        views: Number(record.metrics?.views || 0),
        date: formatDate(record.recorded_at)
      }
    })
  }, [selectedVideo])

  const chartLine = chartPoints
    .map(point => `${point.x},${point.y}`)
    .join(' ')

  function handleCreatePost() {
    setCreateMessage(
      'Publishing is not connected yet. This action will be enabled when Aflit’s publishing workflow is implemented.'
    )
  }

  return (
    <section className="content-page">
      <div className="content-workspace-heading">
        <div>
          <span className="section-eyebrow">
            CONTENT INTELLIGENCE
          </span>
          <h1>Content Library</h1>
          <p>
            Understand what your content is achieving and
            identify your strongest videos.
          </p>
        </div>

        <button
          type="button"
          className="content-create-button"
          onClick={handleCreatePost}
        >
          + Create New Post
        </button>
      </div>

      {createMessage && (
        <div className="content-notice">
          {createMessage}
          <button
            type="button"
            onClick={() => setCreateMessage('')}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <p className="content-state">
          Loading your content library...
        </p>
      ) : error ? (
        <p className="connection-error">{error}</p>
      ) : videos.length === 0 ? (
        <div className="analytics-chart-empty">
          <h3>No content available yet</h3>
          <p>
            Connect YouTube and synchronize your videos
            to start building your content library.
          </p>
        </div>
      ) : (
        <>
          <div className="content-library-toolbar">
            <div className="content-filters">
              {['All', 'YouTube', 'TikTok', 'Instagram'].map(
                platform => (
                  <button
                    key={platform}
                    type="button"
                    className={
                      selectedPlatform === platform
                        ? 'range-button active'
                        : 'range-button'
                    }
                    onClick={() => setSelectedPlatform(platform)}
                  >
                    {platform}
                  </button>
                )
              )}
            </div>

            <input
              type="search"
              className="content-search"
              placeholder="Search your videos..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>

          <div className="content-library-layout">
            <div className="content-library-panel">
              <div className="content-panel-heading">
                <div>
                  <h2>Your videos</h2>
                  <p>
                    {filteredVideos.length} videos
                  </p>
                </div>
                <span>Sorted by views</span>
              </div>

              {filteredVideos.length === 0 ? (
                <p className="content-state">
                  No videos match your search or filter.
                </p>
              ) : (
                <div className="content-library-list">
                  {filteredVideos.map((video, index) => (
                    <button
                      type="button"
                      key={video.content_id}
                      className={
                        selectedContentId === video.content_id
                          ? 'content-library-item selected'
                          : 'content-library-item'
                      }
                      onClick={() =>
                        setSelectedContentId(video.content_id)
                      }
                    >
                      {video.platform?.toLowerCase() ===
                      'youtube' &&
                      video.external_content_id ? (
                        <img
                          className="content-library-thumbnail"
                          src={`https://img.youtube.com/vi/${video.external_content_id}/mqdefault.jpg`}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <div className="content-library-thumbnail content-thumbnail-placeholder">
                          {video.platform || 'Content'}
                        </div>
                      )}

                      <div className="content-library-info">
                        <strong>{video.title || 'Untitled video'}</strong>
                        <span>
                          {video.platform || 'Unknown platform'}
                          {' · '}
                          {formatDate(video.published_at)}
                        </span>
                        <small>
                          {video.views.toLocaleString()} views
                        </small>
                      </div>

                      <span className="content-library-rank">
                        #{index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="content-analysis-column">
              {selectedVideo && (
                <>
                  <div className="content-featured-panel">
                    <span className="section-eyebrow">
                      SELECTED CONTENT
                    </span>

                    <h2>{selectedVideo.title}</h2>

                    <p className="content-featured-date">
                      {selectedVideo.platform}
                      {' · '}
                      Published {formatDate(selectedVideo.published_at)}
                    </p>

                    <div className="content-featured-metrics">
                      <div>
                        <strong>
                          {selectedVideo.views.toLocaleString()}
                        </strong>
                        <span>Views</span>
                      </div>

                      <div>
                        <strong>
                          {selectedVideo.likes.toLocaleString()}
                        </strong>
                        <span>Likes</span>
                      </div>

                      <div>
                        <strong>
                          {selectedVideo.comments.toLocaleString()}
                        </strong>
                        <span>Comments</span>
                      </div>
                    </div>
                  </div>

                  <div className="content-history-panel">
                    <div className="content-panel-heading">
                      <div>
                        <span className="section-eyebrow">
                          PERFORMANCE HISTORY
                        </span>
                        <h2>Views over time</h2>
                      </div>
                      <span>Recorded syncs</span>
                    </div>

                    {chartPoints.length === 0 ? (
                      <div className="analytics-chart-empty">
                        No historical metrics have been recorded
                        for this video yet.
                      </div>
                    ) : (
                      <>
                        <div className="content-chart">
                          <svg
                            viewBox="0 0 700 210"
                            role="img"
                            aria-label="Video views recorded at each synchronization"
                          >
                            {[40, 85, 130, 175].map(y => (
                              <line
                                key={y}
                                x1="30"
                                y1={y}
                                x2="670"
                                y2={y}
                                className="content-chart-gridline"
                              />
                            ))}

                            {chartPoints.length > 1 && (
                              <polyline
                                points={chartLine}
                                className="content-chart-line"
                              />
                            )}

                            {chartPoints.map((point, index) => (
                              <circle
                                key={`${point.date}-${index}`}
                                cx={point.x}
                                cy={point.y}
                                r="5"
                                className="content-chart-point"
                              />
                            ))}
                          </svg>
                        </div>

                        <div className="content-chart-labels">
                          <span>{chartPoints[0].date}</span>
                          <span>
                            {chartPoints[chartPoints.length - 1].date}
                          </span>
                        </div>

                        <p className="content-chart-note">
                          Each point represents the video's lifetime
                          view count recorded during a sync. The change
                          between points shows growth between syncs,
                          not real-time views.
                        </p>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default ContentPage