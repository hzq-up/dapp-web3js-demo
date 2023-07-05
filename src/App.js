

import { useState } from 'react'
function App() {
  // 基于metamask实现查看账户信息的功能 
  const [account, setAccount] = useState("");
  const [, setIsConnected] = useState(false);

  // 返回连接状态
  // setIsConnected(window.ethereum && window.ethereum.isConnected());

  // 连接metamask钱包
  function connect() {
    window.ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(res => {
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

  // 获取 metamask 账号变化后的地址
  function getCurrentAccount(setAccount) {
    let currentAccount = null;
    window.ethereum.request({ method: 'eth_accounts' })
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
    window.ethereum.on('accountsChanged', handleAccountsChanged);

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

  getCurrentAccount(setAccount)



  return (
    <>
      <button onClick={connect}>获取账户信息</button>
      <div>地址：{account}</div>
      {/* <div>状态：{isConnected ? '已连接':'断开离线'}</div> */}
    </>
  )
}

export default App;
