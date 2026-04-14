import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Login from './pages/Login';
import MoviePage from './pages/MoviePage';
import TVShowPage from './pages/TVShowPage';
import Explore from './pages/Explore';
import Favorites from './pages/Favorites';
import RecentPage from './pages/RecentPage';
import SettingsPage from './pages/Settings';
import ReelPage from './pages/ReelPage';
import WatchPartyRoom from './pages/WatchPartyRoom';
import BackendStatus from './components/BackendStatus';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminWatchParties from './pages/admin/AdminWatchParties';
import AdminFavorites from './pages/admin/AdminFavorites';
import AdminWatchHistory from './pages/admin/AdminWatchHistory';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/login" element={<Login />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/recent" element={<RecentPage />} />
      <Route path="/settings" element={<SettingsPage/>}/>
      <Route path="/movie/:id" element={<MoviePage />} />
      <Route path="/tv/:id" element={<TVShowPage />} />
      <Route path="/reel" element={<ReelPage />} />
      <Route path="/watch/:roomId" element={<WatchPartyRoom />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="watch-parties" element={<AdminWatchParties />} />
        <Route path="favorites" element={<AdminFavorites />} />
        <Route path="watch-history" element={<AdminWatchHistory />} />
      </Route>
    </Routes>
    <BackendStatus />
  </Router>
);

export default App;