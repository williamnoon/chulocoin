import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SignalFeed from './pages/SignalFeed';
import Positions from './pages/Positions';
import BotSettings from './pages/BotSettings';
import Upgrade from './pages/Upgrade';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signals" element={<SignalFeed />} />
        <Route path="/positions" element={<Positions />} />
        <Route path="/settings" element={<BotSettings />} />
        <Route path="/upgrade" element={<Upgrade />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
