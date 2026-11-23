import { useEffect, useState } from 'react'
import { apiRequest } from './api'
import './CreatePost.css'

const MAX_VIDEO_SIZE = 256 * 1024 * 1024
const PLATFORMS = ['youtube', 'tiktok', 'instagram', 'facebook']

function CreatePost({ onClose }) {
  const [platforms, setPlatforms] = useState([])
  const [drafts, setDrafts] = useState([])
  const [selectedPlatformId, setSelectedPlatformId] = useState('')
  const [targetPlatform, setTargetPlatform] = useState('youtube')
  const [postType, setPostType] = useState('video')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [privacyStatus, setPrivacyStatus] = useState('private')
  const [video, setVideo] = useState(null)
  const [loadingPlatforms, setLoadingPlatforms] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadComposerData() {
      try {
        const [platformResult, draftsResult] = await Promise.allSettled([
          apiRequest('/platform'),
          apiRequest('/posts/drafts')
        ])

        if (cancelled) return

        const loadErrors = []
        const platformData =
          platformResult.status === 'fulfilled'
            ? platformResult.value
            : []
        const savedDrafts =
          draftsResult.status === 'fulfilled'
            ? draftsResult.value
            : []

        if (platformResult.status === 'rejected') {
          loadErrors.push(
            platformResult.reason.message ||
            'Could not load connected platforms.'
          )
        }

        if (draftsResult.status === 'rejected') {
          loadErrors.push(
            draftsResult.reason.message ||
            'Could not load saved drafts.'
          )
        }

        const youtubeAccounts = Array.isArray(platformData)
          ? platformData.filter(platform =>
              platform.platform_name?.toLowerCase() === 'youtube' &&
              platform.status?.toLowerCase() === 'connected'
            )
          : []

        setPlatforms(youtubeAccounts)
        setDrafts(Array.isArray(savedDrafts) ? savedDrafts : [])
        setSelectedPlatformId(
          youtubeAccounts[0]?.platform_id || ''
        )
        setError(loadErrors.join(' '))
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Could not load post data.')
        }
      } finally {
        if (!cancelled) {
          setLoadingPlatforms(false)
        }
      }
    }

    loadComposerData()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape' && !publishing && !connecting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [connecting, onClose, publishing])

  async function connectYouTube() {
    setError('')
    setConnecting(true)

    try {
      const data = await apiRequest('/platform/youtube/connect')

      if (typeof data?.authorization_url !== 'string') {
        throw new Error(
          'The backend did not return a YouTube authorization URL.'
        )
      }

      window.location.assign(data.authorization_url)
    } catch (connectError) {
      setError(
        connectError.message ||
        'Could not start YouTube authorization.'
      )
      setConnecting(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (postType !== 'video' || targetPlatform !== 'youtube') {
      setError(
        'Live publishing is currently available for YouTube videos only. Save this post as a draft.'
      )
      return
    }

    if (!selectedPlatformId) {
      setError('Connect YouTube before publishing.')
      return
    }

    if (!video) {
      setError('Choose a video to upload.')
      return
    }

    if (video.size > MAX_VIDEO_SIZE) {
      setError('Videos must be 256 MB or smaller.')
      return
    }

    const formData = new FormData()
    formData.set('platform', 'youtube')
    formData.set('platform_id', selectedPlatformId)
    formData.set('post_type', postType)
    formData.set('title', title.trim())
    formData.set('description', description)
    formData.set('tags', tags)
    formData.set('privacy_status', privacyStatus)
    formData.set('video', video)

    setPublishing(true)

    try {
      const published = await apiRequest('/posts/publish', {
        method: 'POST',
        body: formData,
        timeoutMs: 1800000
      })

      setResult(published)
    } catch (publishError) {
      setError(
        publishError.message ||
        'Could not publish your video. Please try again.'
      )
    } finally {
      setPublishing(false)
    }
  }

  async function handleSaveDraft() {
    setError('')

    if (!title.trim()) {
      setError('Add a title before saving your draft.')
      return
    }

    if (postType === 'image' && !mediaUrl.trim()) {
      setError('Add an image URL before saving this draft.')
      return
    }

    if (postType === 'video' && !mediaUrl.trim()) {
      setError(
        'Video files are not stored in drafts. Add a video URL or publish directly to YouTube.'
      )
      return
    }

    if (postType === 'link' && !linkUrl.trim()) {
      setError('Add a link URL before saving this draft.')
      return
    }

    if (postType === 'text' && !description.trim()) {
      setError('Add some text before saving this draft.')
      return
    }

    setPublishing(true)

    try {
      const savedDraft = await apiRequest('/posts/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform: targetPlatform,
          post_type: postType,
          title: title.trim(),
          caption: description,
          tags: tags
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean),
          media_url: mediaUrl.trim() || null,
          link_url: linkUrl.trim() || null
        })
      })

      setResult({
        ...savedDraft,
        title: title.trim(),
        post_type: postType,
        status: 'draft'
      })
    } catch (saveError) {
      setError(
        saveError.message || 'Could not save your draft.'
      )
    } finally {
      setPublishing(false)
    }
  }

  async function handleDeleteDraft(draftId) {
    setError('')

    try {
      await apiRequest(`/posts/drafts/${draftId}`, {
        method: 'DELETE'
      })

      setDrafts(current =>
        current.filter(draft => draft.draft_id !== draftId)
      )
    } catch (deleteError) {
      setError(
        deleteError.message || 'Could not delete this draft.'
      )
    }
  }

  const canPublish =
    postType === 'video' &&
    targetPlatform === 'youtube' &&
    Boolean(selectedPlatformId)

  return (
    <div
      className="create-post-overlay"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !publishing) {
          onClose()
        }
      }}
    >
      <section
        className="create-post-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
      >
        <header className="create-post-header">
          <div>
            <span className="section-eyebrow">PUBLISH CONTENT</span>
            <h2 id="create-post-title">
              {result
                ? result.status === 'draft'
                  ? 'Draft saved'
                  : 'Your video is live'
                : 'Create a post'}
            </h2>
            <p>
              One composer, with platform-specific publishing handled
              by reusable adapters.
            </p>
          </div>
          <button
            type="button"
            className="create-post-close"
            onClick={onClose}
            disabled={publishing}
            aria-label="Close post composer"
          >
            ×
          </button>
        </header>

        {result ? (
          <div className="create-post-success" role="status">
            <strong>{result.title}</strong>
            {result.status === 'draft' ? (
              <p>
                Your {result.post_type} post was saved as a draft.
              </p>
            ) : (
              <>
                <p>Your video was published to YouTube.</p>
                <a href={result.url} target="_blank" rel="noreferrer">
                  View on YouTube
                </a>
              </>
            )}
            <button
              type="button"
              className="create-post-primary"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        ) : (
          <form className="create-post-form" onSubmit={handleSubmit}>
            <label className="create-post-field">
              Post format
              <select
                value={postType}
                onChange={event => setPostType(event.target.value)}
              >
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="text">Text</option>
                <option value="link">Link</option>
              </select>
            </label>

            <label className="create-post-field">
              Target platform
              <select
                value={targetPlatform}
                onChange={event =>
                  setTargetPlatform(event.target.value)
                }
              >
                {PLATFORMS.map(platform => (
                  <option key={platform} value={platform}>
                    {platform[0].toUpperCase() + platform.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="create-post-field">
              Title
              <input
                type="text"
                value={title}
                onChange={event => setTitle(event.target.value)}
                maxLength={100}
                placeholder="Give your post a title"
                required
              />
              <small>{title.length}/100 characters</small>
            </label>

            <label className="create-post-field">
              {postType === 'text' ? 'Post text' : 'Caption / description'}
              <textarea
                value={description}
                onChange={event => setDescription(event.target.value)}
                maxLength={5000}
                rows={4}
                placeholder={
                  postType === 'text'
                    ? 'Write your post'
                    : 'Add context for your post'
                }
              />
            </label>

            {(postType === 'video' || postType === 'image') && (
              <label className="create-post-field">
                {postType === 'video' ? 'Video file' : 'Image URL'}
                {postType === 'video' ? (
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={event =>
                      setVideo(event.target.files?.[0] || null)
                    }
                    required={canPublish}
                  />
                ) : (
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={event => setMediaUrl(event.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                )}
                <small>
                  {postType === 'video'
                    ? 'MP4, MOV, or WebM · up to 256 MB'
                    : 'Use a publicly accessible image URL.'}
                </small>
              </label>
            )}

            {postType === 'video' && (
              <label className="create-post-field">
                Video URL for draft
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={event => setMediaUrl(event.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
                <small>
                  Uploaded files are used for publishing but are not
                  stored with drafts.
                </small>
              </label>
            )}

            {postType === 'link' && (
              <label className="create-post-field">
                Link URL
                <input
                  type="url"
                  value={linkUrl}
                  onChange={event => setLinkUrl(event.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </label>
            )}

            {(postType === 'video' || postType === 'image') && (
              <label className="create-post-field">
                Tags
                <input
                  type="text"
                  value={tags}
                  onChange={event => setTags(event.target.value)}
                  placeholder="Separate tags with commas"
                />
              </label>
            )}

            {canPublish && (
              <>
                <label className="create-post-field">
                  YouTube account
                  <select
                    value={selectedPlatformId}
                    onChange={event =>
                      setSelectedPlatformId(event.target.value)
                    }
                    disabled={loadingPlatforms}
                    required
                  >
                    {platforms.map(platform => (
                      <option
                        key={platform.platform_id}
                        value={platform.platform_id}
                      >
                        {platform.account_name || 'Connected YouTube account'}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="create-post-field">
                  Visibility
                  <select
                    value={privacyStatus}
                    onChange={event =>
                      setPrivacyStatus(event.target.value)
                    }
                  >
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="public">Public</option>
                  </select>
                </label>
              </>
            )}

            <div className="create-post-platform-note">
              {canPublish
                ? 'YouTube video publishing is active. Other formats and platforms can be added through the shared publishing adapter.'
                : 'This format/platform is saved as a draft. Live publishing is currently available for YouTube videos only.'}
            </div>

            {error && (
              <p className="create-post-error" role="alert">
                {error}
              </p>
            )}

            {!loadingPlatforms &&
              platforms.length === 0 &&
              targetPlatform === 'youtube' && (
                <button
                  type="button"
                  className="create-post-secondary"
                  onClick={connectYouTube}
                  disabled={connecting}
                >
                  {connecting
                    ? 'Opening YouTube authorization...'
                    : 'Connect / reconnect YouTube'}
                </button>
              )}

            {platforms.length > 0 && targetPlatform === 'youtube' && (
              <p className="create-post-reconnect">
                If uploads are denied, reconnect YouTube to grant
                publishing permission.
                <button
                  type="button"
                  onClick={connectYouTube}
                  disabled={connecting || publishing}
                >
                  {connecting ? 'Opening...' : 'Reconnect'}
                </button>
              </p>
            )}

            {drafts.length > 0 && (
              <section className="create-post-drafts">
                <h3>Saved drafts</h3>
                {drafts.map(draft => (
                  <div
                    className="create-post-draft-row"
                    key={draft.draft_id}
                  >
                    <span>
                      <strong>{draft.title}</strong>
                      <small>
                        {draft.post_type} · {draft.platform}
                      </small>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteDraft(draft.draft_id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </section>
            )}

            <footer className="create-post-actions">
              <button
                type="button"
                className="create-post-secondary"
                onClick={onClose}
                disabled={publishing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="create-post-secondary"
                onClick={handleSaveDraft}
                disabled={publishing}
              >
                Save draft
              </button>
              {canPublish && (
                <button
                  type="submit"
                  className="create-post-primary"
                  disabled={publishing}
                >
                  {publishing ? 'Uploading video…' : 'Publish video'}
                </button>
              )}
            </footer>
          </form>
        )}
      </section>
    </div>
  )
}

export default CreatePost
