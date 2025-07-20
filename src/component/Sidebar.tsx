import React from 'react';
import { useAccount } from 'wagmi';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Layout.css';

const Sidebar: React.FC = () => {
  const { address, isConnected } = useAccount();
  const location = useLocation();

  const navItems = [
    { path: '/', label: '홈', icon: '🏠' },
    { path: '/staking', label: '스테이킹', icon: '💰' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>🚀 Web3 블로그</h1>
      </div>
      
      <nav>
        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span style={{ marginRight: '12px', fontSize: '1.1rem' }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="user-info">
        <h4>지갑 상태</h4>
        {isConnected ? (
          <>
            <div style={{ marginBottom: '8px', fontSize: '0.8rem', color: '#bdc3c7' }}>
              ✅ 연결됨
            </div>
            <div className="user-address">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          </>
        ) : (
          <div style={{ color: '#e74c3c', fontSize: '0.9rem' }}>
            ⚠️ 지갑이 연결되지 않았습니다
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 