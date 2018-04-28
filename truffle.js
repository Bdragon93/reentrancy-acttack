module.exports = {
  networks: {
    //development: {
      //host: 'localhost',
      //port: 8545,
      //network_id: '*', // Match any network id
    //},
    rinkeby: {
      host: 'localhost', // Connect to geth on the specified
      port: 8545,
      from: '0x0111e4e2A5f8A4a600C1d5b44ff86FE5f18A28b4', // default address to use for any transaction                                                                                                           //Truffle makes during migrations
      network_id: 4,
      gas: 4612388, // Gas limit used for deploys
    },
    //private_net: {
      //host: 'localhost', // Connect to geth on the specified
      //port: 8545,
      //from: '0x26F96F8c704a79fa4A2712960461966758352091', // default address to use for any transaction                                                                                                            // Truffle makes during migrations
      //network_id: 15,
      //gas: 2100000, // Gas limit used for deploys
    //},
  },
};
