// might need change for URL, change to my own at    https://d0zhsof8zxhu.usemoralis.com:2053/server

const serverUrl = "https://d0zhsof8zxhu.usemoralis.com:2053/server"; //Server url from moralis.io
// might need to be replaced by   ojzR9RBj6lH3M4EkXvcPjKrno7cqc6HzP4lSKUUA

const appId = "ojzR9RBj6lH3M4EkXvcPjKrno7cqc6HzP4lSKUUA"; // Application id from moralis.io

let currentTrade = {};
let currentSelectSide;
let tokens;

async function init() {
  await Moralis.start({ serverUrl, appId });
  await Moralis.enableWeb3();
//   await listAvailableTokens();
  await listAvailableTokens();
//   await listAvailables();
  currentUser = Moralis.User.current();
  if (currentUser) {
    document.getElementById("swap_button").disabled = false;
  }
}

async function listAvailableTokens() {
  const result = await Moralis.Plugins.oneInch.getSupportedTokens({
    chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
  });
  tokens = result.tokens;
  let parent = document.getElementById("token_list");

   input = document.getElementById("myInput").value;
    console.log("input is :" + input);
  
    for (const address in tokens) {
        //call all the names
        //console.log(tokens[address].name);
        let token = tokens[address];
        //console.log("address are "+ tokens);
        let div = document.createElement("div");
        div.setAttribute("data-address", address);
        div.className = "token_row";

        let html = 
        `
            <img class="token_list_img" src="${token.logoURI}">
            <span class="token_list_text">${token.symbol}</span>
            `;
            
        //symbol shape appear
        div.innerHTML = html;
        //click use
        div.onclick = () => {
        selectToken(address);
        };
        //appear use
        parent.appendChild(div);
    }
    
  // }else if(input=="none"){
  //   for (const address in tokens) {
  //       //call all the names
  //       //console.log(tokens[address].name);
  //       let token = tokens[address];
  //       //console.log("address are "+ tokens);
  //       let div = document.createElement("div");
  //       div.setAttribute("data-address", address);
  //       div.className = "token_row";

  //       let html = 
  //       `
  //           <img class="token_list_img" src="${token.logoURI}">
  //           <span class="token_list_text">${token.symbol}</span>
  //           `;
            
  //       //symbol shape appear
  //       div.innerHTML = "";
  //       //click use
  //       div.onclick = () => {
  //       selectToken(address);
  //       };
  //       //appear use
  //       parent.appendChild(div);
  //   }
  // }
    
}



function selectToken(address) {
    closeModal();
    console.log("tokens are ");
    console.log(tokens);
    currentTrade[currentSelectSide] = tokens[address];
  //call just one name:       tokens[address].name
    
    // console.log("current trade is: "+currentTrade);
    renderInterface();
    getQuote();
  }

function renderInterface() {
  if (currentTrade.from) {
    document.getElementById("from_token_img").src = currentTrade.from.logoURI;
    document.getElementById("from_token_text").innerHTML = currentTrade.from.symbol;
  }
  if (currentTrade.to) {
    document.getElementById("to_token_img").src = currentTrade.to.logoURI;
    document.getElementById("to_token_text").innerHTML = currentTrade.to.symbol;
  }
}

async function login() {
  try {
    currentUser = Moralis.User.current();
    if (!currentUser) {
      currentUser = await Moralis.authenticate();
    }
    document.getElementById("swap_button").disabled = false;
  } catch (error) {
    console.log(error);
  }
}

function openModal(side) {
  currentSelectSide = side;
  document.getElementById("token_modal").style.display = "block";
}
function closeModal() {
  document.getElementById("token_modal").style.display = "none";
}

async function getQuote() {
  
  if (!currentTrade.from || !currentTrade.to || !document.getElementById("from_amount").value) return;

  let amount = Number(document.getElementById("from_amount").value * 10 ** currentTrade.from.decimals);

  const quote = await Moralis.Plugins.oneInch.quote({
    chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
    fromTokenAddress: currentTrade.from.address, // The token you want to swap
    //toTokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    toTokenAddress: currentTrade.to.address, // The token you want to receive
    amount: amount,
  });

  const quote2 = await Moralis.Plugins.oneInch.quote({
    chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
    fromTokenAddress: currentTrade.from.address, // The token you want to swap
    toTokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    //toTokenAddress: currentTrade.to.address, // The token you want to receive
    amount: amount,
  });

  const quote3 = await Moralis.Plugins.oneInch.quote({
    chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
    fromTokenAddress: currentTrade.to.address, // The token you want to swap
    toTokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    //toTokenAddress: currentTrade.to.address, // The token you want to receive
    amount: amount,
  });

  console.log("quotes are: "+ quote.estimatedGas);
  console.log("To token address is: " + currentTrade.to.address);

  document.getElementById("gas_estimate").innerHTML = quote.estimatedGas;

  //document.getElementById("price_USDT").innerHTML = quote.estimatedGas;
  
  document.getElementById("to_amount").value = quote.toTokenAmount / 10 ** quote.toToken.decimals;
  let price = document.getElementById("to_amount").value;
  console.log("to amount price for selected is: " + price);

  //print the "from token" value in USDT
  let price_USDT = quote2.toTokenAmount / 10 ** quote2.toToken.decimals;
  console.log("amount to USDT is: " + price_USDT);

  //print the "to token" value in USDT
  let price_USDT2 = quote3.toTokenAmount / 10 ** quote3.toToken.decimals;
  console.log("amount to USDT is: " + price_USDT);

  document.getElementById("transfer_USDT").innerHTML = price_USDT;
  document.getElementById("transfer_USDT2").innerHTML = price_USDT2;
  document.getElementById("gas_estimate_2").innerHTML = quote.toTokenAmount / 10 ** quote.toToken.decimals;

//   console.log("gas estimates is"+ quote.estimatedGas);
//   console.log("Amount total= "+ quote.toTokenAmount / 10 ** quote.toToken.decimals);
//   console.log("toTokenAmount= "+ quote.toTokenAmount );
//   console.log("number of /10= "+ quote.toTokenAmount / 10);
   console.log("number of decimal= "+ quote.toToken.decimals);
//   console.log("a test **6 "+ quote.toTokenAmount / 10 ** 6)
}

// async function getQuote2() {
//     if (!currentTrade.from || !currentTrade.to || !document.getElementById("from_amount").value) return;
  
//     let amount = Number(document.getElementById("from_amount").value * 10 ** currentTrade.from.decimals);
  
//     const quote = await Moralis.Plugins.oneInch.quote({
//       chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
//       fromTokenAddress: currentTrade.from.address, // The token you want to swap
//       toTokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
//       //toTokenAddress: currentTrade.to.address, // The token you want to receive
//       amount: amount,
//     });
    
  
//     // document.getElementById("gas_estimate").innerHTML = quote.estimatedGas;
  
//     //document.getElementById("price_USDT").innerHTML = quote.estimatedGas;
    
//     // document.getElementById("to_amount").value = quote.toTokenAmount / 10 ** quote.toToken.decimals;
//     let price = quote.toTokenAmount / 10 ** quote.toToken.decimals;
//     console.log("to amount price for USDT is: " + price);
  
//     document.getElementById("transfer_USDT").innerHTML = price;
  
//   //   console.log("gas estimates is"+ quote.estimatedGas);
//   //   console.log("Amount total= "+ quote.toTokenAmount / 10 ** quote.toToken.decimals);
//   //   console.log("toTokenAmount= "+ quote.toTokenAmount );
//   //   console.log("number of /10= "+ quote.toTokenAmount / 10);
//     // console.log("number of decimal= "+ quote.toToken.decimals);
//   //   console.log("a test **6 "+ quote.toTokenAmount / 10 ** 6)
//   }

async function trySwap() {
  let address = Moralis.User.current().get("ethAddress");
  let amount = Number(document.getElementById("from_amount").value * 10 ** currentTrade.from.decimals);
  if (currentTrade.from.symbol !== "ETH") {
    const allowance = await Moralis.Plugins.oneInch.hasAllowance({
      chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: currentTrade.from.address, // The token you want to swap
      fromAddress: address, // Your wallet address
      amount: amount,
    });
    console.log("Allowances are "+allowance);
    if (!allowance) {
      await Moralis.Plugins.oneInch.approve({
        chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
        tokenAddress: currentTrade.from.address, // The token you want to swap
        fromAddress: address, // Your wallet address
      });
    }
  }
  try {
    let receipt = await doSwap(address, amount);
    alert("Swap Complete");
  } catch (error) {
    console.log(error);
  }
}

function doSwap(userAddress, amount) {
  return Moralis.Plugins.oneInch.swap({
    chain: "eth", // The blockchain you want to use (eth/bsc/polygon)
    fromTokenAddress: currentTrade.from.address, // The token you want to swap
    toTokenAddress: currentTrade.to.address, // The token you want to receive
    amount: amount,
    fromAddress: userAddress, // Your wallet address
    slippage: 1,
  });
}



init();

document.getElementById("modal_close").onclick = closeModal;
document.getElementById("from_token_select").onclick = () => {
  openModal("from");
};
document.getElementById("to_token_select").onclick = () => {
  openModal("to");
};
document.getElementById("login_button").onclick = login;
document.getElementById("from_amount").onblur = getQuote;
document.getElementById("swap_button").onclick = trySwap;