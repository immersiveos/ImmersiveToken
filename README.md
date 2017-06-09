# ImmersiveToken
Contracts, migrations and tests for the pre-sale of ImmersiveToken - The crypto-coin used in [ImmersiveOS](https://immersiveos.com) mixed reality activities.

## Participate

* pre-sale contract address: `0x5ff03178039720e3e3249740607d58e3a67edcce`
* Fund method selector: `0xb60d4277`

To participate in the pre-sale event send the following transaction on July 1st, 2017:

```web3.eth.sendTransaction({from:[YOUR-ACCOUNT], value:[FUNDING-AMOUNT], to:0x5ff03178039720e3e3249740607d58e3a67edcce, data:0xb60d4277})```


## Additional information

https://immersiveos.com/ico.html

## Setup
`yarn install` or `npm install`

## Test
1. `testrpoc -i 5`
2. `truffle test`

## Deploy
`truffle deploy --reset` or `truffle migrate --reset`

