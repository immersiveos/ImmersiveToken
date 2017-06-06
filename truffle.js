// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: 5
    },
    rinkeby: {
      host: 'localhost',
      port: 8545,
      network_id: 4
      // optional config values:
      // gas
      // gasPrice
      // from - default address to use for any transaction Truffle makes during migrations
      // provider - web3 provider instance Truffle should use to talk to the Ethereum network.
      //          - if specified, host and port are ignored.
    },
    live: {
      network_id: 1,
      host: 'localhost',
      port: 8546,   // Different than the default test ports
      gasPrice: 1000000
    }
  }
}
