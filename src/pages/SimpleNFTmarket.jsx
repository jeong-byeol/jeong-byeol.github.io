import React, { useEffect, useState } from 'react';
import { useAccount} from 'wagmi';
import { ethers } from 'ethers';
import { io } from 'socket.io-client';
import simpleNFTAbi from '../abis/SimpleNFT.json';
import NFTmintAbi from '../abis/NFTmint.json';
import '../styles/SimpleNFTmarket.css';
import '../styles/Layout.css';

const NFTMARKET_ADDRESS = '0x20afD28B62c68ea9F7068A7CEB70B4fFbE59820a';
const NFT_MINT_ADDRESS = '0x890Bd72170b6Dad51Cdb0129dff13Ce381B9B015';

const SimpleNFTmarket = () => {
  const { address, isConnected } = useAccount();
  const [marketContract, setMarketContract] = useState(null);
  const [nftContract, setNftContract] = useState(null);

  const [tokenId, setTokenId] = useState(0);
  const [startPrice, setStartPrice] = useState(0);
  const [buyNowPrice, setBuyNowPrice] = useState(0);
  const [acctionDuration, setAcctionDuration] = useState(0);
  const [tokenURI, setTokenURI] = useState('');

  const [platformFee, setPlatformFee] = useState(0);

  const [bidPrice, setBidPrice] = useState(0);
  const [itemId, setItemId] = useState(0);
  const [currentOwner, setCurrentOwner] = useState('');

  const [activeItems, setActiveItems] = useState([]);

  const [itemDetails, setItemDetails] = useState(null);
  
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // list, bid, buy, admin


  useEffect(() => {
    if (window.ethereum && isConnected) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      web3Provider.getSigner().then((signer) => {
        setMarketContract(new ethers.Contract(NFTMARKET_ADDRESS, simpleNFTAbi, signer));
        setNftContract(new ethers.Contract(NFT_MINT_ADDRESS, NFTmintAbi, signer));
      });
    }
  }, [isConnected]);

  // Socket 연결 설정
  useEffect(() => {
    const newSocket = io('http://localhost:5173'); 
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const CreateNFT = async () => { // NFT 등록
    if (!tokenId || !startPrice || !buyNowPrice || !acctionDuration || !tokenURI) {
      setTransactionStatus('모든 필드를 입력해주세요');
      setTimeout(() => setTransactionStatus(''), 3000);
      return;
    }
    
    setLoading(true);
    setTransactionStatus('NFT 등록 중...');
    try {
      const tx = await marketContract.listItem(NFT_MINT_ADDRESS, tokenId, startPrice, buyNowPrice, acctionDuration, tokenURI);
      await tx.wait();

      const tx2 = await nftContract.approve(NFTMARKET_ADDRESS, tokenId);
      await tx2.wait();

      setTransactionStatus('NFT 등록 완료!');
      // Reset form
      setTokenId(0);
      setStartPrice(0);
      setBuyNowPrice(0);
      setAcctionDuration(0);
      setTokenURI('');
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error(error);
      setTransactionStatus('NFT 등록 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }

  const PlatformFee = async () => { // 플랫폼 수수료 설정
    if (!platformFee || isNaN(platformFee)) return;
    
    setLoading(true);
    setTransactionStatus('플랫폼 수수료 설정 중...');
    try {
      const tx = await marketContract.setPlatformFeePercent(platformFee);
      await tx.wait();
      setTransactionStatus('플랫폼 수수료 설정 완료!');
      setPlatformFee(0);
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error(error);
      setTransactionStatus('플랫폼 수수료 설정 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }

  const placeBid = async () => { // 입찰
    if (!itemId || !bidPrice) return;
    
    setLoading(true);
    setTransactionStatus('입찰 중...');
    try {
      const tx = await marketContract.placeBid(itemId, {value: bidPrice});
      await tx.wait();
      setTransactionStatus('입찰 완료!');
      setBidPrice(0);
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error(error);
      setTransactionStatus('입찰 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }

  // 입찰 이벤트 리스닝
  useEffect(() => {
    if (socket) {
      socket.on('BidPlaced', (itemId, address, bidPrice) => {
        console.log(`새로운 입찰 발생: Item ID ${itemId}, 주소 ${address}, 입찰가 ${bidPrice} ETH`);
        alert(`새로운 입찰이 발생했습니다!\nItem ID: ${itemId}\n입찰자: ${address}\n입찰가: ${bidPrice} ETH`);
      });

      return () => {
        socket.off('BidPlaced');
      };
    }
  }, [socket]);

  const getCurrentOwner = async () => { // 현재 소유자 조회
    if (!itemId) return;
    
    setLoading(true);
    setTransactionStatus('소유자 조회 중...');
    try {
      const owner = await nftContract.ownerOf(itemId);
      setCurrentOwner(owner);
      setTransactionStatus('소유자 조회 완료!');
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error(error);
      setTransactionStatus('소유자 조회 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }

  const buyNow = async () => { // 즉시 구매
    if (!itemId) return;
    
    setLoading(true);
    setTransactionStatus('구매 중...');
    try {
      const tx = await marketContract.buyNow(itemId);
      await tx.wait();

      if (currentOwner) {
        const tx2 = await nftContract.transferFrom(currentOwner, address, itemId);
        await tx2.wait();
      }
      setTransactionStatus('구매 완료!');
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error(error);
      setTransactionStatus('구매 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }

  const fetchActiveItems = async () => { // 현재 판매중인 NFT 조회
    setLoading(true);
    setTransactionStatus('NFT 목록 조회 중...');
    try {
      const items = await marketContract.fetchActiveItems();
      console.log('현재 판매중인 NFT:', items);
      setActiveItems(items);
      setTransactionStatus(`${items.length}개의 NFT를 조회했습니다!`);
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error(error);
      setTransactionStatus('NFT 조회 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }

  const getItemDetails = async () => { // 특정 NFT 상세 조회
    if (!itemId) return;
    
    setLoading(true);
    setTransactionStatus('NFT 상세 정보 조회 중...');
    try {
      const item = await marketContract.getItemDetails(itemId);
      console.log('NFT 상세:', item);
      setItemDetails(item);
      setTransactionStatus('NFT 상세 정보 조회 완료!');
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error(error);
      setTransactionStatus('NFT 상세 조회 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }

  const withDrawFees = async () => { // 누적된 수수료 인출
    setLoading(true);
    setTransactionStatus('수수료 인출 중...');
    try {
      const tx = await marketContract.withdrawFees();
      await tx.wait();
      setTransactionStatus('수수료 인출 완료!');
      setTimeout(() => setTransactionStatus(''), 3000);
    } catch (error) {
      console.error(error);
      setTransactionStatus('수수료 인출 실패');
      setTimeout(() => setTransactionStatus(''), 3000);
    }
    setLoading(false);
  }

  if (!isConnected) {
    return (
      <div className="animate-fade-in">
        <div className="page-header animate-fade-in-scale">
          <h2>🇞🇦 NFT Marketplace</h2>
        </div>
        <div className="connection-required animate-fade-in-up animate-delay-200">
          <div className="connection-icon">🔗</div>
          <h3>지갑 연결이 필요합니다</h3>
          <p>NFT 마켓플레이스를 사용하려면 먼저 지갑을 연결해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header animate-fade-in-scale">
        <h2>🇞🇦 NFT Marketplace</h2>
      </div>
      
      {transactionStatus && (
        <div className={`transaction-status animate-fade-in-scale ${
          transactionStatus.includes('완료') || transactionStatus.includes('성공') ? 'success' : 
          transactionStatus.includes('실패') ? 'error' : 'pending'
        }`}>
          {loading && <div className="loading-spinner"></div>}
          <span>{transactionStatus}</span>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="nft-tabs animate-fade-in-up animate-delay-200">
        <button 
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          🎨 NFT 등록
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bid' ? 'active' : ''}`}
          onClick={() => setActiveTab('bid')}
        >
          💰 입찰
        </button>
        <button 
          className={`tab-btn ${activeTab === 'buy' ? 'active' : ''}`}
          onClick={() => setActiveTab('buy')}
        >
          🛒 구매
        </button>
        <button 
          className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          ⚙️ 관리
        </button>
      </div>

      {/* NFT 등록 섹션 */}
      {activeTab === 'list' && (
        <div className="nft-section animate-fade-in-scale">
          <div className="section-header">
            <h3>🎨 NFT 등록</h3>
            <span className="section-description">나만의 NFT를 마켓에 등록해보세요</span>
          </div>
          
          <div className="nft-form">
            <div className="form-grid">
              <div className="form-group">
                <label>토큰 ID</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={tokenId} 
                  onChange={(e) => setTokenId(Number(e.target.value))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>시작 가격 (ETH)</label>
                <input 
                  type="number" 
                  placeholder="0.0" 
                  step="0.01"
                  value={startPrice} 
                  onChange={(e) => setStartPrice(Number(e.target.value))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>즉시 구매 가격 (ETH)</label>
                <input 
                  type="number" 
                  placeholder="0.0" 
                  step="0.01"
                  value={buyNowPrice} 
                  onChange={(e) => setBuyNowPrice(Number(e.target.value))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>경매 기간 (초)</label>
                <input 
                  type="number" 
                  placeholder="3600" 
                  value={acctionDuration} 
                  onChange={(e) => setAcctionDuration(Number(e.target.value))}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group full-width">
              <label>Token URI</label>
              <input 
                type="url" 
                placeholder="https://ipfs.io/ipfs/..." 
                value={tokenURI} 
                onChange={(e) => setTokenURI(e.target.value)}
                className="form-input"
              />
            </div>
            
            <button 
              className={`primary-btn hover-lift ${loading ? 'loading' : ''}`}
              onClick={CreateNFT}
              disabled={loading || !tokenId || !startPrice || !buyNowPrice || !acctionDuration || !tokenURI}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  등록 중...
                </>
              ) : (
                <>🎨 NFT 등록하기</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 입찰 섹션 */}
      {activeTab === 'bid' && (
        <div className="nft-section animate-fade-in-scale">
          <div className="section-header">
            <h3>💰 입찰하기</h3>
            <span className="section-description">원하는 NFT에 입찰해보세요</span>
          </div>
          
          <div className="bid-form">
            <div className="form-row">
              <div className="form-group">
                <label>Item ID</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={itemId} 
                  onChange={(e) => setItemId(Number(e.target.value))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>입찰가 (ETH)</label>
                <input 
                  type="number" 
                  placeholder="0.0" 
                  step="0.01"
                  value={bidPrice} 
                  onChange={(e) => setBidPrice(Number(e.target.value))}
                  className="form-input"
                />
              </div>
            </div>
            
            <button 
              className={`primary-btn hover-lift ${loading ? 'loading' : ''}`}
              onClick={placeBid}
              disabled={loading || !itemId || !bidPrice}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  입찰 중...
                </>
              ) : (
                <>💰 입찰하기</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 구매 섹션 */}
      {activeTab === 'buy' && (
        <div className="nft-section animate-fade-in-scale">
          <div className="section-header">
            <h3>🛒 NFT 구매</h3>
            <span className="section-description">즉시 구매 및 소유자 확인</span>
          </div>
          
          <div className="buy-form">
            <div className="form-group">
              <label>Item ID</label>
              <input 
                type="number" 
                placeholder="0" 
                value={itemId} 
                onChange={(e) => setItemId(Number(e.target.value))}
                className="form-input"
              />
            </div>
            
            <div className="button-group">
              <button 
                className={`secondary-btn hover-lift ${loading ? 'loading' : ''}`}
                onClick={getCurrentOwner}
                disabled={loading || !itemId}
              >
                {loading ? <div className="loading-spinner"></div> : '👤'} 소유자 확인
              </button>
              
              <button 
                className={`primary-btn hover-lift ${loading ? 'loading' : ''}`}
                onClick={buyNow}
                disabled={loading || !itemId}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    구매 중...
                  </>
                ) : (
                  <>🛒 즉시 구매</>
                )}
              </button>
            </div>
            
            {currentOwner && (
              <div className="owner-info animate-fade-in">
                <div className="info-label">현재 소유자</div>
                <div className="owner-address">{currentOwner}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 관리 섹션 */}
      {activeTab === 'admin' && (
        <div className="nft-section animate-fade-in-scale">
          <div className="section-header">
            <h3>⚙️ 관리자 기능</h3>
            <span className="admin-badge">ADMIN</span>
          </div>
          
          <div className="admin-actions">
            <div className="admin-group">
              <h4>플랫폼 수수료 설정</h4>
              <div className="form-row">
                <input 
                  type="number" 
                  placeholder="수수료 (%)"
                  value={platformFee} 
                  onChange={(e) => setPlatformFee(Number(e.target.value))}
                  className="form-input"
                />
                <button 
                  className={`admin-btn hover-lift ${loading ? 'loading' : ''}`}
                  onClick={PlatformFee}
                  disabled={loading || !platformFee}
                >
                  {loading ? <div className="loading-spinner"></div> : '💰'} 수수료 설정
                </button>
              </div>
            </div>
            
            <div className="admin-group">
              <h4>수수료 관리</h4>
              <button 
                className={`admin-btn danger hover-lift ${loading ? 'loading' : ''}`}
                onClick={withDrawFees}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    인출 중...
                  </>
                ) : (
                  <>💸 수수료 인출</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NFT 목록 섹션 */}
      <div className="marketplace-section animate-fade-in-up animate-delay-400">
        <div className="section-header">
          <h3>🎨 마켓플레이스</h3>
          <button 
            className={`refresh-btn hover-scale ${loading ? 'loading' : ''}`}
            onClick={fetchActiveItems}
            disabled={loading}
          >
            {loading ? <div className="loading-spinner"></div> : '🔄'} 새로고침
          </button>
        </div>
        
        {activeItems.length > 0 ? (
          <div className="nft-grid stagger-children">
            {activeItems.map((item, index) => (
              <div key={index} className="nft-card hover-lift">
                <div className="nft-card-header">
                  <div className="nft-id">#{item.tokenId?.toString() || 'N/A'}</div>
                  <div className="nft-status active">🟢 판매중</div>
                </div>
                
                <div className="nft-placeholder">
                  🇞🇦 NFT
                </div>
                
                <div className="nft-info">
                  <div className="nft-title">Item ID: {item.itemId?.toString() || 'N/A'}</div>
                  <div className="nft-seller">
                    👤 {item.seller?.slice(0, 6)}...{item.seller?.slice(-4) || 'N/A'}
                  </div>
                </div>
                
                <div className="price-info">
                  <div className="price-row">
                    <span>시작가</span>
                    <span className="price">{item.startPrice?.toString() || 'N/A'} ETH</span>
                  </div>
                  <div className="price-row">
                    <span>즉시구매</span>
                    <span className="price highlight">{item.buyNowPrice?.toString() || 'N/A'} ETH</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎆</div>
            <h4>아직 판매중인 NFT가 없어요</h4>
            <p>첫 번째 NFT를 등록해보세요!</p>
          </div>
        )}
      </div>

      {/* NFT 상세 정보 */}
      <div className="detail-section animate-fade-in-up animate-delay-500">
        <div className="section-header">
          <h3>🔍 NFT 상세 정보</h3>
        </div>
        
        <div className="detail-form">
          <div className="form-row">
            <input 
              type="number" 
              placeholder="Item ID 입력" 
              value={itemId} 
              onChange={(e) => setItemId(Number(e.target.value))}
              className="form-input"
            />
            <button 
              className={`secondary-btn hover-lift ${loading ? 'loading' : ''}`}
              onClick={getItemDetails}
              disabled={loading || !itemId}
            >
              {loading ? <div className="loading-spinner"></div> : '🔍'} 상세 조회
            </button>
          </div>
        </div>
        
        {itemDetails && (
          <div className="detail-card animate-fade-in">
            <div className="detail-header">
              <h4>Item ID {itemId} 상세 정보</h4>
              <div className={`status-badge ${itemDetails.isActive ? 'active' : 'inactive'}`}>
                {itemDetails.isActive ? '🟢 활성' : '🔴 비활성'}
              </div>
            </div>
            
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Token ID</span>
                <span className="detail-value">{itemDetails.tokenId?.toString() || 'N/A'}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Contract</span>
                <span className="detail-value address">
                  {itemDetails.nftContract?.slice(0, 6)}...{itemDetails.nftContract?.slice(-4) || 'N/A'}
                </span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">판매자</span>
                <span className="detail-value address">
                  {itemDetails.seller?.slice(0, 6)}...{itemDetails.seller?.slice(-4) || 'N/A'}
                </span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">시작 가격</span>
                <span className="detail-value price">{itemDetails.startPrice?.toString() || 'N/A'} ETH</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">즉시구매가</span>
                <span className="detail-value price highlight">{itemDetails.buyNowPrice?.toString() || 'N/A'} ETH</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">현재 입찰가</span>
                <span className="detail-value price">{itemDetails.currentBid?.toString() || 'N/A'} ETH</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">입찰자</span>
                <span className="detail-value address">
                  {itemDetails.currentBidder && itemDetails.currentBidder !== '0x0000000000000000000000000000000000000000' 
                    ? `${itemDetails.currentBidder.slice(0, 6)}...${itemDetails.currentBidder.slice(-4)}` 
                    : '없음'
                  }
                </span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">마감 시간</span>
                <span className="detail-value">
                  {itemDetails.endTime ? new Date(Number(itemDetails.endTime) * 1000).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
            
            {itemDetails.tokenURI && (
              <div className="token-uri">
                <span className="detail-label">Token URI</span>
                <a href={itemDetails.tokenURI} target="_blank" rel="noopener noreferrer" className="uri-link">
                  {itemDetails.tokenURI.length > 50 ? `${itemDetails.tokenURI.slice(0, 50)}...` : itemDetails.tokenURI}
                  🔗
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleNFTmarket; 