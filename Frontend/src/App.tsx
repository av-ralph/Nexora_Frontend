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
    </Routes>
    <BackendStatus />
  </Router>
);

export default App;