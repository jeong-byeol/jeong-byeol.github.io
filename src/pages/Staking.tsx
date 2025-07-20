import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, formatUnits } from 'viem';
import StakingABI from '../abis/Staking.json';
import TokenABI from '../abis/Token.json';
import '../styles/Staking.css';

// 타입 정의
interface StakingInfo {
  amount: string;
  timestamp: string;
  rewards: string;
}

interface StakingEvent {
  user: string;
  amount: string;
  timestamp: string;
  blockNumber: number;
}

const Staking: React.FC = () => {
  const { address, isConnected } = useAccount();
  
  // 상태 관리
  const [stakingAmount, setStakingAmount] = useState<string>('');
  const [unstakingAmount, setUnstakingAmount] = useState<string>('');
  const [userStakingInfo, setUserStakingInfo] = useState<StakingInfo | null>(null);
  const [pendingRewards, setPendingRewards] = useState<string>('0');
  const [rewardRate, setRewardRate] = useState<string>('0');
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 스테이킹 컨트랙트 주소
  const STAKING_CONTRACT_ADDRESS = '0x9AA32b9B24e220A48E3CEd7FECF1e5BaCC41DE42'; 
  const TOKEN_CONTRACT_ADDRESS = '0x3e041CeAe50be00a68Fd34BA81C30A65D5b95f26';

  // wagmi 컨트랙트 읽기 함수들
  const { data: userStake, refetch: refetchUserStake } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: StakingABI,
    functionName: 'stakes',
    args: [address],
    query: { enabled: !!address && !!STAKING_CONTRACT_ADDRESS },
  });

  const { data: pendingRewardsData, refetch: refetchPendingRewards } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: StakingABI,
    functionName: 'getPendingRewards',
    args: [address],
    query: { enabled: !!address && !!STAKING_CONTRACT_ADDRESS },
  });

  const { data: rewardRateData } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: StakingABI,
    functionName: 'rewardRatePerSecond',
    query: { enabled: !!STAKING_CONTRACT_ADDRESS },
  });

  const { data: tokenBalanceData } = useReadContract({
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    abi: TokenABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address && !!TOKEN_CONTRACT_ADDRESS },
  });

  // wagmi 컨트랙트 쓰기 함수들
  const { writeContract: stake, data: stakeData, isPending: isStaking } = useWriteContract();
  const { writeContract: unstake, data: unstakeData, isPending: isUnstaking } = useWriteContract();
  const { writeContract: claimRewards, data: claimData, isPending: isClaiming } = useWriteContract();

  // 트랜잭션 대기
  const { isLoading: isStakeLoading, isSuccess: isStakeSuccess } = useWaitForTransactionReceipt({
    hash: stakeData,
  });

  const { isLoading: isUnstakeLoading, isSuccess: isUnstakeSuccess } = useWaitForTransactionReceipt({
    hash: unstakeData,
  });

  const { isLoading: isClaimLoading, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimData,
  });

  // 데이터 포맷팅
  const formatStakeData = (stakeData: any) => {
    if (!stakeData) return { amount: '0', timestamp: '0', rewards: '0' };
    return {
      amount: formatEther(stakeData.amount || 0n),
      timestamp: new Date(Number(stakeData.timestamp || 0) * 1000).toLocaleString(),
      rewards: formatEther(stakeData.rewards || 0n)
    };
  };

  // 데이터 업데이트
  useEffect(() => {
    if (userStake) {
      setUserStakingInfo(formatStakeData(userStake));
    }
  }, [userStake]);

  useEffect(() => {
    if (pendingRewardsData !== undefined) {
      setPendingRewards(formatEther(pendingRewardsData));
    }
  }, [pendingRewardsData]);

  useEffect(() => {
    if (rewardRateData !== undefined) {
      setRewardRate(formatUnits(rewardRateData, 18));
    }
  }, [rewardRateData]);

  useEffect(() => {
    if (tokenBalanceData !== undefined) {
      setTokenBalance(formatEther(tokenBalanceData));
    }
  }, [tokenBalanceData]);

  // 성공 메시지 표시 및 데이터 새로고침
  useEffect(() => {
    if (isStakeSuccess) {
      setMessage({ type: 'success', text: '스테이킹이 성공적으로 완료되었습니다!' });
      setStakingAmount('');
      refetchUserStake();
      refetchPendingRewards();
    }
  }, [isStakeSuccess, refetchUserStake, refetchPendingRewards]);

  useEffect(() => {
    if (isUnstakeSuccess) {
      setMessage({ type: 'success', text: '언스테이킹이 성공적으로 완료되었습니다!' });
      setUnstakingAmount('');
      refetchUserStake();
      refetchPendingRewards();
    }
  }, [isUnstakeSuccess, refetchUserStake, refetchPendingRewards]);

  useEffect(() => {
    if (isClaimSuccess) {
      setMessage({ type: 'success', text: '보상이 성공적으로 수령되었습니다!' });
      refetchUserStake();
      refetchPendingRewards();
    }
  }, [isClaimSuccess, refetchUserStake, refetchPendingRewards]);

  // 스테이킹 (Permit 방식)
  const handleStakeWithPermit = async () => {
    if (!stakingAmount || parseFloat(stakingAmount) <= 0) {
      setMessage({ type: 'error', text: '올바른 금액을 입력해주세요.' });
      return;
    }

    if (parseFloat(stakingAmount) > parseFloat(tokenBalance)) {
      setMessage({ type: 'error', text: '보유한 토큰보다 많은 금액을 스테이킹할 수 없습니다.' });
      return;
    }

    try {
      const amount = parseEther(stakingAmount);
      const deadline = Math.floor(Date.now() / 1000) + 3600; // permit 서명 만료 시간
      
      // 임시로 permit 서명 없이 스테이킹 (실제로는 permit 서명이 필요)
      stake({
        address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
        abi: StakingABI,
        functionName: 'stakeWithPermit',
        args: [amount, deadline, 0, '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000000000000000000000']
      });
    } catch (error) {
      setMessage({ type: 'error', text: '스테이킹 중 오류가 발생했습니다.' });
      console.error(error);
    }
  };

  // 스테이킹 해제
  const handleUnstake = async () => {
    if (!unstakingAmount || parseFloat(unstakingAmount) <= 0) {
      setMessage({ type: 'error', text: '올바른 금액을 입력해주세요.' });
      return;
    }

    const userStakeAmount = formatStakeData(userStake).amount;
    if (parseFloat(unstakingAmount) > parseFloat(userStakeAmount)) {
      setMessage({ type: 'error', text: '스테이킹된 금액보다 많은 금액을 언스테이킹할 수 없습니다.' });
      return;
    }

    try {
      const amount = parseEther(unstakingAmount);
      unstake({
        address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
        abi: StakingABI,
        functionName: 'unstake',
        args: [amount]
      });
    } catch (error) {
      setMessage({ type: 'error', text: '언스테이킹 중 오류가 발생했습니다.' });
      console.error(error);
    }
  };

  // 보상 청구
  const handleClaimRewards = async () => {
    if (!pendingRewardsData || pendingRewardsData === 0n) {
      setMessage({ type: 'error', text: '수령할 보상이 없습니다.' });
      return;
    }

    try {
      claimRewards({
        address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
        abi: StakingABI,
        functionName: 'claimRewards'
      });
    } catch (error) {
      setMessage({ type: 'error', text: '보상 수령 중 오류가 발생했습니다.' });
      console.error(error);
    }
  };

  // 데이터 새로고침
  const handleRefreshData = () => {
    refetchUserStake();
    refetchPendingRewards();
    setMessage({ type: 'success', text: '데이터가 새로고침되었습니다!' });
  };

  if (!isConnected) {
    return (
      <div className="staking-container">
        <div className="staking-card">
          <div className="connect-section">
            <h3>지갑 연결 필요</h3>
            <p>스테이킹 기능을 사용하려면 홈 페이지에서 지갑을 먼저 연결해주세요.</p>
            <p style={{ color: '#e74c3c', fontSize: '0.9rem' }}>
              홈 페이지로 이동하여 MetaMask를 연결한 후 다시 시도해주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="staking-container">
      <div className="page-header">
        <h2>스테이킹</h2>
      </div>

      {message && (
        <div className={`${message.type === 'success' ? 'success-message' : 'error-message'}`}>
          {message.text}
        </div>
      )}

      <div className="staking-content">
        <div className="staking-card">
          <div className="user-info">
            <h3>사용자 정보</h3>
            <p><strong>연결된 주소:</strong> {address}</p>
            <p><strong>토큰 잔액:</strong> {tokenBalance} TOKEN</p>
            <p><strong>초당 보상률:</strong> {rewardRate} TOKEN</p>
          </div>

          {userStakingInfo && (
            <div className="staking-info">
              <h3>내 스테이킹 정보</h3>
              <div className="staking-stats">
                <div className="stat-item">
                  <div className="stat-value">{userStakingInfo.amount}</div>
                  <div className="stat-label">스테이킹된 토큰</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{pendingRewards}</div>
                  <div className="stat-label">대기 중인 보상</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{userStakingInfo.timestamp}</div>
                  <div className="stat-label">스테이킹 시작일</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{userStakingInfo.rewards}</div>
                  <div className="stat-label">누적 보상</div>
                </div>
              </div>
            </div>
          )}

          <div className="staking-actions">
            <div className="staking-form">
              <h3>스테이킹</h3>
              <div className="form-group">
                <label htmlFor="stakeAmount">스테이킹할 금액</label>
                <input
                  type="number"
                  id="stakeAmount"
                  value={stakingAmount}
                  onChange={(e) => setStakingAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  min="0"
                  max={tokenBalance}
                  disabled={isStaking || isStakeLoading}
                />
                <small style={{ color: '#7f8c8d', fontSize: '0.8rem' }}>
                  보유: {tokenBalance} 토큰
                </small>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleStakeWithPermit}
                disabled={isStaking || isStakeLoading || !stakingAmount}
              >
                {isStaking || isStakeLoading ? '스테이킹 중...' : '스테이킹'}
              </button>
            </div>

            <div className="staking-form">
              <h3>언스테이킹</h3>
              <div className="form-group">
                <label htmlFor="unstakeAmount">언스테이킹할 금액</label>
                <input
                  type="number"
                  id="unstakeAmount"
                  value={unstakingAmount}
                  onChange={(e) => setUnstakingAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  min="0"
                  max={userStakingInfo?.amount || '0'}
                  disabled={isUnstaking || isUnstakeLoading}
                />
                <small style={{ color: '#7f8c8d', fontSize: '0.8rem' }}>
                  스테이킹된: {userStakingInfo?.amount || '0'} 토큰
                </small>
              </div>
              <button 
                className="btn btn-danger" 
                onClick={handleUnstake}
                disabled={isUnstaking || isUnstakeLoading || !unstakingAmount}
              >
                {isUnstaking || isUnstakeLoading ? '언스테이킹 중...' : '스테이킹 해제'}
              </button>
            </div>

            <div className="staking-form">
              <h3>보상 관리</h3>
              <button 
                className="btn btn-success" 
                onClick={handleClaimRewards}
                disabled={isClaiming || isClaimLoading || !pendingRewardsData || pendingRewardsData === 0n}
              >
                {isClaiming || isClaimLoading ? '보상 수령 중...' : `보상 청구 (${pendingRewards} TOKEN)`}
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleRefreshData}
                disabled={isStaking || isUnstaking || isClaiming}
              >
                데이터 새로고침
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staking;
