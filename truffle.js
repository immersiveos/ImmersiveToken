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
    rinkeby: {
      host: 'localhost',
      port: 8545,
      network_id: 4
    },
    live: {
      network_id: 1,
      host: 'localhost',
      port: 8546,   // Different than the default test ports
      gasPrice: 1000000
    }
  }
}
