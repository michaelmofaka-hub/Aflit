
import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faWandMagicSparkles,
  faPaperPlane,
  faPlus,
  faChartLine,
  faUsers,
  faLightbulb,
  faMoneyBillTrendUp,
  faArrowUpRightFromSquare,
  faRobot,
  faUser,
  faCircleNotch,
  faComments,
  faBullseye
} from '@fortawesome/free-solid-svg-icons'

import { apiRequest } from './api'
import './App.css'

const QUICK_ACTIONS = [
  {
    title: 'Analyze my channel',
    description: 'Understand your current creator performance.',
    icon: faChartLine,
    prompt:
      'Analyze my connected creator accounts. Give me an overview using my actual stored data. Clearly identify missing information.'
  },
  {
    title: 'Grow my audience',
    description: 'Find practical ways to attract more viewers.',
    icon: faUsers,
    prompt:
      'Analyze my available audience and content data. Give me a practical audience growth strategy based on what you can verify.'
  },
  {
    title: 'Improve my content',
    description: 'Discover content opportunities and ideas.',
    icon: faLightbulb,
    prompt:
      'Review my available content data and suggest content improvements. Do not invent performance statistics.'
  },
  {
    title: 'Find monetization opportunities',
    description: 'Explore ways to turn attention into income.',
    icon: faMoneyBillTrendUp,
    prompt:
      'Analyze my creator business and identify realistic monetization opportunities. Consider my current audience size and available data.'
  }
]

const SUGGESTED_PROMPTS = [
  'What should I focus on first as a new creator?',
  'Give me a 7-day content strategy.',
  'What data do you currently have about my account?'
]

function AIAgentPage() {
  const [messages, setMessages] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showActions, setShowActions] = useState(true)

  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    })
  }, [messages, loading])

  async function sendMessage(text) {
    const cleanMessage = text.trim()

    if (!cleanMessage || loading) return

    const token = localStorage.getItem('token')

    if (!token) {
      setError('Your session has expired. Please log in again.')
      return
    }

    const userMessage = {
      role: 'user',
      content: cleanMessage
    }

    setMessages(previous => [...previous, userMessage])
    setMessage('')
    setError('')
    setLoading(true)
    setShowActions(false)

    try {
      const payload = {
        message: cleanMessage
      }

      if (conversationId) {
        payload.conversation_id = conversationId
      }

      const data = await apiRequest('/ai/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload),
        timeoutMs: 90000
      })

      if (data.conversation_id) {
        setConversationId(data.conversation_id)
      }

      setMessages(previous => [
        ...previous,
        {
          role: 'assistant',
          content: data.response || 'I received an empty response. Please try again.'
        }
      ])
    } catch (requestError) {
      setError(
        requestError.message ||
        'Aflit could not reach the AI agent. Please try again.'
      )
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendMessage(message)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage(message)
    }
  }

  function startNewConversation() {
    if (loading) return

    setMessages([])
    setConversationId(null)
    setMessage('')
    setError('')
    setShowActions(true)
    textareaRef.current?.focus()
  }

  function handleQuickAction(prompt) {
    sendMessage(prompt)
  }

  return (
    <section className="ai-agent-page">

      {/* Workspace heading */}
      <header className="ai-agent-header">
        <div className="ai-agent-heading">
          <div className="ai-agent-heading-icon">
            <FontAwesomeIcon icon={faWandMagicSparkles} />
          </div>

          <div>
            <div className="ai-agent-eyebrow">
              AFLIT INTELLIGENCE
            </div>

            <h1>Aflit AI Agent</h1>

            <p>
              Your creator intelligence and business assistant.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="ai-agent-new-chat"
          onClick={startNewConversation}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>New chat</span>
        </button>
      </header>

      {/* Main workspace */}
      <div className="ai-agent-workspace">

        {/* Chat area */}
        <main className="ai-agent-chat">

          <div className="ai-agent-chat-top">
            <div className="ai-agent-status">
              <span className="ai-agent-status-dot" />
              AI assistant
              <span className="ai-agent-status-label">
                Ready to help
              </span>
            </div>

            {conversationId && (
              <span className="ai-agent-session-id">
                Conversation active
              </span>
            )}
          </div>

          <div className="ai-agent-messages">

            {/* Welcome screen */}
            {messages.length === 0 && (
              <div className="ai-agent-welcome">

                <div className="ai-agent-welcome-symbol">
                  <FontAwesomeIcon icon={faWandMagicSparkles} />
                </div>

                <span className="ai-agent-welcome-label">
                  YOUR CREATOR BUSINESS, UNDERSTOOD
                </span>

                <h2>
                  What are we
                  <span> building today?</span>
                </h2>

                <p className="ai-agent-welcome-description">
                  Ask questions, understand your performance,
                  discover opportunities and plan your next move.
                </p>

                {showActions && (
                  <div className="ai-agent-quick-actions">
                    {QUICK_ACTIONS.map(action => (
                      <button
                        type="button"
                        className="ai-agent-action-card"
                        key={action.title}
                        onClick={() =>
                          handleQuickAction(action.prompt)
                        }
                        disabled={loading}
                      >
                        <span className="ai-agent-action-icon">
                          <FontAwesomeIcon icon={action.icon} />
                        </span>

                        <span className="ai-agent-action-copy">
                          <strong>{action.title}</strong>
                          <small>{action.description}</small>
                        </span>

                        <FontAwesomeIcon
                          className="ai-agent-action-arrow"
                          icon={faArrowUpRightFromSquare}
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="ai-agent-suggestions">
                  <span>TRY ASKING</span>

                  {SUGGESTED_PROMPTS.map(prompt => (
                    <button
                      type="button"
                      key={prompt}
                      onClick={() => handleQuickAction(prompt)}
                      disabled={loading}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation messages */}
            {messages.map((item, index) => (
              <article
                className={`ai-agent-message ${item.role}`}
                key={`${index}-${item.role}`}
              >
                <div className="ai-agent-avatar">
                  <FontAwesomeIcon
                    icon={
                      item.role === 'assistant'
                        ? faRobot
                        : faUser
                    }
                  />
                </div>

                <div className="ai-agent-message-content">
                  <div className="ai-agent-message-author">
                    {item.role === 'assistant'
                      ? 'Aflit Intelligence'
                      : 'You'}
                  </div>

                  <div className="ai-agent-message-bubble">
                    {item.content}
                  </div>
                </div>
              </article>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="ai-agent-message assistant">
                <div className="ai-agent-avatar">
                  <FontAwesomeIcon icon={faRobot} />
                </div>

                <div className="ai-agent-message-content">
                  <div className="ai-agent-message-author">
                    Aflit Intelligence
                  </div>

                  <div className="ai-agent-thinking">
                    <FontAwesomeIcon
                      icon={faCircleNotch}
                      spin
                    />
                    Analyzing your request...
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Error message */}
          {error && (
            <div className="ai-agent-error" role="alert">
              {error}
            </div>
          )}

          {/* Message composer */}
          <form
            className="ai-agent-composer"
            onSubmit={handleSubmit}
          >
            <textarea
              ref={textareaRef}
              value={message}
              onChange={event => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Aflit anything about your creator business..."
              rows={2}
              disabled={loading}
              aria-label="Message Aflit AI Agent"
            />

            <div className="ai-agent-composer-bottom">
              <span>
                <FontAwesomeIcon icon={faComments} />
                Shift + Enter for a new line
              </span>

              <button
                type="submit"
                disabled={!message.trim() || loading}
                aria-label="Send message"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                <span>Send</span>
              </button>
            </div>
          </form>

          <p className="ai-agent-disclaimer">
            Aflit AI can make mistakes. Verify important decisions
            against your actual platform data.
          </p>
        </main>

        {/* Capability panel */}
        <aside className="ai-agent-side-panel">
          <div className="ai-agent-side-heading">
            <div>
              <span>YOUR WORKSPACE</span>
              <h3>Agent capabilities</h3>
            </div>

            <FontAwesomeIcon icon={faBullseye} />
          </div>

          <div className="ai-agent-capability">
            <span className="ai-agent-capability-icon">
              <FontAwesomeIcon icon={faChartLine} />
            </span>
            <div>
              <strong>Creator analytics</strong>
              <p>Understand your stored performance data.</p>
            </div>
          </div>

          <div className="ai-agent-capability">
            <span className="ai-agent-capability-icon">
              <FontAwesomeIcon icon={faUsers} />
            </span>
            <div>
              <strong>Audience strategy</strong>
              <p>Find opportunities to grow your community.</p>
            </div>
          </div>

          <div className="ai-agent-capability">
            <span className="ai-agent-capability-icon">
              <FontAwesomeIcon icon={faLightbulb} />
            </span>
            <div>
              <strong>Content intelligence</strong>
              <p>Turn creator data into content decisions.</p>
            </div>
          </div>

          <div className="ai-agent-capability">
            <span className="ai-agent-capability-icon">
              <FontAwesomeIcon icon={faMoneyBillTrendUp} />
            </span>
            <div>
              <strong>Monetization strategy</strong>
              <p>Explore ways to build creator income.</p>
            </div>
          </div>

          <div className="ai-agent-side-note">
            <FontAwesomeIcon icon={faWandMagicSparkles} />
            <div>
              <strong>More capabilities coming</strong>
              <p>
                Content generation, external integrations
                and creator workflows will be added as
                their backend tools become available.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default AIAgentPage
