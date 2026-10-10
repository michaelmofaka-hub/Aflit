
import './App.css'

function Sidebar({ activeSection, onNavigate }) {
  const menuItems = [
    'Dashboard',
    'Analytics',
    'Content',
    'Audience',
    'Monetization',
    'AI Insights',
    'Platforms'
  ]

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
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <nav
        className="mobile-bottom-nav"
        aria-label="Mobile navigation"
      >
        {menuItems.map((item) => (
          <button
            key={item}
            type="button"
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
            {item}
          </button>
        ))}
      </nav>
    </>
  )
}

export default Sidebar
