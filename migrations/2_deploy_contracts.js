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

  } else if (network === 'live') {

    log("Livenet deployment...");

    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8546'));

    // todo: put ops account multi-sig wallet address here
    const opsAddress = '0x95db9c1e4ca634c90333f8eded6e354ad6eba9dc';

    const blocksPerMinutes = 3.5; // assume 20 secs average per block
    const blocksPerHour = blocksPerMinutes * 60;
    const blocksPerDay = blocksPerHour * 24;
    const blocksInMonth = blocksPerDay * 31; // july and august are 31 days each
    const campaignDurationMonths = 2;

    const startblock = web3.eth.blockNumber;
    const endBlock = web3.eth.blockNumber.add(blocksInMonth * campaginDurationMonths);

    const fundingGoal = web3.toWei(new BigNumber(6000), "ether");

    log (`Start block: ${startblock}`);
    log (`End block: ${endBlock}`);
    log (`Ops account: ${opsAddress}`);
    log (`Funding goal: ${fundingGoal}`);

    /// todo: put deployer account here
    const deployerAccount = '0x95db9c1e4ca634c90333f8eded6e354ad6eba9dc';
    const deployGasPrice = 1000000;

    deployer.deploy(ImmersiveToken,opsAddress,fundingGoal,endBlock, {from:deployerAccount, gas:4000000, gasPrice:deployGasPrice});

    ImmersiveToken.deployed().then ((res)=> {
        log (`>>>> Deployed contract address: ${res.address}`);
      }
    );

  } else {
    log("Unexpected net - aborting.");
  }
};
