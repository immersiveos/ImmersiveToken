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
    testnet: {
      host: 'localhost',
      port: 8545,
      network_id: 3,
      from: '0xeBA8e033aE04CF7B4fC9CFc3109e333692d3fb42' // default account for deployment
    },
    live: {
      network_id: 1,
      host: 'localhost',
      port: 8546,   // Different than the default test ports
      gasPrice: 1000000,
      from: '[coming soon]' // default account for deployment
    }
  }
}
