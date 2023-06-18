import { FC, useState } from 'react';
import { UniPassProvider } from '@unipasswallet/ethereum-provider';
import { ethers, providers, utils } from 'ethers';

export const getProvider = () => {
  const upProvider = new UniPassProvider({
    chainId: 137,
    returnEmail: false,
    appSettings: {
      appName: 'test dapp',
      appIcon: 'https://vitejs.dev/logo.svgyour icon url',
    },
    rpcUrls: {
      polygon:
        'https://endpoints.omniatech.io/v1/matic/mainnet/2b36cd73075e43a98d1fd9dc2ad5ae4a',
      // mainnet: 'https://mainnet.infura.io/v3/e933b8519cd9460c9ba51b501425f33b',
      // polygonMumbai: 'https://endpoints.omniatech.io/v1/matic/mumbai/public',
      // goerli: 'https://endpoints.omniatech.io/v1/eth/goerli/public',
    },
  });

  return upProvider;
};

const getContract = () => {
  // const upProvider = getProvider();
  // 这里会报错： invalid signer or provider
  // const signer = upProvider?.getSigner();

  const signer = new ethers.providers.JsonRpcProvider(
    'https://endpoints.omniatech.io/v1/matic/mainnet/2b36cd73075e43a98d1fd9dc2ad5ae4a'
  );

  const erc201 = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function balanceOf(address account) view returns (uint256)',
    'function transfer(address recipient, uint256 amount) returns (bool)',
  ];

  // const usdtContract = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
  const usdcContract = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

  // @ts-ignore
  const contract = new ethers.Contract(usdcContract, erc201, signer);
  return contract;
};

export const UnipassDemo: FC = () => {
  const [account, setAccount] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [usdcBalance, setUsdcBalance] = useState('');

  const connectWallet = async () => {
    const upProvider = getProvider();
    const account = await upProvider.connect();
    console.log('account ', account);
    setAccount(account.address);
  };

  const onContractClick = async () => {
    const erc20Contract = getContract();

    const bal = await erc20Contract.balanceOf(account);

    // const usdcAmount = ethers.utils.formatEther(bal);
    const usdcAmount = ethers.utils.formatUnits(bal, 6);
    console.log('balance of native token = ', usdcAmount);

    setUsdcBalance(usdcAmount + ' USDC');
  };

  const onBanalceClick = async () => {
    const upProvider = getProvider();
    const provider = new providers.Web3Provider(upProvider, 'any');
    const signer = provider.getSigner();

    const account = await upProvider.connect();
    console.log('account', account);

    // get address
    const address = await signer.getAddress();
    console.log('wallet address', address);

    // get balance
    const balance = await signer.getBalance();
    const accountBalanceMatic = utils.formatEther(balance) + ' MATIC';
    console.log('balance', accountBalanceMatic);
    setAccountBalance(accountBalanceMatic);
  };

  const onSwitchChain = async () => {
    const upProvider = getProvider();
    const provider = new providers.Web3Provider(upProvider, 'any');
    const signer = provider.getSigner();

    await upProvider.connect();

    // switch chain
    await provider.send('wallet_switchEthereumChain', [{ chainId: 1 }]);
    const chainId = await signer.getChainId();
    console.log('chainId', chainId);
  };

  const onContractTransfer = () => {
    console.log('todo');
  };

  return (
    <div className='up'>
      <h2>hello unipass</h2>
      <div style={{ paddingBottom: 20 }}>以polygon为例</div>
      <div className='card'>
        连钱包
        <button onClick={connectWallet}>连钱包</button>
        <span>{account}</span>
      </div>

      <div className='card'>
        获取余额
        <button onClick={onBanalceClick}>获取余额</button>
        <span>{accountBalance}</span>
      </div>
      <div className='card'>
        调用合约
        <button onClick={onContractClick}>调用合约 balanceOf</button>
        <span>{usdcBalance}</span>
        <button onClick={onContractTransfer}>调用合约 transfer</button>
      </div>
      <div className='card'>
        切链
        <button onClick={onSwitchChain}>切链</button>
      </div>
    </div>
  );
};
