// Allows us to use ES6 in our migrations and tests
require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: 5
    },
    testnet: { //ropsten
      host: 'localhost',
      port: 8545,
      network_id: 3,
      gas: 4000000,
      gasPrice: 20000000000,
      from: '0xeBA8e033aE04CF7B4fC9CFc3109e333692d3fb42'
    },
    rinkeby: {
      host: 'localhost',
      port: 8545,
      network_id: 4,
      gas: 4000000,
      gasPrice: 20000000000,
      from: '0x39c026669c7d45ace7f8c7c270c1ce2ed6477ce4'
    },
    live: {
      network_id: 1,
      host: 'localhost',
      port: 8546,   // Different than the default testnet ports
      gasPrice: 20000000000,
      from: '0x2ccf2e37b2a2a3f42e647ADC16D37e8534b75d30'
    }
  }
}
