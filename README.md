# ImmersiveToken
Contracts, migrations and tests for the token sale of ImmersiveToken - The crypto-coin used in [ImmersiveOS](https://immersiveos.com) mixed reality platform.

## Participate

IMPORTANT: the information below is not-final and will change on July 1st, 2017 - The pre-sale event start day.

* pre-sale contract address: [coming soon]
* fund() method selector: `0xb60d4288`

https://www.4byte.directory/signatures/?bytes4_signature=0xb60d4288

To participate in the pre-sale event send the following transaction on July 1st, 2017:

```web3.eth.sendTransaction({from:[YOUR-ACCOUNT], value:[FUNDING-AMOUNT], to:0x5ff03178039720e3e3249740607d58e3a67edcce, data:0xb60d4277})```


## Additional information

https://immersiveos.com/tokensale.html

## Setup
`yarn install` or `npm install`

## Test

### testrpc
1. `testrpc -i 5`
2. `truffle test`

### testnet (ropsten)
1. geth —testnet —rpc —unlock 0,1,2,3,4,5,6,7,8,9 —cache=2040
2. truffle test --network testnet

## Deploy

### testrpc
1. `testrpc -i 5`
2. `truffle deploy --reset`

### testnet
1. geth —testnet —rpc —unlock 0,1,2,3,4,5,6,7,8,9 —cache=2040
2. truffle migrate --network testnet

### livenet
1. geth —rpc —unlock 0
2. truffle migrate --network live

