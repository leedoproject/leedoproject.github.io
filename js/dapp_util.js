function dappConnectWallet(_ethereum) {
  let _myAddress;
  if (typeof _ethereum === "undefined") {
    return showMsg(noAddrMsg);
  }

  _ethereum
    .request({ method: "eth_requestAccounts" })
    .then((accounts) => {
      _myAddress = accounts[0];
    })
    .catch((err) => {
      //   isMintingAvailable(false);
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log("Please connect to Your wallet!");
      } else {
        console.error(err);
      }
    });

  return _myAddress;
}

async function dappGetCurChainId(_web3) {
  let _curChainId;
  _curChainId = await _web3.eth.getChainId();
  // console.log("dappGetCurChainId =>", _curChainId);
  return _curChainId;
}

async function dappGetAccount(_web3) {
  let _account;
  _account = await _web3.eth.getAccounts();
  return _account;
}

async function AddTokenToWallet(_ethereum, _chainId, _token_address, _symbol, _decimal, _imgUrl) {
  let token_address = _token_address;
  await _ethereum
    .request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: token_address,
          symbol: _symbol,
          decimals: _decimal,
          image: _imgUrl,
        },
      },
    })
    .then((success) => {
      if (success) {
        console.log(_symbol + " successfully added to wallet!");
      } else {
        throw new Error("Something went wrong.");
      }
    })
    .catch(console.error);
}

/* Switch Network */
async function switchNetwork(_ethereum, targetNetwork, _chainName, _tokenName, _symbol, _decimal, _rpcUrls, _blockExplorerUrls) {
  // console.log("switchNetwork =>", targetNetwork);
  let myAccount = await dappGetAccount(web3);

  if (myAccount.length > 0) {
    let network_rpc = "https://eth-mainnet.alchemyapi.io/v2";
    switch (targetNetwork) {
      case 1:
        network_rpc = "https://eth-mainnet.alchemyapi.io/v2";
        break;
      case 137:
        network_rpc = "https://polygon-mainnet.g.alchemy.com/v2";
        break;
      case 80001:
        network_rpc = "https://matic-mumbai.chainstacklabs.com/";
        break;
    }
    try {
      await _ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + targetNetwork.toString(16) }],
      });
    } catch (switchError) {
      // console.log("switchError =>", switchError);
      // console.log("network_rpc => ", network_rpc);
      if (switchError.code === 4902) {
        const params = {
          chainId: "0x" + targetNetwork.toString(16), // A 0x-prefixed hexadecimal string
          chainName: _chainName, //"Matic Polygon Mainnet",
          nativeCurrency: {
            name: _tokenName, //"Matic Token",
            symbol: _symbol, //"MATIC", // 2-6 characters long
            decimals: _decimal, //18,
          },
          rpcUrls: [_rpcUrls], // ["https://polygon-rpc.com/"],
          blockExplorerUrls: [_blockExplorerUrls], //["https://polygonscan.com"],
        };

        try {
          await _ethereum.request({
            method: "wallet_addEthereumChain",
            params: [params, myAccount[0]],
          });
        } catch (addError) {
          console.log("Netword add failed... =>", addError);
          // Netword add failed...
        }
      }
    }
  }
}

// getLastestBlockNumber
async function getLatestBlockNumber(_web3) {
  let latestBlockNum = await _web3.eth.getBlockNumber();
  return latestBlockNum;
  // console.log("latestBlockNum => ", latestBlockNum);
  // console.log("latestBlockNum + 200000 => ", latestBlockNum + 200000);
}
