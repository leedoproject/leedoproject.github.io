let arrivedIds = [];
let walletConnected = false;

const POLYGON_CHAIN_NAME = "Matic Polygon Mainnet";
const POLYGON_TOKEN_NAME = "Matic Token";
const POLYGON_SYMBOL = "MATIC";
const POLYGON_DECIMAL = 18;
const POLYGON_RPC_URL = "https://polygon-rpc.com/";
const POLYGON_BLOCK_EXPLORER = "https://polygonscan.com";

window.addEventListener("load", function () {
  loadWeb3();
  if (typeof window.web3 !== "undefined") {
    if (watchChainAccount()) {
      startApp();
    }
  } else {
    alert("You need to install dapp browser first to use this site!");
  }
});

function loadWeb3() {
  if (typeof window.ethereum !== "undefined") {
    window.web3 = new Web3(window.ethereum);
  } else {
    window.web3 = new Web3("https://mainnet.infura.io/v3/302b2ccfd49a40d480567a132cb7eb1d");
  }
}

function watchChainAccount() {
  try {
    web3.currentProvider.on("accountsChanged", (accounts) => {
      startApp();
      // showMsg("<p>Your account has been changed!</p><button onclick='location.reload()'>Reload</button>");
    });
    web3.currentProvider.on("chainChanged", (chainId) => {
      startApp();
      // showMsg("<p>Network (Chain) has been changed!</p><button onclick='location.reload()'>Reload</button>");
      // console.log('aa');
    });
    return true;
  } catch (error) {
    console.log(error);
    initBlankItems();
    return false;
  }
}

function initBlankItems() {
  $(".address-network").show();
  // document.getElementById("address-network").innerHTML =
  //   '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C17.1957 3.05357 14.6522 2 12 2C9.34784 2 6.8043 3.05357 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C6.8043 20.9464 9.34784 22 12 22V22ZM10.5 16.5C10.5 16.1022 10.658 15.7206 10.9393 15.4393C11.2206 15.158 11.6022 15 12 15C12.3978 15 12.7794 15.158 13.0607 15.4393C13.342 15.7206 13.5 16.1022 13.5 16.5C13.5 16.8978 13.342 17.2794 13.0607 17.5607C12.7794 17.842 12.3978 18 12 18C11.6022 18 11.2206 17.842 10.9393 17.5607C10.658 17.2794 10.5 16.8978 10.5 16.5ZM11.016 6.82C11.0577 6.58944 11.1791 6.38085 11.359 6.23065C11.5388 6.08045 11.7657 5.99817 12 5.99817C12.2343 5.99817 12.4612 6.08045 12.641 6.23065C12.8209 6.38085 12.9423 6.58944 12.984 6.82L13 7V12L12.984 12.18C12.9423 12.4106 12.8209 12.6191 12.641 12.7694C12.4612 12.9196 12.2343 13.0018 12 13.0018C11.7657 13.0018 11.5388 12.9196 11.359 12.7694C11.1791 12.6191 11.0577 12.4106 11.016 12.18L11 12V7L11.016 6.82Z" fill="#F8C40C"/></svg> 블록체인 지갑이 설치되어있지 않습니다.';

  $(".connect-btn").hide();
  $(".address-myaddress").hide();
  $("#leedo-address").html(getLink(leedorianAddress[137], 137));
  $("#leedo-erc20-address").html(getLink(leedorianERC20Address[137], 137));
  document.getElementById("add-token-btn").disabled = true;
}

function initUseItems() {
  document.getElementById("add-token-btn").disabled = false;
}

function connectWallet() {
  myAddr = dappConnectWallet(ethereum);
  if (myAddr != undefined && myAddr.length > 0) {
    $("#my-address").html(getLink(myAddr));
    //지갑 연결시 버튼 안보이게하기
    $(".connect-btn").css("display", "none");
  }
}

async function startApp() {
  // console.log("startApp");
  try {
    chainId = await dappGetCurChainId(web3);

    if (chainId === 137 || chainId === 80001) {
      await getAccount();
      // if (walletConnected) {
      initUseItems();
      let networkname = networkList;
      // console.log("networkname ", networkname);
      // console.log("networkList ", networkname[chainId]);
      $("#myaddress-network").html(networkname[chainId]);
      await fetchBalanceInfo();
      showMetaverseCardList("metaverse");
      // } else {
      //   initBlankItems();
      // }
    } else {
      switchNetwork(ethereum, 137, POLYGON_CHAIN_NAME, POLYGON_TOKEN_NAME, POLYGON_SYMBOL, POLYGON_DECIMAL, POLYGON_RPC_URL, POLYGON_BLOCK_EXPLORER);
      walletConnected = false;
      initBlankItems();
    }
  } catch (err) {
    console.log("startApp => ", err);
  }
}

async function getAccount() {
  try {
    getContracts();

    var accounts = await dappGetAccount(web3);
    if (accounts.length > 0) {
      walletConnected = true;
      myAddr = accounts[0];
      $("#my-address").html(getLink(myAddr, chainId));
      $(".connect-btn").hide();
      $(".address-network").hide();
      $(".address-myaddress").show();
    } else {
      walletConnected = false;
      $(".address-network").hide();
      $(".connect-btn").show();
      $("#my-address").html("");
      $(".address-myaddress").hide();

      console.log("No ethereum account is available!");
    }
  } catch (err) {
    $(".connect-btn").show();
    $(".address-network").hide();
    $(".address-myaddress").hide();
    console.log("getAccount => ", err);
  }
}

async function getContracts() {
  try {
    if (chainId === 137 || chainId === 80001) {
      await getLeedorianContract(chainId);
      await getLeedorianErc20Contract(chainId);

      $("#leedo-address").html(getLink(leedorianAddress[chainId], chainId));
      $("#leedo-erc20-address").html(getLink(leedorianERC20Address[chainId], chainId));
    }
  } catch (err) {
    console.log(err);
  }
}

async function fetchBalanceInfo() {
  const myleedobalance = await getLeedoBalance(chainId, myAddr);
  let balance_gwei = ethers.utils.formatUnits(myleedobalance, 18);
  balance_gwei = parseFloat(balance_gwei).toFixed(5);

  balance_gwei = balance_gwei.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  document.getElementById("my_leedo_balance").innerText = balance_gwei;
}

async function RequestAddToken() {
  await AddTokenToWallet(ethereum, chainId, leedorianERC20Address[chainId], "LEEDO", 18, "https://leedoproject.com/leedo_token_icon.png");
}

/* Metaverse Card List */
showMetaverseCardList = async (kind) => {
  $("#metaverse-loading").show();

  arrivedIds = [];
  let tokenId = [];
  let arrived_card_cnt = 0;
  try {
    switch (kind) {
      case "metaverse":
        if (arrivedIds.length == 0) {
          arrivedIds = await getArrivedCards();
          tokenId = arrivedIds;
          // console.log('stakedIds =>',stakedIds);
        } else {
          tokenId = arrivedIds;
        }
        arrived_card_cnt = arrivedIds.length;

        break;
    }
  } catch (errorCardList) {
    console.log(errorCardList);
    $("#metaverse-loading").hide();
  }

  let arr = [];
  const cardInfoList = await Promise.all(
    tokenId.map((id) => {
      return getCardInfo(id, "metaverse");
    })
  );

  document.getElementById("div-arrived-cards").innerHTML = '<p class="margin-b-20">Arrived Cards : ' + arrived_card_cnt + "</p>";

  if (cardInfoList.length > 0) {
    $("#no-card-div").hide();
    $("#div-arrived-cards").show();
    cardInfoList.forEach((info, i) => {
      arr.push({ tokenId: tokenId[i], image: info.image });
    });

    arr.sort(function (a, b) {
      return parseFloat(a.tokenId) - parseFloat(b.tokenId);
    });

    metaverseDeck(arr);
  } else {
    $("#no-card-div").show();
    $("#div-arrived-cards").hide();
    document.getElementById("deck-metaverse").innerHTML = "";
  }

  function metaverseDeck(arr) {
    document.getElementById("deck-metaverse").innerHTML = "";
    for (let i = 0; i < arr.length; i++) {
      let card = document.createElement("div");
      let imgBox = document.createElement("div");
      let descriptionBox = document.createElement("div");
      let tokenId = document.createElement("div");
      //   let checkBox = document.createElement("div");
      card.className = "card";
      imgBox.className = "imgbox";
      descriptionBox.className = "descriptionBox-center";
      tokenId.className = "tokenID";
      //   checkBox.className = "checkBox";

      imgBox.innerHTML = '<img style="width: auto; height: auto; max-width: 200px; "  src="' + arr[i].image + '"/>';
      tokenId.innerHTML = "#" + arr[i].tokenId;
      //   checkBox.innerHTML = `<input style="width:20px;height:20px; " type="checkbox"  value="${arr[i].tokenId}" onclick ="checkBoxClick(this)"/>`;
      card.appendChild(imgBox);
      card.appendChild(descriptionBox);
      descriptionBox.appendChild(tokenId);
      //   descriptionBox.appendChild(checkBox);

      document.getElementById("deck-metaverse").appendChild(card);
    }
  }

  $("#metaverse-loading").hide();
};

async function getArrivedCards() {
  let arrived_cards = [];

  arrived_cards = await getArrivedIds(myAddr);
  return arrived_cards;
}
