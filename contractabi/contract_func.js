let nftContract;

let leedoerc20Contract;

let leedovaultContract;

let utilityContract;

let leedorianContract;
let leedorianErc20Contract;

const nftAbi = {
  1: leedo_nft_contract, // Mainnet
  4: leedo_nft_contract, // Rinkeyb testnet
};
const erc20Abi = {
  1: leedo_erc20_contract, // Mainnet
  4: leedo_erc20_contract, // Rinkeyb testnet
};
const vaultAbi = {
  1: leedo_valut_contract, // Mainnet
  4: leedo_valut_contract, // Rinkeyb testnet
};

const utilAbi = {
  1: leedo_util_contract, // Mainnet
  4: leedo_util_contract, // Rinkeyb testnet
};

const leedorianAbi = {
  137: leedorian_contract, // Polygon Mainnet
  80001: leedorian_contract, // Mumbai testnet
};

const leedorianErc20Abi = {
  137: leedorian_erc20_contract, // Polygon Mainnet
  80001: leedorian_erc20_contract, // Mumbai testnet
};

const nftAddress = {
  1: "0xBE5C953DD0ddB0Ce033a98f36C981F1B74d3B33f",
  4: "0x0ECA0A58018c19eD934a6527E31e585F1F1Bd653",
};

const leedovaultAddress = {
  1: "0x0866f2af4cf0b601A1a2c4eBD56CBB954a1cF004",
  4: "0x106899D511D0069BA1E80E22a979EE382Ee06B90",
};

const leedoerc20Address = {
  1: "0x3eede143adb9a80c6a44c63dad76269d33e2c8d1",
  4: "0xFC8786978C714B0f279Bb9D85C57B618670302cc",
};

const utilityAddress = {
  1: "0x7C0A7B9735d0d245CfB83A3C3b94363faCF0e559",
  4: "0x0cbc7721c2b845264cc5d364199b0b88bce929bd",
};

const networkList = {
  1: "Ethereum Mainnet",
  4: "Rinkeby Testnet",
  137: "Matic Polygon Mainnet",
  80001: "Matic Mumbai Testnet",
};

const leedorianAddress = {
  137: "0x27A3e1e71B6f4C8f388e55C01c8Bb49139492071",
  80001: "0x27A3e1e71B6f4C8f388e55C01c8Bb49139492071",
};

const leedorianERC20Address = {
  137: "0x94576423d85b47575BBA515a1F328A265e6318e6",
  80001: "0x94576423d85b47575BBA515a1F328A265e6318e6",
};

async function getNFTContract(_chainId) {
  try {
    // console.log("nftAbi _chainId => ", _chainId);
    // console.log("nftAddress => ", nftAddress[_chainId]);

    nftContract = new web3.eth.Contract(nftAbi[_chainId], nftAddress[_chainId]);
    return true;
  } catch (error) {
    console.log("getNFTContract error => ", error);
    return false;
  }
}

async function getErc20Contract(_chainId) {
  try {
    // console.log("erc20Abi _chainId => ", _chainId);
    // console.log("leedoerc20Address => ", leedoerc20Address[_chainId]);
    leedoerc20Contract = new web3.eth.Contract(erc20Abi[_chainId], leedoerc20Address[_chainId]);
    return true;
  } catch (error) {
    console.log("getErc20Contract error => ", error);
    return false;
  }
}

async function getVaultContract(_chainId) {
  try {
    // console.log("getVaultContract _chainId => ", _chainId);
    // console.log("leedovaultAddress => ", leedovaultAddress[_chainId]);
    leedovaultContract = new web3.eth.Contract(vaultAbi[_chainId], leedovaultAddress[_chainId]);
    return true;
  } catch (error) {
    console.log("getVaultContract error => ", error);
    return false;
  }
}

async function getUtilContract(_chainId) {
  try {
    // console.log("getUtilContract _chainId => ", _chainId);
    // console.log("utilityAddress => ", utilityAddress[_chainId]);
    utilityContract = new web3.eth.Contract(utilAbi[_chainId], utilityAddress[_chainId]);
    return true;
  } catch (error) {
    console.log("getUtilContract error => ", error);
    return false;
  }
}

async function getLeedorianContract(_chainId) {
  try {
    // console.log("getLeedorianContract _chainId => ", _chainId);
    // console.log("leedorianAddress => ", leedorianAddress[_chainId]);
    leedorianContract = new web3.eth.Contract(leedorianAbi[_chainId], leedorianAddress[_chainId]);
    return true;
  } catch (error) {
    console.log("getLeedorianContract error => ", error);
    return false;
  }
}

async function getLeedorianErc20Contract(_chainId) {
  try {
    // console.log("getLeedorianErc20Contract _chainId => ", _chainId);
    // console.log("leedorianERC20Address => ", leedorianERC20Address[_chainId]);
    leedorianErc20Contract = new web3.eth.Contract(leedorianErc20Abi[_chainId], leedorianERC20Address[_chainId]);
    return true;
  } catch (error) {
    console.log("getLeedorianContract error => ", error);
    return false;
  }
}

async function fetchTotalSupply() {
  return await nftContract.methods.totalSupply().call();
}

async function stakedCount() {
  return await leedovaultContract.methods.totalSupply().call();
}

async function myStakedCount(_myaddr) {
  return await leedovaultContract.methods.balanceOf(_myaddr).call();
}

async function unstakedCount(_myaddr) {
  return await nftContract.methods.balanceOf(_myaddr).call();
}

// get Unstaked cards
async function unStakedIds(_myaddr) {
  return await utilityContract.methods.tokensOf(_myaddr, false).call();
}

// get Staked cards
async function stakedIds(_myaddr) {
  return await utilityContract.methods.tokensOf(_myaddr, true).call();
}

// get Arrived cards
async function getArrivedIds(_myaddr) {
  return await leedorianContract.methods.tokensOf(_myaddr).call();
}

async function getApproved(_myaddr, _chainId) {
  return await nftContract.methods.isApprovedForAll(_myaddr, leedovaultAddress[_chainId]).call();
}

async function getUnstakedBalance(_myaddr) {
  return await nftContract.methods.balanceOf(_myaddr).call();
}

async function getStakedBalance(_myaddr) {
  return await leedovaultContract.methods.balanceOf(_myaddr).call();
}

async function setVaultApproved(_approve, _myaddr) {
  let rt_val = false;
  await nftContract.methods
    .setApprovalForAll(leedovaultAddress, _approve)
    .send({ from: _myaddr })
    .on("transactionHash", (txid) => {
      // console.log(`txid: ${txid}`)
    })
    .once("allEvents", (allEvents) => {
      // console.log('allEvents')
      // console.log(transferEvent)
    })
    .once("Transfer", (transferEvent) => {
      // console.log('trasferEvent', transferEvent)
    })
    .once("receipt", (receipt) => {
      // console.log('receipt')
      // console.log(receipt)
      if (receipt.status) {
        rt_val = true;
      } else {
        rt_val = false;
      }
    })
    .on("error", (error) => {
      console.log(error);
      rt_val = false;
    });
  return rt_val;
}

async function checkIn(_myaddr, _cardList) {
  let rt_val = false;
  // console.log("checkIn");
  await leedovaultContract.methods
    .stake(_cardList)
    .send({ from: _myaddr })
    .on("transactionHash", (txid) => {
      // console.log(`txid: ${txid}`)
    })
    .once("allEvents", (allEvents) => {
      // console.log('allEvents')
      // console.log(transferEvent)
    })
    .once("Transfer", (transferEvent) => {
      // console.log('trasferEvent', transferEvent)
    })
    .once("receipt", (receipt) => {
      // console.log('receipt')
      // console.log(receipt)
      if (receipt.status) {
        rt_val = true;
      } else {
        rt_val = false;
      }
    })
    .on("error", (error) => {
      console.log(error);
      rt_val = false;
    });
  return rt_val;
}

async function checkOut(_myaddr, _cardList) {
  let rt_val = false;
  await leedovaultContract.methods
    .withdraw(_cardList)
    .send({ from: _myaddr })
    .on("transactionHash", (txid) => {
      // console.log(`txid: ${txid}`)
    })
    .once("allEvents", (allEvents) => {
      // console.log('allEvents')
      // console.log(transferEvent)
    })
    .once("Transfer", (transferEvent) => {
      // console.log('trasferEvent', transferEvent)
    })
    .once("receipt", (receipt) => {
      if (receipt.status) {
        rt_val = true;
      } else {
        rt_val = false;
      }
    })
    .on("error", (error) => {
      console.log(error);
      rt_val = false;
    });
  return rt_val;
}

async function getRewardsBalance(_myaddr) {
  let reWards_wei = await leedovaultContract.methods.calcRewards(_myaddr).call();

  // console.log("reWards_wei => ", reWards_wei);
  return reWards_wei;
}

async function getClaimedRewardsBalance(_myaddr) {
  let total_reWards_wei = await leedovaultContract.methods.totalClaims(_myaddr).call();
  // console.log("total_reWards_wei => ", total_reWards_wei);

  return total_reWards_wei;
}

async function rewardsClaim(_myaddr) {
  let rt_val = false;
  await leedovaultContract.methods
    .claimRewards()
    .send({ from: _myaddr })
    .on("transactionHash", (txid) => {
      // console.log(`txid: ${txid}`)
      // $(`#sendDkey-tx`).html(`Transaction Info txid: ${getLink(txid)}<span id="pending-sendDkey-tx" style="color:red;"><img src="spin.gif">블록체인 컨펌 대기중...</span>`);
    })
    .once("allEvents", (allEvents) => {
      // console.log('allEvents')
      // console.log(transferEvent)
    })
    .once("Transfer", (transferEvent) => {
      // console.log('trasferEvent', transferEvent)
    })
    .once("receipt", (receipt) => {
      console.log("receipt => ", receipt);
      // console.log(receipt)
      if (receipt.status) {
        rt_val = true;
      } else {
        rt_val = false;
      }
    })
    .on("error", (error) => {
      console.log(error);
      rt_val = false;
    });
  return rt_val;
}

async function getLatestCardTokenId(_myaddr) {
  var userCardNumber = await nftContract.methods.balanceOf(_myaddr).call();
  // console.log(`userCardNumber: ${userCardNumber}`)
  var tokenId = await nftContract.methods.tokenOfOwnerByIndex(_myaddr, userCardNumber - 1).call();
  // console.log(`tokenId: ${tokenId}`);
  return tokenId;
}

async function RequestAddToken() {
  let token_address;
  token_address = leedoerc20Address;
  await ethereum
    .request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: token_address,
          symbol: "LEEDO",
          decimals: 18,
          image: "https://leedoproject.com/leedo_token_icon.png",
        },
      },
    })
    .then((success) => {
      if (success) {
        console.log("LEEDO successfully added to wallet!");
      } else {
        throw new Error("Something went wrong.");
      }
    })
    .catch(console.error);
}

async function getCardInfo(tokenId, kind) {
  try {
    switch (kind) {
      case "staked":
      case "bonusclaim":
        var tokenInfoBase64 = await leedovaultContract.methods.tokenURI(tokenId).call();
        break;
      case "unstaked":
        var tokenInfoBase64 = await nftContract.methods.tokenURI(tokenId).call();
        break;
      case "metaverse":
        var tokenInfoBase64 = await leedorianContract.methods.tokenURI(tokenId).call();
        break;
    }
    var jsonInfo = JSON.parse(atob(tokenInfoBase64.substring(29)));
    return jsonInfo;
  } catch (errGetCardInfo) {
    console.log(errGetCardInfo);
  }
}

async function getLastBlock(_myaddr) {
  return await leedovaultContract.methods.lastBlocks(_myaddr).call();
}

// get Unclaimed cards
async function getUnclaims(_myaddr) {
  return await utilityContract.methods.getUnclaims(_myaddr).call();
}

// get My LEEDO token balance
async function getLeedoBalance(_chainId, _myaddr) {
  if (_chainId == 1 || _chainId == 4) {
    return await leedoerc20Contract.methods.balanceOf(_myaddr).call();
  } else if (_chainId == 137 || _chainId == 80001) {
    return await leedorianErc20Contract.methods.balanceOf(_myaddr).call();
  } else {
    return 0;
  }
}

async function bonusClaim(_myaddr, _cardList) {
  let rt_val = false;
  await leedoerc20Contract.methods
    .claim(_cardList)
    .send({ from: _myaddr })
    .on("transactionHash", (txid) => {
      // console.log(`txid: ${txid}`);
    })
    .once("allEvents", (allEvents) => {
      // console.log("allEvents");
      // console.log(transferEvent);
    })
    .once("Transfer", (transferEvent) => {
      // console.log("trasferEvent", transferEvent);
    })
    .once("receipt", (receipt) => {
      // console.log("receipt=>", receipt);
      if (receipt.status) {
        rt_val = true;
      } else {
        rt_val = false;
      }
    })
    .on("error", (error) => {
      rt_val = false;
      console.log(error);
    });
  return rt_val;
}
