let RewardCounterInterval;
let unstakedcardIds = [];
let stakedCardIds = [];

let staked_cards = 0;
let unstaked_cards = 0;
let checkInTokenIdList = [];
let is_Vault_Approved = false;
let stakeKind = "unstaked";
let claimTokenIdList = [];
let walletConnected = false;

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
  $("#leedo-address").html(getLink(nftAddress[1], 1));
  $("#leedo-staking-address").html(getLink(leedovaultAddress[1], 1));
  $("#leedo-erc20-address").html(getLink(leedoerc20Address[1], 1));
  document.getElementById("add-token-btn").disabled = true;
  document.getElementById("claim-btn").disabled = true;
  document.getElementById("btn-open-popup").disabled = true;
}

function initUseItems() {
  document.getElementById("claim-btn").disabled = false;
  document.getElementById("btn-open-popup").disabled = false;
  document.getElementById("add-token-btn").disabled = false;
}

function connectWallet() {
  myAddr = dappConnectWallet(ethereum);
  if (myAddr != undefined && myAddr.length > 0) {
    $("#my-address").html(getLink(myAddr, chainId));
    //지갑 연결시 버튼 안보이게하기
    $(".connect-btn").css("display", "none");
  }
}

async function startApp() {
  try {
    chainId = await dappGetCurChainId(web3);
    console.log("chainID => ", chainId);
    if (chainId === 1 || chainId === 4 || chainId === 5) {
      await getAccount();
      // if (walletConnected) {
      initUseItems();
      let networkname = networkList;
      $("#myaddress-network").html(networkname[chainId]);

      await fetchStakingInfo();
      is_Vault_Approved = await getApproved(myAddr, chainId);
      staked_cards = await myStakedCount(myAddr);
      await fetchRewardsInfo();
      listTabData();
      // } else {
      //   initBlankItems();
      // }
    } else {
      switchNetwork(ethereum, 1);
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
      checkOnetimeBonusClaimAvailable();
    } else {
      walletConnected = false;
      $(".connect-btn").show();
      $(".address-network").hide();
      $(".address-myaddress").hide();
      $("#my-address").html("");

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
    if (chainId === 1) {
      getNFTContract(chainId);
      getErc20Contract(chainId);
      getVaultContract(chainId);
      getUtilContract(chainId);

      $("#leedo-address").html(getLink(nftAddress[chainId], chainId));
      $("#leedo-staking-address").html(getLink(leedovaultAddress[chainId], chainId));
      $("#leedo-erc20-address").html(getLink(leedoerc20Address[chainId], chainId));
    }
    if (chainId === 4 || chainId === 5) {
      getNFTContract(chainId);
      getErc20Contract(chainId);
      getVaultContract(chainId);
      getUtilContract(chainId);

      $("#leedo-address").html(getLink(nftAddress[chainId], chainId));
      $("#leedo-staking-address").html(getLink(leedovaultAddress[chainId], chainId));
      $("#leedo-erc20-address").html(getLink(leedoerc20Address[chainId], chainId));
    } else {
      $("#leedo-address").html(getLink(nftAddress[chainId], chainId));
      $("#leedo-staking-address").html(getLink(leedovaultAddress[chainId], chainId));
      $("#leedo-erc20-address").html(getLink(leedoerc20Address[chainId], chainId));
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

    setStakingProgress(staking_rate.toFixed(2));

    const myUnStakedCards = await unstakedCount(myAddr);
    const myStakedCards = await myStakedCount(myAddr);

    document.getElementById("my_unstaked_cards").innerText = myUnStakedCards;
    document.getElementById("my_staked_cards").innerText = myStakedCards;
    document.getElementById("card_cnt").innerText = " ( " + myUnStakedCards + " )";
    document.getElementById("staked_card_cnt").innerText = " ( " + myStakedCards + " )";
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
    const myBalance = await getLeedoBalance(chainId, myAddr);

    let total_reWards_gwei = ethers.utils.formatUnits(totalRewards, 18);
    let claim_reWards_gwei = ethers.utils.formatUnits(claimedRewards, 18);
    let my_balance_gwei = ethers.utils.formatUnits(myBalance, 18);

    total_reWards_gwei = parseFloat(total_reWards_gwei).toFixed(5);
    claim_reWards_gwei = parseFloat(claim_reWards_gwei).toFixed(5);
    my_balance_gwei = parseFloat(my_balance_gwei).toFixed(5);

    runRewardCounter(total_reWards_gwei);

    total_reWards_gwei = total_reWards_gwei.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    claim_reWards_gwei = claim_reWards_gwei.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    my_balance_gwei = my_balance_gwei.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

    document.getElementById("reward_balance").innerText = total_reWards_gwei;
    document.getElementById("claimed_rewards").innerText = claim_reWards_gwei;
    document.getElementById("my_balance").innerText = my_balance_gwei;
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
  if (staked_cards > 0) {
    RewardCounterInterval = setInterval(function () {
      _balance = _balance + blockRewards;

      let _balance_short = parseFloat(_balance).toFixed(5);
      let formatted__balance = _balance_short.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      document.getElementById("reward_balance").innerText = formatted__balance;
    }, 1000);
  }
}

async function getStakedCards(_kind) {
  $("#stake-loading").show();
  let tokenId = [];
  checkInTokenIdList = [];
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

  $("#stake-loading").hide();

  checkInBody(_kind);
}

function checkInBody(stakeKind) {
  document.getElementById("stake-btn-div").innerHTML = "";
  let stakeBtn = document.createElement("div");

  if (is_Vault_Approved) {
    switch (stakeKind) {
      case "unstaked":
        stakeBtn.innerHTML = '<button style="margin-top:10px" id="stake-btn" disabled onclick="cardCheckIn()">Check-in</button>';

        break;
      case "staked":
        stakeBtn.innerHTML = '<button  style="margin-top:10px" id="stake-btn" disabled onclick="cardCheckOut()">Check-out</button>';

        break;
    }
  } else {
    stakeBtn.innerHTML = '<button  style="margin-top:10px" id="stake-btn" onclick="VaultApprove()">Approve</button>';
  }
  document.getElementById("stake-btn-div").appendChild(stakeBtn);
}

async function VaultApprove() {
  let _approve = false;
  const target = document.getElementById("stake-btn");
  target.disabled = true;

  _approve = await setVaultApproved(true, myAddr);
  if (_approve) {
    is_Vault_Approved = _approve;
    getStakedCards(stakeKind);
  } else {
    target.disabled = false;
  }
}

// kind : unstaked / staked
async function listTabData() {
  let kind = "unstaked";
  if (document.getElementById("check1").checked) {
    kind = "unstaked";
  } else {
    kind = "staked";
  }
  stakeKind = kind;
  // alert(stakeKind);
  switch (kind) {
    case "unstaked":
      document.getElementById("deck-title").innerText = "Check-in now";
      break;
    case "staked":
      document.getElementById("deck-title").innerText = "Check-out now";
      break;
  }
  document.getElementById("deck-selected-cnt").innerText = "( 0 / 20 ) Maximum 20 cards per transaction.";

  if (walletConnected) {
    await getStakedCards(stakeKind);
  }
}

// Progress
function setStakingProgress(_rate) {
  var control = document.getElementById("control");
  var bar = document.querySelector(".bar");
  var value = document.querySelector(".value");

  var RADIUS = 95;
  var CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  function progress(per) {
    var progress = per / 100;
    var dashoffset = CIRCUMFERENCE * (1 - progress);

    value.innerHTML = per + "%";
    bar.style.strokeDashoffset = dashoffset;
  }

  bar.style.strokeDasharray = CIRCUMFERENCE;
  progress(_rate);
}

/* *************************
One-time Bonus Claim Start 
**************************** */
async function checkOnetimeBonusClaimAvailable() {
  let latestNetBlockNum = await getLatestBlockNumber(web3);
  // check lastBlocks on vault contract
  let lastStakedBlock = await getLastBlock(myAddr);

  let calimAvailableBlock = Number(lastStakedBlock);
  if (chainId === 4) {
    calimAvailableBlock = calimAvailableBlock + 1;
  } else {
    calimAvailableBlock = calimAvailableBlock + 200000;
  }
  // Migrant Settlement Aid claim button show/hide

  let unClaims;
  let claimableIds = [];
  unClaims = await getUnclaims(myAddr);
  // console.log("unClaims =>", unClaims);

  if (unClaims.length > 0) {
    claimableIds = unClaims.filter((tokenID) => tokenID != "0");
    // console.log("claimableIds =>", claimableIds);
  }
  if (lastStakedBlock > 0 && claimableIds.length > 0) {
    document.getElementById("reward-grid").style.gridTemplateColumns = "1fr 1fr 1fr";
    $("#one_time_bonus_div").show();
    const btn_open_popup = document.getElementById("btn-open-popup");
    //Claims can only be made when there are claimable cards.
    if (latestNetBlockNum > calimAvailableBlock) {
      if (claimableIds.length > 0) {
        $("#claimable_block").hide();
        btn_open_popup.disabled = false;
      } else {
        $("#one_time_bonus_div").hide();
      }
    } else {
      $("#claimable_block").show();
      btn_open_popup.disabled = true;

      let claimable_block = document.getElementById("claimable_block");
      let block_str = "You can claim after Block ";
      block_str = block_str + '<span><a class="claimable_block_info" href="https://etherscan.io/block/countdown/' + calimAvailableBlock + '"';
      block_str = block_str + ' target="_blank"> #' + calimAvailableBlock + "</a></span>  of Ethereum Mainnet.";
      // console.log("block_str=>", block_str);
      claimable_block.innerHTML = block_str;
    }
  } else {
    document.getElementById("reward-grid").style.gridTemplateColumns = "1fr 1fr";
    $("#one_time_bonus_div").hide();
  }

  return latestNetBlockNum > calimAvailableBlock;
}

async function RequestAddToken() {
  await AddTokenToWallet(ethereum, chainId, leedoerc20Address[chainId], "LEEDO", 18, "https://leedoproject.com/leedo_token_icon.png");
}

async function runRewardsClaim() {
  $("#stake-loading").show();
  const target = document.getElementById("claim-btn");
  target.disabled = true;

  let claimResult = await rewardsClaim(myAddr);
  if (claimResult) {
    fetchRewardsInfo();
    checkOnetimeBonusClaimAvailable();
    $("#stake-loading").hide();
  } else {
    target.disabled = false;
    $("#stake-loading").hide();
  }
}

function checkBoxClick(e) {
  // console.log(e);
  // console.log(e.checked);
  // console.log(e.value);
  if (e.checked) {
    if (checkInTokenIdList.length == 20) {
      alert("You can select up to 20.");
      e.checked = false;
    } else {
      const target = document.getElementById("stake-btn");
      target.disabled = false;
      checkInTokenIdList.push(e.value);
      // console.log(checkInTokenIdList);
    }
  } else {
    // checkInTokenIdList.indexOf(e.value);
    checkInTokenIdList.splice(checkInTokenIdList.indexOf(e.value), 1);
    if (checkInTokenIdList.length == 0) {
      const target = document.getElementById("stake-btn");
      target.disabled = true;
    } else {
      const target = document.getElementById("stake-btn");
      target.disabled = false;
    }
  }

  document.getElementById("deck-selected-cnt").innerText = `(${checkInTokenIdList.length}/ 20 ) Maximum 20 cards per transaction.`;

  // console.log("checkInTokenIdList =>", checkInTokenIdList);
}

async function cardCheckIn() {
  // console.log("cardCheckIn");
  // console.log("checkInTokenIdList => ", checkInTokenIdList);
  const target = document.getElementById("stake-btn");
  target.disabled = true;
  let checkin_result;
  $("#stake-loading").show();
  checkin_result = await checkIn(myAddr, checkInTokenIdList);
  if (checkin_result) {
    // update card count / card list
    unstaked_cards = Number(unstaked_cards) - checkInTokenIdList.length;
    staked_cards = Number(staked_cards) + checkInTokenIdList.length;
    checkInTokenIdList = [];
    stakedCardIds = [];
    unstakedcardIds = [];
    await fetchStakingInfo();
    await fetchRewardsInfo();
    await checkOnetimeBonusClaimAvailable();
    getStakedCards(stakeKind);
  } else {
    target.disabled = false;
    $("#stake-loading").hide();
  }
}

async function cardCheckOut() {
  // console.log("cardCheckOut");
  // console.log("checkInTokenIdList => ", checkInTokenIdList);
  const target = document.getElementById("stake-btn");
  target.disabled = true;
  let checkout_result;
  $("#stake-loading").show();
  checkout_result = await checkOut(myAddr, checkInTokenIdList);
  if (checkout_result) {
    // update card count / card list
    unstaked_cards = Number(unstaked_cards) - checkInTokenIdList.length;
    staked_cards = Number(staked_cards) + checkInTokenIdList.length;
    checkInTokenIdList = [];
    stakedCardIds = [];
    unstakedcardIds = [];
    await fetchStakingInfo();
    await fetchRewardsInfo();
    await checkOnetimeBonusClaimAvailable();
    getStakedCards(stakeKind);
  } else {
    target.disabled = false;
    $("#stake-loading").hide();
  }
}

async function runBonusClaim() {
  console.log("bonusClaim");
  $("#stake-loading").show();
  const target = document.getElementById("bonus-claim-btn");
  const bonus_claim_complete = document.getElementById("bonus_claim_complete");
  bonus_claim_complete.innerHTML = "";
  target.disabled = true;
  let claim_result = false;
  claim_result = await bonusClaim(myAddr, claimTokenIdList);
  if (claim_result) {
    // update unclaim card list
    bonus_claim_complete.innerHTML = "Bonus claim for " + claimTokenIdList.length + " card(s) has been completed.";
    // setTimeout(() => {
    //   target.innerHTML = "";
    // }, 3000);
    claimTokenIdList = [];
    showBonusClaimCardList();
    checkOnetimeBonusClaimAvailable();
  } else {
    target.disabled = false;
    $("#stake-loading").hide();
  }
}

// const body = document.querySelector("body");
const dashboard_body = document.getElementById("dashboard");
const modal = document.querySelector(".modal-onetimebonus");
const btnOpenPopup = document.querySelector(".btn-open-popup");
const btnClosePopup = document.querySelector(".btn-close-popup");
const bonus_claim_complete = document.getElementById("bonus_claim_complete");

btnOpenPopup.addEventListener("click", () => {
  modal.classList.toggle("show");
  const target = document.getElementById("bonus-claim-btn");
  target.disabled = true;

  if (modal.classList.contains("show")) {
    dashboard_body.style.overflow = "hidden";
  }
  showBonusClaimCardList();
});

btnClosePopup.addEventListener("click", () => {
  modal.classList.toggle("show");
  bonus_claim_complete.innerHTML = "";

  const target = document.getElementById("bonus-claim-btn");
  target.disabled = true;

  if (!modal.classList.contains("show")) {
    dashboard_body.style.overflow = "auto";
  }
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.toggle("show");
    bonus_claim_complete.innerHTML = "";

    if (!modal.classList.contains("show")) {
      dashboard_body.style.overflow = "auto";
    }
  }
});

showBonusClaimCardList = async () => {
  $("#stake-loading").show();
  claimTokenIdList = [];
  let unClaims = [];

  unClaims = await utilityContract.methods.getUnclaims(myAddr).call();
  // console.log("unClaims =>", unClaims);
  const claimableIds = unClaims.filter((tokenID) => tokenID != "0");
  // console.log("claimableIds =>", claimableIds);

  let tokenId = claimableIds;

  // console.log("myAddr => ", myAddr);

  let arr1 = [];

  const cardInfoList = await Promise.all(
    tokenId.map((id) => {
      // console.log('aaaaa => ',getCardInfo(id))
      return getCardInfo(id, "bonusclaim");
    })
  );
  cardInfoList.forEach((info, i) => {
    arr1.push({ tokenId: tokenId[i], image: info.image });
  });

  arr1.sort(function (a, b) {
    return parseFloat(a.tokenId) - parseFloat(b.tokenId);
  });

  // console.log(arr1);
  function BonusDeck(arr1) {
    document.getElementById("bonus_deck").innerHTML = "";
    for (let i = 0; i < arr1.length; i++) {
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
      imgBox.innerHTML = `<label class="checkbox-label" for="bonuscheckBox${arr1[i].tokenId}" />
        <img style="width: auto; height: auto; max-width: 200px; "  src="${arr1[i].image}" />         
        `;

      tokenId.innerHTML = `#${arr1[i].tokenId} </label>`;
      checkBox.innerHTML = `<input id="bonuscheckBox${arr1[i].tokenId}" style="width:20px;height:20px; " type="checkbox"  value="${arr1[i].tokenId}" onclick ="checkBoxClick1(this)"/>`;
      card.appendChild(imgBox);
      card.appendChild(descriptionBox);
      descriptionBox.appendChild(tokenId);
      descriptionBox.appendChild(checkBox);

      document.getElementById("bonus_deck").appendChild(card);
    }
  }

  BonusDeck(arr1);

  checkBoxClick1 = (e) => {
    // console.log(e)
    // console.log(e.checked)
    // console.log(e.value)

    if (e.checked) {
      if (claimTokenIdList.length == 20) {
        alert("You can select up to 20.");
        e.checked = false;
      } else {
        const target = document.getElementById("bonus-claim-btn");
        target.disabled = false;
        claimTokenIdList.push(e.value);
      }
    } else {
      // console.log(claimTokenIdList)
      // claimTokenIdList.indexOf(e.value);
      claimTokenIdList.splice(claimTokenIdList.indexOf(e.value), 1);
      if (claimTokenIdList.length == 0) {
        const target = document.getElementById("bonus-claim-btn");
        target.disabled = true;
      } else {
        const target = document.getElementById("bonus-claim-btn");
        target.disabled = false;
      }
    }
    document.getElementById("bonus-deck-selected-cnt").innerHTML = '<p style="margin-bottom: 5px;color: #818181;">( ' + claimTokenIdList.length + " / 20 ) Maximum 20 cards per transaction.</p>";
  };

  document.getElementById("bonus-deck-selected-cnt").innerHTML = '<p style="margin-bottom: 5px;color: #818181;">( 0 / 20 ) Maximum 20 cards per transaction.</p>';

  $("#stake-loading").hide();
};
