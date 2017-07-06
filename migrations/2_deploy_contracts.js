const ImmersiveToken = artifacts.require("./ImmersiveToken.sol");
const log = console.log;
const Web3 = require('../node_modules/web3');
const web3 = new Web3();
const BigNumber = web3.BigNumber;

module.exports = (deployer, network, accounts) => {

  if (network === 'development') {

    log("Dev deployment...");

    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

    const opsAddress = accounts[0];
    const endBlock = web3.eth.blockNumber + 100;
    const fundingGoal = web3.toWei(new BigNumber(1), "ether");
    const startblock = web3.eth.blockNumber;

    log (`Start block: ${startblock}`);
    log (`End block: ${endBlock}`);
    log (`Ops account: ${opsAddress}`);
    log (`Funding goal: ${fundingGoal}`);

    deployer.deploy(ImmersiveToken, accounts[0], fundingGoal, endBlock);

    ImmersiveToken.deployed().then ((res)=> {
        log (`>>>> Deployed contract address: ${res.address}`);
      }
    );

  } else if (network === 'testnet') {

    log("Testnet (3) deployment...");

    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

    const blocksPerMinutes = 3; // assume 20 secs average per block
    const blocksPerHour = blocksPerMinutes * 60;
    const blocksPerDay = blocksPerHour * 24;
    const blocksInMonth = blocksPerDay * 31; // july and august are 31 days each
    const campaignDurationMonths = 2;

    const startblock = web3.eth.blockNumber;
    const endBlock = web3.eth.blockNumber + (blocksInMonth * campaignDurationMonths);

    const etherToUsdRate = 266.1;
    const fundingGoalUSD = 2000000.0;
    const fundingGoalEther = fundingGoalUSD / etherToUsdRate;
    const fundingGoalWei = web3.toWei(fundingGoalEther, "ether");

    const opsAddress = '0x72a4Aa827665ba9b7Ee35f3600744da3845842a2';

    log (`Start block: ${startblock}`);
    log (`End block: ${endBlock}`);
    log (`Ops account: ${opsAddress}`);
    log (`Funding goal: ${fundingGoalWei} wei (${web3.fromWei(fundingGoalWei)} eth)`);

    deployer.deploy(ImmersiveToken,opsAddress,fundingGoalWei,endBlock);

    ImmersiveToken.deployed().then ((res)=> {
        log (`>>>> Deployed ImmersiveToken :-) address: ${res.address}`);
      }
    );

  } else if (network === 'live') {

    log("Livenet deployment...");

    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8546'));

    const blocksPerMinutes = 3; // assume 20 secs average per block
    const blocksPerHour = blocksPerMinutes * 60;
    const blocksPerDay = blocksPerHour * 24;
    const blocksInMonth = blocksPerDay * 31; // july and august are 31 days each
    const campaignDurationMonths = 2;

    const startblock = web3.eth.blockNumber;
    const endBlock = web3.eth.blockNumber.add(blocksInMonth * campaignDurationMonths);

    const etherToUsdRate = 266.1;
    const fundingGoalUSD = 2000000.0;
    const fundingGoalEther = fundingGoalUSD / etherToUsdRate;
    const fundingGoalWei = web3.toWei(fundingGoalEther, "ether");

    const opsAddress = '0x83D7d318402e421E610709474611140748Ae5bBF';

    log (`Start block: ${startblock}`);
    log (`End block: ${endBlock}`);
    log (`Ops account: ${opsAddress}`);
    log (`Funding goal: ${fundingGoalWei} wei (${web3.fromWei(fundingGoalWei)} eth)`);

    deployer.deploy(ImmersiveToken,opsAddress,fundingGoalWei,endBlock);

    ImmersiveToken.deployed().then ((res)=> {
        log (`>>>> Deployed ImmersiveToken :-) address: ${res.address}`);
      }
    );

  } else {
    log("Unexpected net - aborting.");
  }
};
