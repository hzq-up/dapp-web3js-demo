import { useEffect, useState } from 'react'
import web3 from 'web3'

function App() {
  // 基于metamask实现查看账户信息的功能 
  const [account, setAccount] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [blockNumber, setBlockNumber] = useState(0);
  const [balance, setBalance] = useState("");
  const [chainId, setChainId] = useState("");
  const [toAddress, setToAddress] = useState("0x92f153f119CD901e499761F19EEDE974B6F8ca7F");
  const [toAmount, setToAmount] = useState(0);

  const ethereum = window.ethereum;



  // 连接metamask钱包
  const connect = () => {
    ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(res => {
        console.log("点击连接")
        setAccount(res[0])
        setIsConnected(true);
      })
      .catch((err) => {
        setIsConnected(false);
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          alert('请接授权连接MetaMask钱包')
        } else if (err.code === -32002) {
          alert('请连接MetaMask钱包')
        } else {
          console.error(err);
        }
      })
  }

  const getBlockNumber = () => {
    ethereum.request({ method: 'eth_blockNumber' })
      .then(res => {
        setBlockNumber(res)
      })
      .catch(console.error);
  }

  // 查询账户余额
  const getBalance = () => {
    ethereum.request({ method: 'eth_getBalance', params: [account, blockNumber] })
      .then(res => {
        console.log('getBalance', res)
        setBalance(web3.utils.fromWei(res, 'ether'))
      })
      .catch(console.error);
  }

  // 根据链ID获取币种名字
  function getCoinNameByChainId(chainId) {
    switch (chainId) {
      case 1:
        return 'ETH';
      case 5:
        return 'ETH（测试网络）';
      case 56:
        return 'BNB';
      default:
        return '未知币种';
    }
  }

  // 获取 metamask 账号变化后的地址
  const getCurrentAccount = (setAccount) => {
    let currentAccount = null;
    ethereum.request({ method: 'eth_accounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        // Some unexpected error.
        // For backwards compatibility reasons, if no accounts are available,
        // eth_accounts returns an empty array.
        console.error(err);
      });

    // Note that this event is emitted on page load.
    // If the array of accounts is non-empty, you're already
    // connected.
    ethereum.on('accountsChanged', handleAccountsChanged);

    // eth_accounts always returns an array.
    function handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts.
        console.log('Please connect to MetaMask.');
      } else if (accounts[0] !== currentAccount) {
        // Reload your interface with accounts[0].
        currentAccount = accounts[0];
        setAccount(currentAccount)
        // return new Promise((resolve, reject) => {
        //   resolve(currentAccount);
        // })
      }
    }
  }

  // 获取 chainId
  const getChainId = () => {
    ethereum.request({
      method: "eth_chainId",
    })
      .then(res => {
        console.log('getChainId', res);
        setChainId(res)
      })
  }

  useEffect(() => {
    getCurrentAccount(setAccount);
    getBlockNumber();
    getChainId();
    // 设置连接状态
    setIsConnected(ethereum && ethereum.isConnected());
  }, [])

  useEffect(() => {
    if (account) {
      getBalance()
    }
  }, [account, isConnected, blockNumber])


  // 转账
  const transformTo = (e) => {
    if (toAmount <= 0) {
      alert('请输入转账金额')
      return;
    }
    ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: account, // The user's active address.
          to: toAddress, // Required except during contract publications.
          value: web3.utils.numberToHex(web3.utils.toWei(toAmount, 'ether')), // 16 进制的wei. Number of wei to send. 1
        },
      ],
    })
      .then((txHash) => console.log(txHash))
      .catch((error) => console.error(error));
  }



  return (
    <>
      <button onClick={connect}>获取账户信息</button>
      <div>地址：{account}</div>
      <div>余额：{Number(balance).toFixed(4)}&nbsp;{chainId && getCoinNameByChainId(web3.utils.hexToNumber(chainId))}</div>
      <div>当前区块高度: {blockNumber && web3.utils.hexToNumber(blockNumber)}</div>
      <div>状态：{isConnected ? <span style={{ color: 'green' }}>已连接</span> : '断开离线'}</div>
      <br />
      ===================================================================
      <br />
      to：<input style={{ width: '360px' }} type="text" defaultValue={toAddress} onChange={e => setToAddress(e.target.value)}></input>
      <br />
      金额： <input style={{ width: '130px' }} type="number" min={0.00001} placeholder='请输入转账金额' onChange={e => setToAmount(e.target.value)}></input>{getCoinNameByChainId(web3.utils.hexToNumber(chainId))}
      <br />
      <button onClick={transformTo}>转账</button>
    </>
  )
}

export default App;
