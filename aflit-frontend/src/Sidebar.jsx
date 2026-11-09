import './App.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  faHouse,
  faChartLine,
  faClapperboard,
  faUsers,
  faWallet,
  faWandMagicSparkles,
  faLayerGroup,
  faGear,
  faRightFromBracket
} from '@fortawesome/free-solid-svg-icons'

function Sidebar({ activeSection, onNavigate, onLogout }) {

  // Navigation items
  const menuItems = [
    'Dashboard',
    'Analytics',
    'Content',
    'Audience',
    'Monetization',
    'AI Insights',
    'Platforms',
    'Settings'
  ]

  // Icon assigned to each navigation item
  const menuIcons = {
    Dashboard: faHouse,
    Analytics: faChartLine,
    Content: faClapperboard,
    Audience: faUsers,
    Monetization: faWallet,
    'AI Insights': faWandMagicSparkles,
    Platforms: faLayerGroup,
    Settings: faGear
  }

  return (
    <>
      <aside className="sidebar">
        <h2>Aflit</h2>

        <nav aria-label="Main navigation">
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              className={
                activeSection === item
                  ? 'nav-item active'
                  : 'nav-item'
              }
              aria-current={
                activeSection === item ? 'page' : undefined
              }
              onClick={() => onNavigate(item)}
            >
              <i className="nav-icon" aria-hidden="true">
                <FontAwesomeIcon icon={menuIcons[item]} />
              </i>

              {item}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="nav-item"
          onClick={onLogout}
        >
          <i className="nav-icon" aria-hidden="true">
            <FontAwesomeIcon icon={faRightFromBracket} />
          </i>

          Log out
        </button>
      </aside>

      <nav
        className="mobile-bottom-nav"
        aria-label="Mobile navigation"
      >
        {menuItems.map((item) => (
          <button
            key={item}
            type="button"
            aria-label={item}
            title={item}
            className={
              activeSection === item
                ? 'mobile-nav-item active'
                : 'mobile-nav-item'
            }
            aria-current={
              activeSection === item ? 'page' : undefined
            }
            onClick={() => onNavigate(item)}
          >
            <i className="nav-icon" aria-hidden="true">
              <FontAwesomeIcon icon={menuIcons[item]} />
            </i>
          </button>
        ))}
      </nav>
    </>
  )
}

export default Sidebar