import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './component/Sidebar';
import Home from './pages/Home';
import SimpleDEX from './pages/SimpleDEX';
import SimpleNFTmarket from './pages/SimpleNFTmarket';
import './App.css';
import './styles/Animations.css';
import './styles/Mobile.css';

function App() {
  return (
    <Router>
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/simpledex" element={<SimpleDEX />} />
            <Route path="/nftmarket" element={<SimpleNFTmarket />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 