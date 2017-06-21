const Web3 = require('web3');
const web3 = new Web3();
const log = console.log;
const ImmersiveToken = artifacts.require('./ImmersiveToken.sol');
const BigNumber = web3.BigNumber;

web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

/*
*   Immersive token and ICO tests
*   https://github.com/immersiveos/ImmersiveToken https://immersiveos.com
*   Copyright the ImmersiveOS Core Dev Team <devteam@immersiveos.com>
*/
contract('ImmersiveToken', function(accounts) {

  // constant useful params
  const fundingGoalParam = web3.toWei(new BigNumber(100), "ether");
  const opsAccountParam = accounts[1];
  const ownerAccount = accounts[2];
  const funderAccount = accounts[3];

  const FUND_SELECTOR = "0xb60d4288";

  it('Should have valid state after deployment', async () => {

    const fundingEndBlockParam = web3.eth.blockNumber + 100;

    // deploy contact
    const instance = await ImmersiveToken.new(opsAccountParam, fundingGoalParam, fundingEndBlockParam, {from: ownerAccount});

    // read contact state
    const fundingInProgress = await instance.fundingInProgress.call();
    const fundingEndBlock = await instance.fundingEndBlock.call();
    const fundingGoal = await instance.fundingGoal.call();
    const opsAccount = await instance.opsAccount.call();

    // test contract state
    assert.equal(fundingInProgress, true, 'Funding should be in progress');
    assert.equal(fundingEndBlock, fundingEndBlockParam, 'Invalid funding end block');
    assert(fundingGoal.equals(fundingGoalParam), 'Funding goal not set');
    assert.equal(opsAccount, opsAccountParam, 'Ops address not set');

  })

  it('Should allow funding while campaign is in progress', async () => {

    const fundingEndBlock = web3.eth.blockNumber + 100;
    const fundingAmount = web3.toWei(new BigNumber(1), "ether");

    // state before funding
    const instance = await ImmersiveToken.new(opsAccountParam, fundingGoalParam, fundingEndBlock, {from: ownerAccount});
    const supplyBeforeFunding = await instance.totalSupply.call();
    const fundBalance = web3.eth.getBalance(instance.address);

    // funding operation using truffle abstraction
    //const fundOps = await instance.fund({value: fundingAmount, from: funderAccount});

    // test transaction using raw contract address and fund method selector
    const res = await web3.eth.sendTransaction({from:funderAccount, value:fundingAmount, to:instance.address, data:FUND_SELECTOR});

    // state after funding
    const updatedSupply = await instance.totalSupply.call();
    const funderBalance = await instance.balanceOf.call(funderAccount);
    const updatedFundBalance = web3.eth.getBalance(instance.address);

    // invariants
    assert(updatedSupply.equals(supplyBeforeFunding.add(fundingAmount)), "Supply should have increased by fund amount");
    assert(funderBalance.equals(fundingAmount), "Account balance not updated");
    assert(updatedFundBalance.equals(fundBalance.add(fundingAmount)), "Fund balance not updated correctly");

  })

  it('Should handle multiple funding transactions for a funder', async () => {

    const fundingEndBlock = web3.eth.blockNumber + 100;
    const fundingAmount = web3.toWei(new BigNumber(1), "ether");
    const secondFundingAmount = web3.toWei(new BigNumber(0.5), "ether");

    // state before funding
    const instance = await ImmersiveToken.new(opsAccountParam, fundingGoalParam, fundingEndBlock, {from: ownerAccount});
    const supplyBeforeFunding = await instance.totalSupply.call();
    const fundBalance = web3.eth.getBalance(instance.address);

    // funding operation
    const fundOp = await instance.fund({value: fundingAmount, from: funderAccount});

    // state after funding
    const updatedSupply = await instance.totalSupply.call();
    const funderBalance = await instance.balanceOf.call(funderAccount);
    const updatedFundBalance = web3.eth.getBalance(instance.address);

    // invariants
    assert(updatedSupply.equals(supplyBeforeFunding.add(fundingAmount)), "Supply should have increased by fund amount");
    assert(funderBalance.equals(fundingAmount), "Account balance not updated");
    assert(updatedFundBalance.equals(fundBalance.add(fundingAmount)), "Fund balance not updated correctly");

    // second funding operation
    const secondFundOp = await instance.fund({value: secondFundingAmount, from: funderAccount});

    // state after seoncd funding
    const updatedSupply1 = await instance.totalSupply.call();
    const funderBalance1 = await instance.balanceOf.call(funderAccount);
    const updatedFundBalance1 = web3.eth.getBalance(instance.address);

    // invariants
    assert(updatedSupply1.equals(updatedSupply.add(secondFundingAmount)), "Supply should have increased by fund amount");
    assert(funderBalance1.equals(fundingAmount.add(secondFundingAmount)), "Account balance not updated");
    assert(updatedFundBalance1.equals(updatedFundBalance.add(secondFundingAmount)), "Fund balance not updated correctly");
  })

  it('Should not allow refunds while campaign in progress', async () => {

    const fundingEndBlock = web3.eth.blockNumber + 100;
    const fundingAmount = web3.toWei(new BigNumber(1), "ether");
    const instance = await ImmersiveToken.new(opsAccountParam, fundingGoalParam, fundingEndBlock, {from: ownerAccount});

    await instance.fund({value: fundingAmount, from: funderAccount});

    await instance.refund({from: funderAccount}).then( (res) => {
      assert(false, "Expected refund to throw while funding is in progress");
    }).catch ((error) => {
      assert(error, "Expected refund to throw error");
    })
  })

  it('Successful campaign', async () => {

    const fundingEndBlock = web3.eth.blockNumber + 100;

    const instance = await ImmersiveToken.new(opsAccountParam, fundingGoalParam, fundingEndBlock, {from: ownerAccount});

    await perfomrSuccesfulCampaignTransactions(instance);

    const totalTokensSupplyPreFinalization = await instance.totalSupply.call();
    log(`Total tokens supply pre finalization: ${getWeiString(totalTokensSupplyPreFinalization)}`);

    const fundWeiBalance = web3.eth.getBalance(instance.address);

    log(`Fund balance: ${getWeiString(totalTokensSupplyPreFinalization)}`);

    const fundingGoal = await instance.fundingGoal.call();
    log(`Funding goal: ${getWeiString(fundingGoal)}`);

    assert(totalTokensSupplyPreFinalization.greaterThanOrEqualTo(fundingGoal), 'Expected balance to be greater than funding goal');
    assert(totalTokensSupplyPreFinalization.equals(fundWeiBalance), 'Expected eth fund balance and tokens supply to be equal');

    // finalize the crowdsale
    await instance.finalizeFunding({from:ownerAccount});

    // read post finalization state
    const fundingInProgress = await instance.fundingInProgress.call();
    const successful = await instance.fundingSuccessful.call();

    // verify post finalization state
    assert(fundingInProgress === false, 'Campaign should have ended');
    assert(successful === true, 'Campaign should be successful');

    //verify ops account eth payment balance (withdrawable)
    const payment = await instance.payments.call(opsAccountParam);

    assert(payment.equals(fundWeiBalance), 'Ops eth payment should match fund final eth balance');

    // verify tokens allocations
    const expectedOpsTokensPostFinalization  = totalTokensSupplyPreFinalization.mul(6).div(10);
    log(`Expected ops account tokens post finalization: ${getWeiString(expectedOpsTokensPostFinalization)}`);

    const expectedTokenSupplyPostFinalization = totalTokensSupplyPreFinalization.add(expectedOpsTokensPostFinalization);
    log(`Expected tokens supply post finalization: ${getWeiString(expectedTokenSupplyPostFinalization)}`);

    const opsAccountTokensBalance = await instance.balanceOf.call(opsAccountParam);
    log(`Ops account tokens balance: ${getWeiString(opsAccountTokensBalance)}`);

    const tokensSupplyPostFinalization = await instance.totalSupply.call();
    log(`Total token suuply post finalization: ${getWeiString(tokensSupplyPostFinalization)}`);

    assert(tokensSupplyPostFinalization.equals(expectedTokenSupplyPostFinalization), 'Token supply mismatch');
    assert(opsAccountTokensBalance.equals(expectedOpsTokensPostFinalization), 'Token supply mismatch');

    // verify owner withdraw operation

    const opsWeiBalancePrePayment = web3.eth.getBalance(opsAccountParam);
    log(`Ops account wei balance pre payment: ${getWeiString(opsWeiBalancePrePayment)}`);

    const transaction = await instance.withdrawPayments({from:opsAccountParam});

    const opsWeiBalancePostPayment = web3.eth.getBalance(opsAccountParam);
    log(`Ops account wei balance post payment: ${getWeiString(opsWeiBalancePostPayment)}`);

    const expectedOpsWeiBalance = opsWeiBalancePrePayment.add(fundWeiBalance).sub(transaction.receipt.gasUsed * web3.eth.gasPrice);
    log(`Expected Ops account wei balance post successful payment: ${getWeiString(expectedOpsWeiBalance)}`);
    //log(`Gas price: ${web3.eth.gasPrice}, gas used: ${transaction.receipt.gasUsed},
    //  totalCost: ${web3.eth.gasPrice * transaction.receipt.gasPrice}`)

    // verify that ops account is within 1 ether from expected balance post funding
    const dif = Math.abs(expectedOpsWeiBalance.sub(opsWeiBalancePostPayment));
    assert (dif < web3.toWei(0.1, "ether"), 'Expected wei balance in ops account');

    // verify ops can't withdraw additional payments
    const withdrdrawableAmount = await instance.payments.call(opsAccountParam);
    assert(withdrdrawableAmount.equals(0), 'Ops withdrawable amount should be 0');
  })

  it('Failed campaign', async () => {

    const fundingEndBlock = web3.eth.blockNumber + 100;
    const fundingWeiAmount = web3.toWei(new BigNumber(9), 'ether');

    const instance = await ImmersiveToken.new(opsAccountParam, fundingGoalParam, fundingEndBlock, {from: ownerAccount});

    // funding ops that add up to more than the funding goal
    await perfomrFailedCampaignTransactions(instance);

    await instance.fund({value: fundingWeiAmount, from: funderAccount});

    const totalTokensSupplyPreFinalization = await instance.totalSupply.call();
    log(`Total tokens supply pre finalization: ${getWeiString(totalTokensSupplyPreFinalization)}`);

    const fundWeiBalance = web3.eth.getBalance(instance.address);
    log(`Fund balance: ${getWeiString(totalTokensSupplyPreFinalization)}`);

    const fundingGoal = await instance.fundingGoal.call();
    log(`Funding goal: ${getWeiString(fundingGoal)}`);

    assert(totalTokensSupplyPreFinalization.lessThan(fundingGoal), 'Expected balance to be less than funding goal');
    assert(totalTokensSupplyPreFinalization.equals(fundWeiBalance), 'Expected eth fund balance and tokens supply to be equal');

    // finalize the campaign
    await instance.finalizeFunding({from:ownerAccount});

    // read post finalization state
    const fundingInProgress = await instance.fundingInProgress.call();
    const successful = await instance.fundingSuccessful.call();

    // verify post finalization state
    assert(fundingInProgress === false, 'Campaign should have ended');
    assert(successful === false, 'Campaign should not be successful');

    //verify ops account eth payment balance (withdrawable) is 0
    const payment = await instance.payments.call(opsAccountParam)
    assert(payment.equals(0), 'Ops eth payment should be 0');

    const fundWeiBalancePostFinalization = web3.eth.getBalance(instance.address);
    log(`Fund balance post finalization: ${getWeiString(fundWeiBalancePostFinalization)}`);

    const funderTokenBalancePreRefund = await instance.balanceOf.call(funderAccount);
    assert(funderTokenBalancePreRefund.equals(fundingWeiAmount), 'Expected refund balance to equal to funding');

    // issue the refund request on behalf of funder
    await instance.refund({from: funderAccount});

    const funderTokenBalancePostRefundRequest = await instance.balanceOf.call(funderAccount);
    assert(funderTokenBalancePostRefundRequest.equals(0), 'Funder should have 0 balance after refund request');

    const funderWeiBalancePreWithdraw = web3.eth.getBalance(funderAccount);
    log(`Funder account wei balance pre payemnt: ${getWeiString(funderWeiBalancePreWithdraw)}`);

    // request eth withdraw
    const transaction = await instance.withdrawPayments({from:funderAccount});

    const funderWeiBalancePostWithdraw = web3.eth.getBalance(funderAccount);
    log(`Funder account wei balance post payment: ${getWeiString(funderWeiBalancePostWithdraw)}`);

    const expectedFunderWeiBalance = funderWeiBalancePreWithdraw.add(funderTokenBalancePreRefund).sub(transaction.receipt.gasUsed);
    log(`Expected funder account wei balance post payment: ${getWeiString(expectedFunderWeiBalance)}`);

    // verify that refunder account is within 1 ether from expected balance post funding
    const diff = Math.abs(expectedFunderWeiBalance.sub(funderWeiBalancePostWithdraw))
    assert(diff < web3.toWei(0.1, "ether"), 'Expected wei balance in funder account post withdrawal');

  })

  it('No refunds possible in a successful campaign', async () => {

    const fundingEndBlock = web3.eth.blockNumber + 100;
    const fundingWeiAmount = web3.toWei(new BigNumber(12), 'ether');

    const instance = await ImmersiveToken.new(opsAccountParam, fundingGoalParam, fundingEndBlock, {from: ownerAccount});

    // funding ops that add up to more than the funding goal

    await perfomrSuccesfulCampaignTransactions(instance);

    await instance.fund({value: fundingWeiAmount, from: funderAccount});

    const totalTokensSupplyPreFinalization = await instance.totalSupply.call();
    log(`Total tokens supply pre finalization: ${getWeiString(totalTokensSupplyPreFinalization)}`);

    const fundWeiBalance = web3.eth.getBalance(instance.address);

    log(`Fund balance: ${getWeiString(totalTokensSupplyPreFinalization)}`);

    const fundingGoal = await instance.fundingGoal.call();
    log(`Funding goal: ${getWeiString(fundingGoal)}`);

    assert(totalTokensSupplyPreFinalization.greaterThanOrEqualTo(fundingGoal), 'Expected balance to be greater than funding goal');
    assert(totalTokensSupplyPreFinalization.equals(fundWeiBalance), 'Expected eth fund balance and tokens supply to be equal');

    // finalize the campaign
    await instance.finalizeFunding({from:ownerAccount});

    // read post finalization state
    const fundingInProgress = await instance.fundingInProgress.call();
    const successful = await instance.fundingSuccessful.call();
    const funderTokenBalancePreRefund = await instance.balanceOf.call(funderAccount);

    // verify post finalization state
    assert(fundingInProgress === false, 'Campaign should have ended');
    assert(successful === true, 'Campaign should be successful');
    assert(funderTokenBalancePreRefund.equals(fundingWeiAmount), 'Expected refund balance to equal to funding');

    // Funder refund request

    await instance.refund({from: funderAccount}).then( (res) => {
      assert(false, 'Expected refund to throw for a scuccessful campaign');
    }).catch ((error) => {
      assert(error, 'Expected refund to throw an error');
    })

    const funderTokenBalancePostRefundRequest = await instance.balanceOf.call(funderAccount);
    assert(funderTokenBalancePostRefundRequest.equals(funderTokenBalancePreRefund), 'Funder balance should not change after refund request');

    const funderWeiBalancePreWithdraw = web3.eth.getBalance(funderAccount);
    log(`Funder account wei balance pre payment: ${getWeiString(funderWeiBalancePreWithdraw)}`);

    // rqueest eth withdraw
    await instance.withdrawPayments({from:funderAccount}).then( (res) => {
      assert(false, 'Expected withdraw to throw for a scuccessful campaign');
    }).catch ((error) => {
      assert(error, 'Expected withdraw to throw an error');
    })

    const funderWeiBalancePostWithdraw = web3.eth.getBalance(funderAccount);
    log(`Funder account wei balance post withdraw request: ${getWeiString(funderWeiBalancePostWithdraw)}`);

    // verify that refunder account is within 1 ether from expected balance post funding
    const diff = Math.abs(funderWeiBalancePreWithdraw.sub(funderWeiBalancePostWithdraw));
    assert(diff < web3.toWei(0.6, "ether"), 'Expected same wei balance in funder account post withdrawal minus gas');

  })

  it('Should not allow funding after campaign has ended', async () => {

    const fundingEndBlock = web3.eth.blockNumber + 100;
    const fundingAmount = web3.toWei(new BigNumber(12), 'ether');

    const instance = await ImmersiveToken.new(opsAccountParam, fundingGoalParam, fundingEndBlock, {from: ownerAccount});

    // funding ops that add up to more than the funding goal

    await perfomrSuccesfulCampaignTransactions(instance);

    // finalize the campaign
    await instance.finalizeFunding({from:ownerAccount});

    const fundSypplyPreFund = await instance.totalSupply.call();
    const fundBalancePreFund = web3.eth.getBalance(instance.address);
    const funderBalancePreFund = await instance.balanceOf.call(funderAccount);

    // attempt funding operation
    await instance.fund({value: fundingAmount, from: funderAccount}).then( (res) => {
      assert(false, "Expected refund to throw while funding is in progress");
    }).catch ((error) => {
      assert(error, "Expected refund to throw error");
    })

    // state after fund attempt
    const fundSupplyPostFund = await instance.totalSupply.call();
    const fundBalancePostFund = web3.eth.getBalance(instance.address);
    const funderBalancePostFund = await instance.balanceOf.call(funderAccount);

    // invariants
    assert(fundSupplyPostFund.equals(fundSypplyPreFund), 'Expected fund supply to remain the same');
    assert(fundBalancePostFund.equals(fundBalancePreFund), 'Expected fund balance to remain the same');
    assert(funderBalancePostFund.equals(funderBalancePreFund), 'Expected funder balance to remain the same');

  })

  it('Should accept direct donations', async () => {

    const fundingEndBlock = web3.eth.blockNumber + 100;
    const donationAmmount = web3.toWei(new BigNumber(12), 'ether');

    const instance = await ImmersiveToken.new(opsAccountParam, fundingGoalParam, fundingEndBlock, {from: ownerAccount});
    const fundBalancePreDonation = web3.eth.getBalance(instance.address);

    const transactionAddress = web3.eth.sendTransaction({from:funderAccount, to:instance.address, value: donationAmmount});
    const receipt = web3.eth.getTransactionReceipt(transactionAddress);
    log (`Gas used: ${receipt.gasUsed}`);

    const fundBalancePostDonation = web3.eth.getBalance(instance.address);
    log(`Fund balance post donation: ${getWeiString(fundBalancePostDonation)}`);

    assert(fundBalancePostDonation.equals(fundBalancePreDonation.add(donationAmmount)), "Expected fund to receive a donation");

  })

  // transactions that should add up to more than the funding goal
  const perfomrSuccesfulCampaignTransactions = async (instance) => {
    await instance.fund({value: web3.toWei(new BigNumber(12), 'ether'), from: accounts[4]});
    await instance.fund({value: web3.toWei(new BigNumber(19), 'ether'), from: accounts[5]});
    await instance.fund({value: web3.toWei(new BigNumber(16), 'ether'), from: accounts[6]});
    await instance.fund({value: web3.toWei(new BigNumber(18), 'ether'), from: accounts[7]});
    await instance.fund({value: web3.toWei(new BigNumber(17), 'ether'), from: accounts[8]});
    await instance.fund({value: web3.toWei(new BigNumber(19), 'ether'), from: accounts[9]});
  }

  // transactions that do not get us close to funding goal
  const perfomrFailedCampaignTransactions = async (instance) => {
    await instance.fund({value: web3.toWei(new BigNumber(9), 'ether'), from: accounts[5]});
    await instance.fund({value: web3.toWei(new BigNumber(6), 'ether'), from: accounts[6]});
    await instance.fund({value: web3.toWei(new BigNumber(8), 'ether'), from: accounts[7]});
    await instance.fund({value: web3.toWei(new BigNumber(7), 'ether'), from: accounts[8]});
    await instance.fund({value: web3.toWei(new BigNumber(9), 'ether'), from: accounts[9]});
  }

  const getWeiString = (amount) => {
    return `${amount} wei (${web3.fromWei(amount)} eth)`;
  }

})
