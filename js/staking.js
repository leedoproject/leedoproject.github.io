let RewardCounterInterval;
let unstakedcardIds = [];
let stakedCardIds = [];
let arrivedIds = [];
var staked_cards = 0;
var unstaked_cards = 0;

window.addEventListener("load", function () {
  loadWeb3();
  if (typeof window.web3 !== "undefined") {
    watchChainAccount();
    startApp();
  } else {
    alert("You need to install dapp browser first to use this site!");
  }
});

function loadWeb3() {
  if (typeof window.ethereum !== "undefined") {
    window.web3 = new Web3(window.ethereum);
  } else {
    window.web3 = new Web3(
      "https://mainnet.infura.io/v3/302b2ccfd49a40d480567a132cb7eb1d"
    );
  }
}

function watchChainAccount() {
  web3.currentProvider.on("accountsChanged", (accounts) => {
    startApp();
    // showMsg("<p>Your account has been changed!</p><button onclick='location.reload()'>Reload</button>");
  });
  web3.currentProvider.on("chainChanged", (chainId) => {
    startApp();
    // showMsg("<p>Network (Chain) has been changed!</p><button onclick='location.reload()'>Reload</button>");
    // console.log('aa');
  });
}

function connectWallet() {
  if (typeof ethereum === "undefined") {
    return showMsg(noAddrMsg);
  }

  ethereum
    .request({ method: "eth_requestAccounts" })
    .then((accounts) => {
      myAddr = accounts[0];
      $(".my-address").html(getLink(myAddr));
      //지갑 연결시 버튼 안보이게하기
      $("#connect-btn").css("display", "none");
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
}

async function startApp() {
  console.log("startApp");
  try {
    var currentChainId = await web3.eth.getChainId();
    chainId = currentChainId;

    if (chainId === 1 || chainId === 4 || chainId === 5) {
      await getAccount();
      await fetchStakingInfo();

      //Temp
      // await getStakedCards("staked");
      // await getStakedCards("unstaked");
      staked_cards = await myStakedCount(myAddr);
      await fetchRewardsInfo();
      listTabData();
    }
  } catch (err) {
    console.log("startApp => ", err);
  }
}

async function getAccount() {
  try {
    getContracts();

    var accounts = await web3.eth.getAccounts();
    console.log("getAccount => ", accounts);
    // console.log("accounts => ", accounts);
    // console.log("getAccount() => chainId => ", chainId);
    if (accounts.length > 0) {
      // myAddr = web3.utils.toChecksumAddress(accounts[0]);
      myAddr = accounts[0];

      $("#my-address").html(getLink(myAddr));
      $("#connect-btn").hide();
    } else {
      $("#connect-btn").show();
      $("#my-address").html("");

      console.log("No ethereum account is available!");
    }
  } catch (err) {
    $("#connect-btn").show();

    console.log("getAccount => ", err);
  }
}

async function getContracts() {
  try {
    if (chainId === 1 || chainId === 4 || chainId === 5) {
      getNFTContract(chainId);
      getErc20Contract(chainId);
      getVaultContract(chainId);
      getUtilContract(chainId);

      $("#leedo-address").html(getLink(nftAddress[chainId]));
      $("#leedo-staking-address").html(getLink(leedovaultAddress[chainId]));
      $("#leedo-erc20-address").html(getLink(leedoerc20Address[chainId]));
    }
  } catch (err) {
    console.log(err);
  }
}

async function fetchStakingInfo() {
  // total supply, staking  count
  try {
    const totalSupply = await fetchTotalSupply();
    const stakingNumber = await stakedCount();
    document.getElementById("total_supply").innerText = totalSupply;
    document.getElementById("stakednum").innerText = stakingNumber;

    let staking_rate = (parseInt(stakingNumber) / parseInt(totalSupply)) * 100;
    console.log("staking_rate =>", staking_rate.toFixed(2));

    const stakinginfo =
      '<progress class="staking-progress" value="' +
      stakingNumber +
      '" max="' +
      totalSupply +
      '"></progress><span style="margin-left:10px; font-size:24px">' +
      staking_rate.toFixed(2) +
      " %</span>";

    $(".stakinginfo").html(stakinginfo);

    const myUnStakedCards = await unstakedCount(myAddr);
    const myStakedCards = await myStakedCount(myAddr);

    document.getElementById("my_unstaked_cards").innerText = myUnStakedCards;
    document.getElementById("my_staked_cards").innerText = myStakedCards;
  } catch (error) {
    console.log(error);
  }
  return;
}

async function fetchRewardsInfo() {
  try {
    clearInterval(RewardCounterInterval);

    const totalRewards = await getRewardsBalance(myAddr);
    const claimedRewards = await getClaimedRewardsBalance(myAddr);

    let total_reWards_gwei = ethers.utils.formatUnits(totalRewards, 18);
    let claim_reWards_gwei = ethers.utils.formatUnits(claimedRewards, 18);

    total_reWards_gwei = parseFloat(total_reWards_gwei).toFixed(5);
    claim_reWards_gwei = parseFloat(claim_reWards_gwei).toFixed(5);

    runRewardCounter(total_reWards_gwei);

    total_reWards_gwei = total_reWards_gwei
      .toString()
      .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    claim_reWards_gwei = claim_reWards_gwei
      .toString()
      .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

    document.getElementById("reward_balance").innerText = total_reWards_gwei;
    document.getElementById("claimed_rewards").innerText = claim_reWards_gwei;
  } catch (error) {
    console.log(error);
  }
  return;
}

function runRewardCounter(cur_balance) {
  /*
    rewards per block 5194874553201880 (wei)
    1 block = 13sec
    display unit : ETH ( wei to ETH : 1000000000000000000 )
  */
  let _balance = parseFloat(cur_balance);
  const blockRewards = (0.00519487455320188 / 13.5) * staked_cards;
  // Test
  console.log("runRewardCounter cur_balance => ", _balance);
  console.log("runRewardCounter staked_cards => ", staked_cards);
  if (staked_cards > 0) {
    RewardCounterInterval = setInterval(function () {
      _balance = _balance + blockRewards;

      let _balance_short = parseFloat(_balance).toFixed(5);
      console.log("_balance =>", _balance);
      let formatted__balance = _balance_short
        .toString()
        .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      // console.log("formatted__balance => ", formatted__balance);
      document.getElementById("reward_balance").innerText = formatted__balance;
    }, 1000);
  }
}

async function getStakedCards(_kind) {
  let tokenId = [];

  switch (_kind) {
    case "staked":
    case "bonusclaim":
      stakedCardIds = await stakedIds(myAddr);
      tokenId = stakedCardIds;
      staked_cards = stakedCardIds.length;
      break;
    case "unstaked":
      unstakedcardIds = await unStakedIds(myAddr);
      tokenId = unstakedcardIds;
      unstaked_cards = unstakedcardIds.length;
      break;
  }

  const cardInfoList = await Promise.all(
    tokenId.map((id) => {
      // console.log("aaaaa => ", getCardInfo(id,""));
      return getCardInfo(id, _kind);
    })
  );

  let arr = [];
  cardInfoList.forEach((info, i) => {
    arr.push({ tokenId: tokenId[i], image: info.image });
  });

  arr.sort(function (a, b) {
    return parseFloat(a.tokenId) - parseFloat(b.tokenId);
  });

  console.log("cardInfoList => ", arr);

  function Deck(arr) {
    document.getElementById("deck").innerHTML = "";
    for (let i = 0; i < arr.length; i++) {
      let card = document.createElement("div");
      let imgBox = document.createElement("div");
      let descriptionBox = document.createElement("div");
      let tokenId = document.createElement("div");
      let checkBox = document.createElement("div");
      let label = document.createElement("div");
      card.className = "card";
      imgBox.className = "imgbox";
      descriptionBox.className = "descriptionBox";
      tokenId.className = "tokenID";
      checkBox.className = "checkBox";

      label.innerHTML = ``;
      imgBox.innerHTML = `<label class="checkbox-label" for="checkBox${arr[i].tokenId}" />
        <img style="width: auto; height: auto; max-width: 200px; "  src="${arr[i].image}" />         
        `;

      tokenId.innerHTML = `#${arr[i].tokenId} </label>`;
      checkBox.innerHTML = `<input id="checkBox${arr[i].tokenId}" style="width:20px;height:20px; " type="checkbox"  value="${arr[i].tokenId}" onclick ="checkBoxClick(this)"/>`;
      card.appendChild(imgBox);
      card.appendChild(descriptionBox);
      descriptionBox.appendChild(tokenId);
      descriptionBox.appendChild(checkBox);

      document.getElementById("deck").appendChild(card);
    }
  }

  Deck(arr);
}

// kind : unstaked / staked
async function listTabData() {
  let kind = "unstaked";
  if (document.getElementById("tab1").checked) {
    kind = "unstaked";
  } else {
    kind = "staked";
  }
  stakeKind = kind;
  // alert(stakeKind);
  await getStakedCards(stakeKind);
}
