import React, { useEffect, useState } from 'react';
import { useAccount} from 'wagmi';
import { ethers } from 'ethers';
import { io, Socket } from 'socket.io-client';
import simpleNFTAbi from '../abis/SimpleNFT.json';
import NFTmintAbi from '../abis/NFTmint.json';
import '../styles/SimpleNFTmarket.css';

const NFTMARKET_ADDRESS = '0x20afD28B62c68ea9F7068A7CEB70B4fFbE59820a';
const NFT_MINT_ADDRESS = '0x890Bd72170b6Dad51Cdb0129dff13Ce381B9B015';

const SimpleNFTmarket: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [marketContract, setMarketContract] = useState<any>(null);
  const [nftContract, setNftContract] = useState<any>(null);

  const [tokenId, setTokenId] = useState<number>(0);
  const [startPrice, setStartPrice] = useState<number>(0);
  const [buyNowPrice, setBuyNowPrice] = useState<number>(0);
  const [acctionDuration, setAcctionDuration] = useState<number>(0);
  const [tokenURI, setTokenURI] = useState<string>('');

  const [platformFee, setPlatformFee] = useState<number>(0);

  const [bidPrice, setBidPrice] = useState<number>(0);
  const [itemId, setItemId] = useState<number>(0);
  const [currentOwner, setCurrentOwner] = useState<string>('');

  const [activeItems, setActiveItems] = useState<any[]>([]);

  const [itemDetails, setItemDetails] = useState<any>(null);
  
  const [socket, setSocket] = useState<Socket | null>(null);


  useEffect(() => {
    if (window.ethereum && isConnected) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      web3Provider.getSigner().then((signer: any) => {
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
    try {
    const tx = await marketContract.listItem(NFT_MINT_ADDRESS, tokenId, startPrice, buyNowPrice, acctionDuration, tokenURI);
    await tx.wait();

    const tx2 = await nftContract.approve(NFTMARKET_ADDRESS, tokenId);
    await tx2.wait();

    alert('NFT 등록 완료');
  } catch (error) {
    console.error(error);
    alert('NFT 등록 실패');
  }
  }

  const PlatformFee = async () => { // 플랫폼 수수료 설정
    try {
      const tx = await marketContract.setPlatformFeePercent(platformFee);
      await tx.wait();
      alert('플랫폼 수수료 설정 완료');
    } catch (error) {
      console.error(error);
      alert('플랫폼 수수료 설정 실패');
    }
  }

  const placeBid = async () => { // 입찰
    try {
      const tx = await marketContract.placeBid(itemId, {value: bidPrice});
      await tx.wait();
      alert('입찰 완료');
    } catch (error) {
      console.error(error);
      alert('입찰 실패');
    }
  }

  // 입찰 이벤트 리스닝
  useEffect(() => {
    if (socket) {
      socket.on('BidPlaced', (itemId: number, address: string, bidPrice: number) => {
        console.log(`새로운 입찰 발생: Item ID ${itemId}, 주소 ${address}, 입찰가 ${bidPrice} ETH`);
        alert(`새로운 입찰이 발생했습니다!\nItem ID: ${itemId}\n입찰자: ${address}\n입찰가: ${bidPrice} ETH`);
      });

      return () => {
        socket.off('BidPlaced');
      };
    }
  }, [socket]);

  const getCurrentOwner = async () => { // 현재 소유자 조회
    try {
      const owner = await nftContract.ownerOf(itemId);
      setCurrentOwner(owner);
      alert(`Token ID ${itemId}의 현재 소유자: ${owner}`);
    } catch (error) {
      console.error(error);
      alert('소유자 조회 실패');
    }
  }

  const buyNow = async () => { // 즉시 구매
    try {
      const tx = await marketContract.buyNow(itemId);
      await tx.wait();

      if (currentOwner) {
        const tx2 = await nftContract.transferFrom(currentOwner, address, itemId);
        await tx2.wait();
      }
      alert('즉시 구매 완료');
    } catch (error) {
      console.error(error);
      alert('즉시 구매 실패');
    }
  }

  const fetchActiveItems = async () => { // 현재 판매중인 NFT 조회
    try {
      const items = await marketContract.fetchActiveItems();
      console.log('현재 판매중인 NFT:', items);
      setActiveItems(items);
      alert(`현재 판매중인 NFT ${items.length}개를 조회했습니다.`);
    } catch (error) {
      console.error(error);
      alert('현재 판매중인 NFT 조회 실패');
    }
  }

  const getItemDetails = async () => { // 특정 NFT 상세 조회
    try {
      const item = await marketContract.getItemDetails(itemId);
      console.log('NFT 상세:', item);
      setItemDetails(item);
      alert(`Item ID ${itemId}의 상세 정보를 조회했습니다.`);
    } catch (error) {
      console.error(error);
      alert('NFT 상세 조회 실패');
    }
  }

  const withDrawFees = async () => { // 누적된 수수료 인출
    try {
      const tx = await marketContract.withdrawFees();
      await tx.wait();
      alert('수수료 인출 완료');
    } catch (error) {
      console.error(error);
      alert('수수료 인출 실패');
    }
  }

  return (
  <div className="nftmarket-container">
    <div className="nftmarket-header">
      <h1>Simple NFT Market</h1>
    </div>
    <div className="nft-mint-section">
      <h2>NFT 등록</h2>
      <input type="text" placeholder="Token ID" value={tokenId} onChange={(e) => setTokenId(Number(e.target.value))} />
      <input type="text" placeholder="Start Price" value={startPrice} onChange={(e) => setStartPrice(Number(e.target.value))} />
      <input type="text" placeholder="Buy Now Price" value={buyNowPrice} onChange={(e) => setBuyNowPrice(Number(e.target.value))} />
      <input type="text" placeholder="Acction Duration" value={acctionDuration} onChange={(e) => setAcctionDuration(Number(e.target.value))} />
      <input type="text" placeholder="Token URI" value={tokenURI} onChange={(e) => setTokenURI(e.target.value)} />
      <button onClick={CreateNFT}>NFT 등록</button>
    </div>
    <div className="nft-trade-section">
      <h2>플랫폼 수수료 설정</h2>
      <input type="text" placeholder="Platform Fee" value={platformFee} onChange={(e) => setPlatformFee(Number(e.target.value))} />
      <button onClick={PlatformFee}>플랫폼 수수료 설정</button>
    </div>
    <div className="nft-auction-section">
      <h2>입찰</h2>
      <input type="text" placeholder="item ID" value={itemId} onChange={(e) => setItemId(Number(e.target.value))} />
      <input type="text" placeholder="Bid Price" value={bidPrice} onChange={(e) => setBidPrice(Number(e.target.value))} />
      <button onClick={placeBid}>입찰</button>
    </div>
    <div className="nft-trade-section">
      <h2>즉시 구매</h2>
      <input type="text" placeholder="item ID" value={itemId} onChange={(e) => setItemId(Number(e.target.value))} />
      <button onClick={getCurrentOwner}>현재 소유자 조회</button>
      <button onClick={buyNow}>즉시 구매</button>
      {currentOwner && <p className="owner-info">현재 소유자: {currentOwner}</p>}
    </div>
    <div className="nft-list-section">
      <h2>NFT 상세 정보 조회</h2>
      <input type="text" placeholder="item ID" value={itemId} onChange={(e) => setItemId(Number(e.target.value))} />
      <button onClick={getItemDetails}>상세 정보 조회</button>
      {itemDetails && (
        <div className="detail-info">
          <h3>Item ID {itemId} 상세 정보</h3>
          <ul>
            <li><strong>Item ID:</strong> {itemDetails.itemId?.toString() || 'N/A'}</li>
            <li><strong>Token ID:</strong> {itemDetails.tokenId?.toString() || 'N/A'}</li>
            <li><strong>NFT Contract:</strong> {itemDetails.nftContract || 'N/A'}</li>
            <li><strong>Seller:</strong> {itemDetails.seller || 'N/A'}</li>
            <li><strong>Start Price:</strong> {itemDetails.startPrice?.toString() || 'N/A'} ETH</li>
            <li><strong>Buy Now Price:</strong> {itemDetails.buyNowPrice?.toString() || 'N/A'} ETH</li>
            <li><strong>Auction Duration:</strong> {itemDetails.auctionDuration?.toString() || 'N/A'} seconds</li>
            <li><strong>Token URI:</strong> {itemDetails.tokenURI || 'N/A'}</li>
            <li><strong>Is Active:</strong> {itemDetails.isActive ? 'Yes' : 'No'}</li>
            <li><strong>Current Bid:</strong> {itemDetails.currentBid?.toString() || 'N/A'} ETH</li>
            <li><strong>Current Bidder:</strong> {itemDetails.currentBidder || 'N/A'}</li>
            <li><strong>End Time:</strong> {itemDetails.endTime ? new Date(Number(itemDetails.endTime) * 1000).toLocaleString() : 'N/A'}</li>
          </ul>
        </div>
      )}
    </div>
    <div className="nft-list-section">
      <h2>현재 판매중인 NFT</h2>
      <button onClick={fetchActiveItems}>판매중인 NFT 조회</button>
      {activeItems.length > 0 && (
        <div>
          <h3>판매중인 NFT 목록 ({activeItems.length}개)</h3>
          <ul>
            {activeItems.map((item, index) => (
              <li key={index}>
                <strong>Item ID:</strong> {item.itemId?.toString() || 'N/A'} | 
                <strong>Token ID:</strong> {item.tokenId?.toString() || 'N/A'} | 
                <strong>NFT Contract:</strong> {item.nftContract || 'N/A'} | 
                <strong>Seller:</strong> {item.seller || 'N/A'} | 
                <strong>Start Price:</strong> {item.startPrice?.toString() || 'N/A'} ETH | 
                <strong>Buy Now Price:</strong> {item.buyNowPrice?.toString() || 'N/A'} ETH
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
    <div className="nft-trade-section">
      <h2>누적된 수수료 인출</h2>
      <button onClick={withDrawFees}>수수료 인출</button>
    </div>
  </div>
  );
};

export default SimpleNFTmarket;
