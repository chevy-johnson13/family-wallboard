import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/today', label: 'Today', icon: '📅' },
  { path: '/week', label: 'Week', icon: '📆' },
  { path: '/month', label: 'Month', icon: '🗓️' },
  { path: '/tasks', label: 'Tasks', icon: '✅' },
  { path: '/meals', label: 'Meals', icon: '🍽️' },
];

export default function Navigation() {
  return (
    <nav className="bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center h-20">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-t-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <span className="text-3xl mb-1" style={{ fontFamily: 'Emoji, Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

