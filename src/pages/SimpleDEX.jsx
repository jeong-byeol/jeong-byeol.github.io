import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import simpleDexAbi from '../abis/SimpleDEX.json';
import '../styles/SimpleDEX.css';
import '../styles/Layout.css';

const SIMPLEDEX_ADDRESS = '0x33d89348E9547662840A035d26930EE37c6741d0';
const KOW = "0x6b797dC9D340bf09A77Fb54075530c5fb6bdF699";
const SOW = "0x59dF7b4D7cf172Aa5be3b524D4ac2616d7097a78";

const SimpleDEX = () => {
  const { address, isConnected } = useAccount();

  const [dexContract, setDexContract] = useState(null);
  const [Contract, setContract] = useState(null);
  const [KOWaddress, setKOWaddress] = useState(null);
  const [SOWaddress, setSOWaddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [swapFrom, setSwapFrom] = useState('SOW');
  const [swapTo, setSwapTo] = useState('KOW');

  useEffect(() => {
    if (window.ethereum && isConnected) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      web3Provider.getSigner().then((signer) => {
        setDexContract(new ethers.Contract(SIMPLEDEX_ADDRESS, simpleDexAbi, signer));
        setContract(SIMPLEDEX_ADDRESS);
        setKOWaddress(KOW);
        setSOWaddress(SOW);
      });
    }
  }, [isConnected]);

  useEffect(() => {
    if (Contract && address) {
      const fetchBalance = async () => {
        const balance = await dexContract.getBalance(address, Contract);
        setBalance(balance);
      }
      fetchBalance();
    }
  });

  const addsupToken = async () => {
    setLoading(true);
    setTransactionStatus('토큰 추가 중...');
    try {
      const tx = await dexContract.addSupportedToken(KOWaddress);
      await tx.wait();
      const tx1 = await dexContract.addSupportedToken(SOWaddress);
      await tx1.wait();
      setTransactionStatus('토큰 추가 성공!');
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error('토큰 추가 실패:', error);
      setTransactionStatus('토큰 추가 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }

  const ExchangeRate = async () => {
    setLoading(true);
    setTransactionStatus('교환 비율 설정 중...');
    try {
      const tx = await dexContract.setExchangeRate(SOWaddress, KOWaddress, 100);
      await tx.wait();
      setTransactionStatus('교환 비율 설정 성공!');
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error('교환 비율 설정 실패:', error);
      setTransactionStatus('교환 비율 설정 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }

  const setFeeRate = async () => {
    if (!fee || isNaN(fee)) return;
    setLoading(true);
    setTransactionStatus('수수료 설정 중...');
    try {
      const tx = await dexContract.setFeeRate(fee);
      await tx.wait();
      setTransactionStatus('수수료 설정 성공!');
      setFee('');
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error('수수료 설정 실패:', error);
      setTransactionStatus('수수료 설정 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }

  const withdrawFee = async () => {
    setLoading(true);
    setTransactionStatus('수수료 출금 중...');
    try {
      const tx = await dexContract.withdrawFee(KOWaddress);
      await tx.wait();
      setTransactionStatus('수수료 출금 성공!');
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error('수수료 출금 실패:', error);
      setTransactionStatus('수수료 출금 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }

  const depositKOW = async () => {
    if (!amount || isNaN(amount)) return;
    setLoading(true);
    setTransactionStatus('KOW 예치 중...');
    try {
      const tx = await dexContract.deposit(KOWaddress, amount);
      await tx.wait();
      setTransactionStatus('KOW 예치 성공!');
      setAmount('');
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error('예치 실패:', error);
      setTransactionStatus('예치 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }

  const deposit = async () => {
    if (!amount || isNaN(amount)) return;
    setLoading(true);
    setTransactionStatus('SOW 입금 중...');
    try {
      const tx = await dexContract.deposit(SOWaddress, amount);
      await tx.wait();
      setTransactionStatus('SOW 입금 성공!');
      setAmount('');
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error('입금 실패:', error);
      setTransactionStatus('입금 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }

  const withdraw = async () => {
    if (!amount || isNaN(amount)) return;
    setLoading(true);
    setTransactionStatus('SOW 출금 중...');
    try {
      const tx = await dexContract.withdraw(SOWaddress, amount);
      await tx.wait();
      setTransactionStatus('SOW 출금 성공!');
      setAmount('');
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error('출금 실패:', error);
      setTransactionStatus('출금 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }

  const handleSwap = async () => {
    if (!amount || isNaN(amount)) return;
    setLoading(true);
    setTransactionStatus(`${swapFrom}에서 ${swapTo}로 교환 중...`);
    try {
      let tx;
      if (swapFrom === 'SOW' && swapTo === 'KOW') {
        tx = await dexContract.swap(SOWaddress, KOWaddress, amount);
      } else if (swapFrom === 'KOW' && swapTo === 'SOW') {
        tx = await dexContract.swap(KOWaddress, SOWaddress, amount);
      }
      await tx.wait();
      setTransactionStatus('교환 성공!');
      setAmount('');
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error('교환 실패:', error);
      setTransactionStatus('교환 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }
  
  const switchTokens = () => {
    const temp = swapFrom;
    setSwapFrom(swapTo);
    setSwapTo(temp);
  }

  if (!isConnected) {
    return (
      <div className="animate-fade-in">
        <div className="page-header animate-fade-in-scale">
          <h2>🔄 SimpleDEX</h2>
        </div>
        <div className="connection-required animate-fade-in-up animate-delay-200">
          <div className="connection-icon">🔗</div>
          <h3>지갑 연결이 필요합니다</h3>
          <p>SimpleDEX를 사용하려면 먼저 지갑을 연결해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header animate-fade-in-scale">
        <h2>🔄 SimpleDEX</h2>
      </div>
      
      {transactionStatus && (
        <div className={`transaction-status animate-fade-in-scale ${
          transactionStatus.includes('성공') ? 'success' : 
          transactionStatus.includes('실패') ? 'error' : 'pending'
        }`}>
          {loading && <div className="loading-spinner"></div>}
          <span>{transactionStatus}</span>
        </div>
      )}

      {/* 잔액 섹션 */}
      <div className="balance-card animate-fade-in-up animate-delay-200">
        <div className="balance-header">
          <h3>💰 내 잔액</h3>
          <button className="refresh-btn hover-scale" onClick={() => window.location.reload()}>
            🔄
          </button>
        </div>
        <div className="balance-amount">
          <span className="amount">{balance || '0'}</span>
          <span className="currency">SOW</span>
        </div>
        <div className="balance-usd">≈ $0.00 USD</div>
      </div>

      {/* 스왑 섹션 */}
      <div className="swap-card animate-fade-in-up animate-delay-300">
        <div className="swap-header">
          <h3>🔄 토큰 스왑</h3>
          <div className="exchange-rate">1 SOW = 1 KOW</div>
        </div>
        
        <div className="swap-container">
          <div className="swap-input-group">
            <div className="input-header">
              <span>보내는 토큰</span>
              <span className="token-balance">잔액: {balance || '0'}</span>
            </div>
            <div className="swap-input">
              <input 
                type="number" 
                placeholder="0.0" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="amount-input"
              />
              <div className="token-selector">
                <span className="token-symbol">{swapFrom}</span>
              </div>
            </div>
          </div>

          <div className="swap-switch">
            <button 
              className="switch-btn hover-rotate" 
              onClick={switchTokens}
              disabled={loading}
            >
              ⇅
            </button>
          </div>

          <div className="swap-input-group">
            <div className="input-header">
              <span>받는 토큰</span>
              <span className="token-balance">잔액: 0</span>
            </div>
            <div className="swap-input">
              <input 
                type="number" 
                placeholder="0.0" 
                value={amount} 
                readOnly
                className="amount-input"
              />
              <div className="token-selector">
                <span className="token-symbol">{swapTo}</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          className={`swap-button hover-lift ${!amount || loading ? 'disabled' : ''}`}
          onClick={handleSwap}
          disabled={!amount || loading}
        >
          {loading ? (
            <>
              <div className="loading-spinner"></div>
              스왑 중...
            </>
          ) : (
            `🔄 ${swapFrom}를 ${swapTo}로 스왑`
          )}
        </button>
      </div>

      {/* 유동성 섹션 */}
      <div className="liquidity-section animate-fade-in-up animate-delay-400">
        <div className="section-tabs">
          <button className="tab-btn active">💰 입출금</button>
        </div>
        
        <div className="liquidity-actions">
          <div className="action-group">
            <h4>💵 SOW 관리</h4>
            <div className="input-with-button">
              <input 
                type="number" 
                placeholder="금액 입력"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="action-input"
              />
              <button 
                className="action-btn primary hover-lift"
                onClick={deposit}
                disabled={!amount || loading}
              >
                {loading ? <div className="loading-spinner"></div> : '💰'} 입금
              </button>
              <button 
                className="action-btn secondary hover-lift"
                onClick={withdraw}
                disabled={!amount || loading}
              >
                {loading ? <div className="loading-spinner"></div> : '💸'} 출금
              </button>
            </div>
          </div>
          
          <div className="action-group">
            <h4>🪙 KOW 예치</h4>
            <div className="input-with-button">
              <input 
                type="number" 
                placeholder="예치할 금액"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="action-input"
              />
              <button 
                className="action-btn success hover-lift"
                onClick={depositKOW}
                disabled={!amount || loading}
              >
                {loading ? <div className="loading-spinner"></div> : '🪙'} KOW 예치
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 관리자 섹션 */}
      <div className="admin-card animate-fade-in-up animate-delay-500">
        <div className="admin-header">
          <h3>⚙️ 관리자 기능</h3>
          <span className="admin-badge">ADMIN</span>
        </div>
        
        <div className="admin-actions">
          <div className="admin-group">
            <h4>토큰 설정</h4>
            <div className="admin-buttons">
              <button 
                className="admin-btn hover-lift"
                onClick={addsupToken}
                disabled={loading}
              >
                {loading ? <div className="loading-spinner"></div> : '➕'} 토큰 추가
              </button>
              <button 
                className="admin-btn hover-lift"
                onClick={ExchangeRate}
                disabled={loading}
              >
                {loading ? <div className="loading-spinner"></div> : '📊'} 교환비율 설정
              </button>
            </div>
          </div>
          
          <div className="admin-group">
            <h4>수수료 관리</h4>
            <div className="fee-input-group">
              <input 
                type="number" 
                placeholder="수수료 (%)"
                value={fee} 
                onChange={(e) => setFee(e.target.value)}
                className="fee-input"
              />
              <button 
                className="admin-btn hover-lift"
                onClick={setFeeRate}
                disabled={!fee || loading}
              >
                {loading ? <div className="loading-spinner"></div> : '💰'} 수수료 설정
              </button>
              <button 
                className="admin-btn danger hover-lift"
                onClick={withdrawFee}
                disabled={loading}
              >
                {loading ? <div className="loading-spinner"></div> : '💸'} 수수료 출금
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDEX; 