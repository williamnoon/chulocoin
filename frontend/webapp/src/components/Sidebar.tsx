import { NavLink } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Signal Feed', href: '/signals', icon: '📡' },
  { name: 'Positions', href: '/positions', icon: '💼' },
  { name: 'Bot Settings', href: '/settings', icon: '⚙️' },
  { name: 'Upgrade', href: '/upgrade', icon: '⭐' },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-950 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-chulo">ChuloBots</h1>
        <p className="text-xs text-gray-400 mt-1">Trading Dashboard</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navigation.map(item => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-chulo text-white'
                  : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="text-xl mr-3">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-gray-500">
          <p>© 2024 ChuloBots</p>
          <p className="mt-1">Powered by Chainlink</p>
        </div>
      </div>
    </div>
  );
}
