pragma solidity ^0.4.11;


import "zeppelin-solidity/contracts/token/PausableToken.sol";
import "zeppelin-solidity/contracts/payment/PullPayment.sol";

/*
*   Immersive token and ICO
*   https://github.com/immersiveos/ImmersiveToken https://immersiveos.com
*   Copyright the ImmersiveOS Core Dev Team <devteam@immersiveos.com>
*/
contract ImmersiveToken is PausableToken, PullPayment {
    using SafeMath for uint;

    // standard token info
    string public constant name = "ImmersiveToken";
    string public constant symbol = "IMM";
    uint public constant decimals = 18;

    // crowd funding campaign state
    bool public fundingInProgress;
    bool public fundingSuccessful;
    uint256 public fundingGoal;
    uint256 public fundingStartBlock;
    uint256 public fundingEndBlock;
    address public opsAccount;

    modifier onlyIfFunding() {
        assert(fundingInProgress);
        _;
    }

    modifier onlyInFundingPeriod() {
        assert(block.number >= fundingStartBlock);
        assert(block.number <= fundingEndBlock);
        _;
    }

    modifier onlyIfRefundable() {
        assert(!fundingInProgress);
        assert(!fundingSuccessful);
        _;
    }

    function ImmersiveToken(address _opsAccount, uint256 _fundingGoal, uint256 _fundingEndBlock) {

        assert(_opsAccount != 0x00);
        assert(_fundingEndBlock > block.number);
        assert(_fundingGoal > 0);

        opsAccount = _opsAccount;
        fundingStartBlock = block.number;
        fundingEndBlock = _fundingEndBlock;
        fundingGoal = _fundingGoal;
        fundingInProgress = true;

        fundingStartedEvent(opsAccount, fundingGoal, fundingEndBlock);
    }
    event fundingStartedEvent(address indexed opsAccountAddress, uint256 goal, uint256 endBlock);

    // @notice Create tokens while funding is active
    function fund() payable external onlyIfFunding onlyInFundingPeriod {
        assert(msg.value > 0);
        var amount = msg.value;

        // 1 wei = 1 IMM fixed exchange rate
        balances[msg.sender] = balances[msg.sender].add(amount);
        totalSupply = totalSupply.add(amount);
        fundEvent(msg.sender, amount);
    }
    event fundEvent(address indexed to, uint value);

    // @notice Request a refund if campaign failed
    function refund() external onlyIfRefundable {

        var ethValue = balances[msg.sender];
        assert(ethValue > 0);
        balances[msg.sender] = 0;
        totalSupply = totalSupply.sub(ethValue);

        asyncSend(msg.sender, ethValue);
        refundAvailableEvent(msg.sender, ethValue, "Refund available. Use withdrawPayments to withdraw");
    }
    event refundAvailableEvent(address indexed to, uint value, string message);

    // @notice ico finalization
    function finalizeFunding() external onlyOwner onlyIfFunding {
        fundingInProgress = false;

        if (totalSupply < fundingGoal) {
            fundingSuccessful = false;
            fundingEndedEvent(0, "Campaign failed. You may withdraw all your funds");
            return;
        }

        fundingSuccessful = true;

        // finalize total supply
        var opsTokensAllocation = totalSupply.mul(6).div(10);
        balances[opsAccount] = balances[opsAccount].add(opsTokensAllocation);
        totalSupply = totalSupply.add(opsTokensAllocation);

        asyncSend(opsAccount, this.balance);
        fundingEndedEvent(totalSupply, "Campaign succeeded! Thank you for your support");
    }
    event fundingEndedEvent(uint256 mintedTokens, string message);

    //@notice allow donations
    function () payable {
        assert(msg.value > 0);
        asyncSend(opsAccount, msg.value);
    }

    function getFundSelector() external constant returns (bytes4) {
        return bytes4(sha3("fund()"));
    }
}
