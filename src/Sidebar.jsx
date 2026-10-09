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
    <aside className="sidebar">
      <h2>Aflit</h2>

      <nav>
        {menuItems.map((item) => (
          <p
            key={item}
            className={
              activeSection === item
                ? 'nav-item active'
                : 'nav-item'
            }
            onClick={() => onNavigate(item)}
            style={{ cursor: 'pointer' }}
          >
            {item}
          </p>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar