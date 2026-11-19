
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  faUser,
  faShieldHalved,
  faLayerGroup,
  faBell,
  faWandMagicSparkles,
  faSliders
} from '@fortawesome/free-solid-svg-icons'

import './App.css'

const initialAccount = {
  username: '',
  fullName: '',
  email: '',
  country: 'Kenya',
  bio: ''
}

const initialSecurity = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
}

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Account')

  // Account state
  const [account, setAccount] = useState(initialAccount)
  const [savedAccount, setSavedAccount] = useState(initialAccount)
  const [editingAccount, setEditingAccount] = useState(false)
  const [accountMessage, setAccountMessage] = useState('')

  // Security state
  const [security, setSecurity] = useState(initialSecurity)
  const [showPasswords, setShowPasswords] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [securityMessage, setSecurityMessage] = useState('')

  const settingsTabs = [
    { name: 'Account', icon: faUser },
    { name: 'Security', icon: faShieldHalved },
    { name: 'Connected Platforms', icon: faLayerGroup },
    { name: 'Notifications', icon: faBell },
    { name: 'AI Preferences', icon: faWandMagicSparkles },
    { name: 'General', icon: faSliders }
  ]

    
const [notifications, setNotifications] = useState({
  email: true,
  platformSync: true,
  aiInsights: true,
  audienceGrowth: false,
  monetization: true,
  security: true
})


const [aiPreferences, setAiPreferences] = useState({
  responseStyle: 'balanced',
  useCreatorData: true,
  memory: true,
  proactiveInsights: true,
  requireApproval: true,
  contentAssistance: true
})

    const [generalPreferences, setGeneralPreferences] = useState({
  language: 'en',
  timezone: 'Africa/Nairobi',
  theme: 'dark',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: 'en-KE',
  startupPage: 'Dashboard',
  compactMode: false
})



  function handleAccountEdit() {
    setSavedAccount({ ...account })
    setAccountMessage('')
    setEditingAccount(true)
  }

  function handleAccountCancel() {
    setAccount({ ...savedAccount })
    setEditingAccount(false)
    setAccountMessage('')
  }

  function handleAccountSave() {
    setSavedAccount({ ...account })
    setEditingAccount(false)
    setAccountMessage('Profile changes saved locally. Backend integration pending.')
  }

  function handlePasswordUpdate() {
    if (
      !security.currentPassword ||
      !security.newPassword ||
      !security.confirmPassword
    ) {
      setSecurityMessage('Please complete all password fields.')
      return
    }

    if (security.newPassword.length < 8) {
      setSecurityMessage('New password must contain at least 8 characters.')
      return
    }

    if (security.newPassword !== security.confirmPassword) {
      setSecurityMessage('New passwords do not match.')
      return
    }

    setSecurityMessage(
      'Password validation successful. Backend integration pending.'
    )
  }

  function renderSettingsContent() {
    switch (activeTab) {

      // ACCOUNT
      case 'Account':
        return (
          <div className="settings-panel">

            <div className="settings-panel-heading">
              <h2>Account Information</h2>
              <p>Manage your personal identity and creator profile.</p>
            </div>

            <div className="settings-info-card">
              <div className="settings-info-icon">
                <FontAwesomeIcon icon={faUser} />
              </div>

              <div>
                <h3>Creator Profile</h3>
                <p>
                  Manage the information associated with your Aflit account.
                </p>
              </div>
            </div>

            <div className="settings-form-card">

              <div className="settings-card-heading">
                <div>
                  <h3>Personal Information</h3>
                  <p>Update the details associated with your account.</p>
                </div>

                {!editingAccount && (
                  <button
                    type="button"
                    onClick={handleAccountEdit}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="settings-form-grid">

                <label>
                  Username
                  <input
                    value={account.username}
                    disabled={!editingAccount}
                    onChange={(e) =>
                      setAccount({
                        ...account,
                        username: e.target.value
                      })
                    }
                    placeholder="Your username"
                  />
                </label>

                <label>
                  Full Name
                  <input
                    value={account.fullName}
                    disabled={!editingAccount}
                    onChange={(e) =>
                      setAccount({
                        ...account,
                        fullName: e.target.value
                      })
                    }
                    placeholder="Your full name"
                  />
                </label>

                <label>
                  Email Address
                  <input
                    type="email"
                    value={account.email}
                    disabled={!editingAccount}
                    onChange={(e) =>
                      setAccount({
                        ...account,
                        email: e.target.value
                      })
                    }
                    placeholder="Your email address"
                  />
                </label>

                <label>
                  Country
                  <select
                    value={account.country}
                    disabled={!editingAccount}
                    onChange={(e) =>
                      setAccount({
                        ...account,
                        country: e.target.value
                      })
                    }
                  >
                    <option value="Kenya">Kenya</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </label>

              </div>

              <label className="settings-full-field">
                Creator Bio
                <textarea
                  value={account.bio}
                  disabled={!editingAccount}
                  onChange={(e) =>
                    setAccount({
                      ...account,
                      bio: e.target.value
                    })
                  }
                  placeholder="Tell us about yourself..."
                />
              </label>

              {editingAccount && (
                <div className="settings-form-actions">

                  <button
                    type="button"
                    onClick={handleAccountCancel}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleAccountSave}
                  >
                    Save Changes
                  </button>

                </div>
              )}

              {accountMessage && (
                <p className="settings-feedback">
                  {accountMessage}
                </p>
              )}

            </div>

            <div className="settings-form-card">

              <h3>Account Management</h3>

              <div className="settings-action-row">
                <div>
                  <h4>Export Account Data</h4>
                  <p>
                    Request a copy of your Aflit account information.
                  </p>
                </div>

                <button type="button">
                  Export Data
                </button>
              </div>

              <div className="settings-action-row danger">
                <div>
                  <h4>Delete Account</h4>
                  <p>
                    Permanently delete your account and associated data.
                  </p>
                </div>

                <button type="button">
                  Delete Account
                </button>
              </div>

            </div>
          </div>
        )

      // SECURITY
      case 'Security':
        return (
          <div className="settings-panel">

            <div className="settings-panel-heading">
              <h2>Security & Privacy</h2>
              <p>
                Protect your account and manage access to Aflit.
              </p>
            </div>

            <div className="settings-form-card">

              <div className="settings-card-heading">
                <div>
                  <h3>Password Management</h3>
                  <p>
                    Update your account password regularly.
                  </p>
                </div>
              </div>

              <div className="settings-form-grid">

                <label>
                  Current Password
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={security.currentPassword}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        currentPassword: e.target.value
                      })
                    }
                    placeholder="Current password"
                  />
                </label>

                <label>
                  New Password
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={security.newPassword}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        newPassword: e.target.value
                      })
                    }
                    placeholder="New password"
                  />
                </label>

                <label>
                  Confirm New Password
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={security.confirmPassword}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        confirmPassword: e.target.value
                      })
                    }
                    placeholder="Confirm new password"
                  />
                </label>

              </div>

              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(e) =>
                    setShowPasswords(e.target.checked)
                  }
                />
                Show passwords
              </label>

              <div className="settings-form-actions">

                <button
                  type="button"
                  onClick={() => {
                    setSecurity(initialSecurity)
                    setSecurityMessage('')
                  }}
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={handlePasswordUpdate}
                >
                  Update Password
                </button>

              </div>

              {securityMessage && (
                <p className="settings-feedback">
                  {securityMessage}
                </p>
              )}

            </div>

            <div className="settings-form-card">

              <div className="settings-action-row">
                <div>
                  <h4>Two-Factor Authentication</h4>
                  <p>
                    Add another layer of protection when signing in.
                  </p>
                </div>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) =>
                      setTwoFactorEnabled(e.target.checked)
                    }
                  />

                  <span>
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <p className="settings-description">
                This is currently a frontend preference only.
                Actual two-factor authentication requires backend support.
              </p>

            </div>

            <div className="settings-form-card">

              <h3>Active Sessions</h3>

              <p className="settings-description">
                Devices currently or recently accessing your account.
              </p>

              <div className="settings-session-row">

                <div className="settings-info-icon">
                  <FontAwesomeIcon icon={faShieldHalved} />
                </div>

                <div>
                  <h4>Current Device</h4>
                  <p>This browser · Current session</p>
                  <span className="settings-session-status">
                    Active now
                  </span>
                </div>

              </div>

              <div className="settings-action-row">
                <div>
                  <h4>Sign Out Other Devices</h4>
                  <p>
                    End sessions on all other devices.
                  </p>
                </div>

                <button type="button">
                  Sign Out Others
                </button>
              </div>

              <div className="settings-action-row danger">
                <div>
                  <h4>Sign Out Everywhere</h4>
                  <p>
                    End all sessions, including this one.
                  </p>
                </div>

                <button type="button">
                  Sign Out All
                </button>
              </div>

            </div>

          </div>
        )

      // CONNECTED PLATFORMS
      
      case 'Connected Platforms':
        return (
          <div className="settings-panel">

            <div className="settings-panel-heading">
              <h2>Connected Platforms</h2>
              <p>
                Manage the creator platforms connected to your Aflit account.
              </p>
            </div>

            <div className="settings-info-card">
              <div className="settings-info-icon">
                <FontAwesomeIcon icon={faLayerGroup} />
              </div>

              <div>
                <h3>Your Creator Network</h3>
                <p>
                  Connect your social accounts to bring your creator
                  performance data into one workspace.
                </p>
              </div>
            </div>

            <div className="settings-form-card">
              <div className="settings-card-heading">
                <div>
                  <h3>Platform Accounts</h3>
                  <p>
                    Review the platforms supported by Aflit.
                  </p>
                </div>
              </div>

              <div className="settings-platform-list">

                <div className="settings-platform-item">
                  <div>
                    <h4>YouTube</h4>
                    <p>Channel analytics, videos and audience data</p>
                  </div>
                  <span className="settings-status">
                    Connection details pending
                  </span>
                </div>

                <div className="settings-platform-item">
                  <div>
                    <h4>TikTok</h4>
                    <p>Video performance and audience insights</p>
                  </div>
                  <span className="settings-status">
                    Not connected
                  </span>
                </div>

                <div className="settings-platform-item">
                  <div>
                    <h4>Instagram</h4>
                    <p>Content performance and audience insights</p>
                  </div>
                  <span className="settings-status">
                    Not connected
                  </span>
                </div>

                <div className="settings-platform-item">
                  <div>
                    <h4>Facebook</h4>
                    <p>Page performance and audience insights</p>
                  </div>
                  <span className="settings-status">
                    Not connected
                  </span>
                </div>

              </div>
            </div>

            <div className="settings-form-card">
              <h3>Connection Management</h3>

              <div className="settings-action-row">
                <div>
                  <h4>Account Permissions</h4>
                  <p>
                    Review the access permissions granted to Aflit
                    by connected platforms.
                  </p>
                </div>
              </div>

              <div className="settings-action-row">
                <div>
                  <h4>Data Synchronization</h4>
                  <p>
                    Manage how your platform data is synchronized
                    with Aflit.
                  </p>
                </div>
              </div>

              <div className="settings-action-row danger">
                <div>
                  <h4>Disconnect Account</h4>
                  <p>
                    Remove a platform connection and stop future
                    synchronization.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )


      // NOTIFICATIONS
      
      case 'Notifications':
        return (
          <div className="settings-panel">

            <div className="settings-panel-heading">
              <h2>Notification Preferences</h2>
              <p>
                Choose which updates Aflit sends you.
              </p>
            </div>

            <div className="settings-info-card">
              <div className="settings-info-icon">
                <FontAwesomeIcon icon={faBell} />
              </div>

              <div>
                <h3>Stay Informed</h3>
                <p>
                  Receive important updates about your creator
                  accounts, performance and business activity.
                </p>
              </div>
            </div>

            <div className="settings-form-card">

              <h3>Notification Channels</h3>
              <p className="settings-description">
                Choose where you want to receive Aflit updates.
              </p>

              <div className="settings-action-row">
                <div>
                  <h4>Email Notifications</h4>
                  <p>
                    Receive updates through your registered email.
                  </p>
                </div>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        email: e.target.checked
                      })
                    }
                  />
                  <span>
                    {notifications.email ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

            </div>

            <div className="settings-form-card">

              <h3>Notification Categories</h3>
              <p className="settings-description">
                Select the types of updates you want to receive.
              </p>

              <div className="settings-action-row">
                <div>
                  <h4>Platform Synchronization</h4>
                  <p>
                    Alerts when platform data syncs successfully
                    or encounters an error.
                  </p>
                </div>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={notifications.platformSync}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        platformSync: e.target.checked
                      })
                    }
                  />
                  <span>
                    {notifications.platformSync ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="settings-action-row">
                <div>
                  <h4>AI Insights</h4>
                  <p>
                    Receive new creator insights, strategies
                    and recommendations from your AI agent.
                  </p>
                </div>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={notifications.aiInsights}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        aiInsights: e.target.checked
                      })
                    }
                  />
                  <span>
                    {notifications.aiInsights ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="settings-action-row">
                <div>
                  <h4>Audience Growth</h4>
                  <p>
                    Updates about subscriber growth and audience
                    engagement changes.
                  </p>
                </div>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={notifications.audienceGrowth}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        audienceGrowth: e.target.checked
                      })
                    }
                  />
                  <span>
                    {notifications.audienceGrowth ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="settings-action-row">
                <div>
                  <h4>Monetization & Revenue</h4>
                  <p>
                    Updates about earnings, transactions
                    and monetization activity.
                  </p>
                </div>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={notifications.monetization}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        monetization: e.target.checked
                      })
                    }
                  />
                  <span>
                    {notifications.monetization ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="settings-action-row">
                <div>
                  <h4>Account & Security</h4>
                  <p>
                    Important account activity and security alerts.
                  </p>
                </div>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={notifications.security}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        security: e.target.checked
                      })
                    }
                  />
                  <span>
                    {notifications.security ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

            </div>

            <div className="settings-status">
              Notification preferences currently apply locally.
              Saving them permanently and sending actual notifications
              will require backend integration.
            </div>

          </div>
        )


      // AI PREFERENCES
      
      case 'AI Preferences':
        return (
          <div className="settings-panel">

            <div className="settings-panel-heading">
              <h2>AI Preferences</h2>
              <p>
                Customize how your Aflit AI agent understands
                and supports your creator business.
              </p>
            </div>

            <div className="settings-info-card">
              <div className="settings-info-icon">
                <FontAwesomeIcon icon={faWandMagicSparkles} />
              </div>

              <div>
                <h3>Creator Intelligence Agent</h3>
                <p>
                  Configure personalization, data access,
                  memory and agent behavior.
                </p>
              </div>
            </div>

            {/* RESPONSE STYLE */}
            <div className="settings-form-card">

              <h3>Communication Preferences</h3>
              <p className="settings-description">
                Choose how your AI agent communicates with you.
              </p>

              <div className="settings-action-row">
                <div>
                  <h4>Response Style</h4>
                  <p>
                    Control the level of detail in AI responses.
                  </p>
                </div>

                <select
                  value={aiPreferences.responseStyle}
                  onChange={(e) =>
                    setAiPreferences({
                      ...aiPreferences,
                      responseStyle: e.target.value
                    })
                  }
                >
                  <option value="concise">Concise</option>
                  <option value="balanced">Balanced</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>

            </div>

            {/* DATA AND MEMORY */}
            <div className="settings-form-card">

              <h3>Data & Memory</h3>
              <p className="settings-description">
                Control how the agent uses your creator information.
              </p>

              <div className="settings-action-row">
                <div>
                  <h4>Use Creator Data</h4>
                  <p>
                    Allow the agent to use connected platforms,
                    analytics, content and audience information.
                  </p>
                </div>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={aiPreferences.useCreatorData}
                    onChange={(e) =>
                      setAiPreferences({
                        ...aiPreferences,
                        useCreatorData: e.target.checked
                      })
                    }
                  />
                  <span>
                    {aiPreferences.useCreatorData ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="settings-action-row">
                <div>
                  <h4>AI Memory</h4>
                  <p>
                    Allow the agent to retain useful creator
                    preferences and conversation context.
                  </p>
                </div>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={aiPreferences.memory}
                    onChange={(e) =>
                      setAiPreferences({
                        ...aiPreferences,
                        memory: e.target.checked
                      })
                    }
                  />
                  <span>
                    {aiPreferences.memory ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

            </div>

            {/* AGENT BEHAVIOR */}
            <div className="settings-form-card">

              <h3>Agent Behavior</h3>
              <p className="settings-description">
                Define how actively your agent works for you.
              </p>

              <div className="settings-action-row">
                <div>
                  <h4>Proactive Insights</h4>
                  <p>
                    Allow the agent to identify opportunities,
                    performance changes and potential problems.
                  </p>
                </div>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={aiPreferences.proactiveInsights}
                    onChange={(e) =>
                      setAiPreferences({
                        ...aiPreferences,
                        proactiveInsights: e.target.checked
                      })
                    }
                  />
                  <span>
                    {aiPreferences.proactiveInsights ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="settings-action-row">
                <div>
                  <h4>Require Approval Before Actions</h4>
                  <p>
                    Ask for your approval before the agent performs
                    actions on your behalf.
                  </p>
                </div>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={aiPreferences.requireApproval}
                    onChange={(e) =>
                      setAiPreferences({
                        ...aiPreferences,
                        requireApproval: e.target.checked
                      })
                    }
                  />
                  <span>
                    {aiPreferences.requireApproval ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="settings-action-row">
                <div>
                  <h4>Content Assistance</h4>
                  <p>
                    Allow the agent to suggest content ideas,
                    titles, strategies and improvements.
                  </p>
                </div>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={aiPreferences.contentAssistance}
                    onChange={(e) =>
                      setAiPreferences({
                        ...aiPreferences,
                        contentAssistance: e.target.checked
                      })
                    }
                  />
                  <span>
                    {aiPreferences.contentAssistance ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

            </div>

            <div className="settings-status">
              These preferences currently affect frontend state only.
              We will connect them to the AI agent configuration
              and memory system later.
            </div>

          </div>
        )


      // GENERAL
      case 'General':
  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h2>General Settings</h2>
        <p>Customize your Aflit application experience and regional preferences.</p>
      </div>

      <div className="settings-card">
        <h3>Regional Preferences</h3>
        <p>Choose how information is displayed in your account.</p>

        <div className="settings-form-group">
          <label>Language</label>
          <select
            value={generalPreferences.language}
            onChange={(e) =>
              setGeneralPreferences(prev => ({
                ...prev,
                language: e.target.value
              }))
            }
          >
            <option value="en">English</option>
          </select>
        </div>

        <div className="settings-form-group">
          <label>Timezone</label>
          <select
            value={generalPreferences.timezone}
            onChange={(e) =>
              setGeneralPreferences(prev => ({
                ...prev,
                timezone: e.target.value
              }))
            }
          >
            <option value="Africa/Nairobi">East Africa Time (Nairobi)</option>
            <option value="UTC">UTC</option>
            <option value="Europe/London">London</option>
            <option value="America/New_York">New York</option>
          </select>
        </div>

        <div className="settings-form-group">
          <label>Date Format</label>
          <select
            value={generalPreferences.dateFormat}
            onChange={(e) =>
              setGeneralPreferences(prev => ({
                ...prev,
                dateFormat: e.target.value
              }))
            }
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div className="settings-form-group">
          <label>Number Format</label>
          <select
            value={generalPreferences.numberFormat}
            onChange={(e) =>
              setGeneralPreferences(prev => ({
                ...prev,
                numberFormat: e.target.value
              }))
            }
          >
            <option value="en-KE">Kenya (1,234.56)</option>
            <option value="en-US">United States (1,234.56)</option>
            <option value="de-DE">Germany (1.234,56)</option>
          </select>
        </div>
      </div>

      <div className="settings-card">
        <h3>Application Appearance</h3>

        <div className="settings-form-group">
          <label>Theme</label>
          <select
            value={generalPreferences.theme}
            onChange={(e) =>
              setGeneralPreferences(prev => ({
                ...prev,
                theme: e.target.value
              }))
            }
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System Default</option>
          </select>
        </div>

        <div className="settings-toggle-row">
          <div>
            <h4>Compact Mode</h4>
            <p>Use a more compact layout to display more information on screen.</p>
          </div>

          <input
            type="checkbox"
            checked={generalPreferences.compactMode}
            onChange={(e) =>
              setGeneralPreferences(prev => ({
                ...prev,
                compactMode: e.target.checked
              }))
            }
          />
        </div>
      </div>

      <div className="settings-card">
        <h3>Startup Preferences</h3>
        <p>Choose which page opens when you enter your dashboard.</p>

        <div className="settings-form-group">
          <label>Default Landing Page</label>
          <select
            value={generalPreferences.startupPage}
            onChange={(e) =>
              setGeneralPreferences(prev => ({
                ...prev,
                startupPage: e.target.value
              }))
            }
          >
            <option value="Dashboard">Dashboard</option>
            <option value="Analytics">Analytics</option>
            <option value="Content">Content</option>
            <option value="Audience">Audience</option>
            <option value="Monetization">Monetization</option>
            <option value="AI Insights">AI Insights</option>
          </select>
        </div>
      </div>

      <div className="settings-info">
        <p>
          General preferences currently update frontend state only.
          Theme application, localization, persistence and startup routing
          will be implemented during backend and application integration.
        </p>
      </div>
    </div>
  )

      default:
        return null
    }
  }

  return (
    <section className="settings-page">

      <header className="settings-header">
        <div>

          <span className="settings-eyebrow">
            ACCOUNT CONTROL
          </span>

          <h1>Settings</h1>

          <p>
            Manage your account, integrations and Aflit experience.
          </p>

        </div>
      </header>

      <div className="settings-layout">

        <nav
          className="settings-navigation"
          aria-label="Settings navigation"
        >

          <h3>Preferences</h3>

          {settingsTabs.map((tab) => (
            <button
              key={tab.name}
              type="button"
              className={
                activeTab === tab.name
                  ? 'settings-nav-item active'
                  : 'settings-nav-item'
              }
              onClick={() => setActiveTab(tab.name)}
            >
              <FontAwesomeIcon icon={tab.icon} />
              <span>{tab.name}</span>
            </button>
          ))}

        </nav>

        <div className="settings-content">
          {renderSettingsContent()}
        </div>

      </div>

    </section>
  )
}

export default SettingsPage
