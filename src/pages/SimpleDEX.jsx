import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import simpleDexAbi from '../abis/SimpleDEX.json';
import '../styles/SimpleDEX.css';

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
    try {
      const tx = await dexContract.addSupportedToken(KOWaddress);
      await tx.wait();
      const tx1 = await dexContract.addSupportedToken(SOWaddress);
      await tx1.wait();
      alert('토큰 추가 성공');
    } catch (error) {
      console.error('토큰 추가 실패:', error);
      alert('토큰 추가 실패');
    }
  }

  const ExchangeRate = async () => {
    try {
      const tx = await dexContract.setExchangeRate(SOWaddress, KOWaddress, 100);
      await tx.wait();
      alert('교환 비율 설정 성공');
    } catch (error) {
      console.error('교환 비율 설정 실패:', error);
      alert('교환 비율 설정 실패');
    }
  }

  const setFeeRate = async () => {
    try {
      const tx = await dexContract.setFeeRate(fee);
      await tx.wait();
      alert('수수료 설정 성공');
    } catch (error) {
      console.error('수수료 설정 실패:', error);
      alert('수수료 설정 실패');
    }
  }

  const withdrawFee = async () => {
    try {
      const tx = await dexContract.withdrawFee(KOWaddress);
      await tx.wait();
      alert('수수료 출금 성공');
    } catch (error) {
      console.error('수수료 출금 실패:', error);
      alert('수수료 출금 실패');
    }
  }

  const depositKOW = async () => {
    try {
      const tx = await dexContract.deposit(KOWaddress, amount);
      await tx.wait();
      alert('예치 성공');
    } catch (error) {
      console.error('예치 실패:', error);
      alert('예치 실패');
    }
  }

  const deposit = async () => {
    try {
      const tx = await dexContract.deposit(SOWaddress, amount);
      await tx.wait();
      alert('입금 성공');
    } catch (error) {
      console.error('입금 실패:', error);
      alert('입금 실패');
    }
  }

  const withdraw = async () => {
    try {
      const tx = await dexContract.withdraw(SOWaddress, amount);
      await tx.wait();
      alert('출금 성공');
    } catch (error) {
      console.error('출금 실패:', error);
      alert('출금 실패');
    }
  }

  const swap = async () => {
    try {
      const tx = await dexContract.swap(SOWaddress, KOWaddress, amount);
      await tx.wait();
      alert('교환 성공');
    } catch (error) {
      console.error('교환 실패:', error);
      alert('교환 실패');
    }
  }

  const swapKOW = async () => {
    try {
      const tx = await dexContract.swap(KOWaddress, SOWaddress, amount);
      await tx.wait();
      alert('교환 성공');
    } catch (error) {
      console.error('교환 실패:', error);
      alert('교환 실패');
    }
  }

  return (
    <div className="simpledex-container">
      <div className="simpledex-header">
        <h1>SimpleDEX</h1>
        <h2>현재 예치된 금액</h2>
        <p>금액: {balance} SOW</p>
      </div>
      <div className="action-section">
        <h2>SOW 입금</h2>
        <input type="text" placeholder="입금할 금액" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button onClick={deposit}>입금</button>
        <h2>SOW 출금</h2>
        <input type="text" placeholder="출금할 금액" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button onClick={withdraw}>출금</button>
      </div>
      <div className="swap-section">
        <h2>교환</h2>
        <input type="text" placeholder="교환할 금액" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button onClick={swap}>SOW 에서 KOW 로 교환</button>
        <button onClick={swapKOW}>KOW 에서 SOW 로 교환</button>
      </div>
      <div className="admin-section">
        <h2>관리자</h2>
        <button onClick={addsupToken}>토큰 추가</button>
        <button onClick={ExchangeRate}>교환 비율 설정</button>
        <input type="text" placeholder="수수료" value={fee} onChange={(e) => setFee(e.target.value)} />
        <button onClick={setFeeRate}>수수료 설정(진짜 설정 가능)</button>
        <button onClick={withdrawFee}>수수료 출금</button>
        <button onClick={depositKOW}>KOW 예치</button>
        <input type="text" placeholder="예치할 금액" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
    </div>
  );
};

export default SimpleDEX; 