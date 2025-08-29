import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import '../styles/Layout.css';
import '../styles/Home.css';
import Comments from '../component/Comments';

const Home = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // 디버깅을 위한 로그
  console.log('Connectors:', connectors);
  console.log('First connector:', connectors[0]);

  return (
    <div className="animate-fade-in">
      <div className="page-header animate-fade-in-scale">
        <h2>홈 🏠</h2>
      </div>
      
      <div className="home-welcome-card animate-fade-in-up animate-delay-200">
        <h3 className="home-welcome-title">
          Web3 블로그에 오신 것을 환영합니다! 🚀
        </h3>
        
        <p className="home-welcome-text">
          블록체인 기술과 Web3 생태계에 대한 최신 정보를 확인하고, 
          다양한 DeFi 서비스를 경험해보세요.
        </p>
        
        {isConnected ? (
          <div className="wallet-connected animate-fade-in-scale animate-delay-300">
            <div className="wallet-connected-content">
              <div>
                <p className="wallet-connected-info">
                  <span className="animate-pulse">✅</span> 지갑이 연결되었습니다
                </p>
                <p className="wallet-address">
                  {address}
                </p>
              </div>
              <button 
                onClick={() => disconnect()}
                className="disconnect-button hover-lift"
              >
                연결 해제
              </button>
            </div>
          </div>
        ) : (
          <div className="wallet-not-connected animate-fade-in-scale animate-delay-300">
            <p className="wallet-not-connected-text">
              <span className="animate-pulse">⚠️</span> 지갑을 연결하여 모든 기능을 이용해보세요.
            </p>
              <div className="connect-buttons">
                {connectors.length > 0 ? (
                  connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      onClick={() => connect({ connector })}
                      disabled={isPending}
                      className="connect-button hover-lift"
                    >
                      {isPending ? (
                        <>
                          <div className="loading-spinner"></div>
                          연결 중...
                        </>
                      ) : (
                        `🔗 연결 ${connector.name}`
                      )}
                    </button>
                  ))
                ) : (
                  <p>사용 가능한 지갑이 없습니다.</p>
                )}
              </div>
          </div>
        )}
      </div>
      <div className="animate-fade-in-up animate-delay-500">
        <Comments />
      </div>
    </div>
  );
};

export default Home; 