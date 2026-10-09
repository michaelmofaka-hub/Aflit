import { useState } from 'react'
import './App.css'

function ContentPage() {
  const [selectedPlatform, setSelectedPlatform] =
    useState('All')

  const content = [
    {
      title: 'How I Grew My Channel',
      platform: 'YouTube',
      views: 8420,
      engagement: 6.8
    },
    {
      title: 'My Creator Journey',
      platform: 'TikTok',
      views: 5210,
      engagement: 8.2
    },
    {
      title: 'Behind the Scenes',
      platform: 'Instagram',
      views: 3840,
      engagement: 4.5
    },
    {
      title: 'Tips for New Creators',
      platform: 'YouTube',
      views: 6230,
      engagement: 7.1
    },
    {
      title: 'A Day in My Life',
      platform: 'TikTok',
      views: 9100,
      engagement: 9.3
    }
  ]

  const filteredContent =
    selectedPlatform === 'All'
      ? content
      : content.filter(
          (item) => item.platform === selectedPlatform
        )

  return (
    <section className="content-page">
      <div className="content-page-heading">
        <div>
          <h1>Content</h1>
          <p>
            Review and compare your content performance.
          </p>
        </div>

        <span>
          {filteredContent.length} posts
        </span>
      </div>

      <div className="content-filters">
        {['All', 'YouTube', 'TikTok', 'Instagram'].map(
          (platform) => (
            <button
              key={platform}
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

      <div className="content-page-list">
        <div className="content-page-header">
          <span>CONTENT</span>
          <span>PLATFORM</span>
          <span>VIEWS</span>
          <span>ENGAGEMENT</span>
        </div>

        {filteredContent.map((item) => (
          <div
            className="content-page-row"
            key={item.title}
          >
            <strong>{item.title}</strong>

            <span
              className={`platform-badge ${item.platform.toLowerCase()}`}
            >
              {item.platform}
            </span>

            <span>{item.views.toLocaleString()}</span>

            <span>{item.engagement}%</span>
          </div>
        ))}

        {filteredContent.length === 0 && (
          <p>No content found for this platform.</p>
        )}
      </div>
    </section>
  )
}

export default ContentPage