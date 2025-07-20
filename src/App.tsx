import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './component/Sidebar';
import Home from './pages/Home';
import Staking from './pages/Staking';
import './App.css';

function App() {
  return (
    <Router>
      <div className="layout">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/staking" element={<Staking />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
