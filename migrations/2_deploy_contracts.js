let ImmersiveToken = artifacts.require("./ImmersiveToken.sol");
let log = console.log;

let Web3 = require('../node_modules/web3');
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

module.exports = function(deployer, network, accounts) {

  if (network === 'development') {
    log("Dev deployment...");

    const opsAddress = accounts[0];
    const endBlock = web3.eth.blockNumber + 100;
    const fundingGoal = 100;

    log ("End block:" + endBlock);
    log ("Ops account: " + accounts[0])
    log ("Funding gaol:" + fundingGoal)

    deployer.deploy(ImmersiveToken,accounts[0],fundingGoal,endBlock);

  } else if (network === 'live') {

    log("Livenet deployment...");

    const opsAddress = '0x95db9c1e4ca634c90333f8eded6e354ad6eba9dc';

    const blocksPerMinutes = 3; // 20 secs average per block
    const blocksPerHour = blocksPerMinutes * 60;
    const blocksPerDay = blocksPerHour * 24;
    const blocksInMonth = blocksPerDay * 30;
    const campaginDurationMonths = 2;

    const endBlock = web3.eth.blockNumber.add(blocksInMonth * campaginDurationMonths);

    const fundingGoal = web3.toWei(new BigNumber(1), "ether");

    log ("End block:" + endBlock);
    log ("Ops account: " + opsAddress);
    log ("Funding gaol:" + fundingGoal);

    /// todo: put unlocked account here from geth
    const deployerAccount = '0x95db9c1e4ca634c90333f8eded6e354ad6eba9dc';
    const deployGasPrice = 1000000; // todo: look at gas station no need to set 2*10^9 here

    deployer.deploy(ImmersiveToken,opsAddress,fundingGoal,endBlock, {from:deployerAccount, gas:4000000, gasPrice:deployGasPrice});


  } else {
    log("Unexpected net - aborting.");
  }
};
