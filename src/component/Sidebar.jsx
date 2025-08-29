import React from 'react';
import { useAccount } from 'wagmi';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Layout.css';

const Sidebar = () => {
  const { address, isConnected } = useAccount();
  const location = useLocation();

  const navItems = [
    { path: '/', label: '홈' },
    { path: '/simpledex', label: 'SimpleDEX' },
    { path: '/nftmarket', label: 'NFTmarket' },
  ];

  return (
    <div className="sidebar animate-slide-in-left">
      <div className="sidebar-header">
        <h1 className="animate-fade-in-scale animate-delay-200">🚀 Web3 블로그</h1>
      </div>
      
      <nav>
        <ul className="nav-menu stagger-children">
          {navItems.map((item, index) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={`hover-lift ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="user-info animate-fade-in-up animate-delay-500">
        <h4>지갑 상태</h4>
        {isConnected ? (
          <>
            <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--success-color)', fontWeight: '600' }}>
              <span className="animate-pulse">✅</span> 연결됨
            </div>
            <div className="user-address hover-scale">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--warning-color)', fontSize: '0.9rem', fontWeight: '600' }}>
            <span className="animate-pulse">⚠️</span> 지갑이 연결되지 않았습니다
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 