const { Gateway, Wallets } = require("fabric-network");
const {
  CONTRACT_NAME,
  CHANNEL_NAME,
  walletPath,
  identity,
} = require("../config.json");
const { buildCCPOrg1, buildWallet } = require("./AppUtil");

async function initializeHyperledgerNetwork(app) {
  try {
    const ccp = buildCCPOrg1();
    const wallet = await buildWallet(Wallets, walletPath);
    gateway = new Gateway();
    network = await gateway.connect(ccp, {
      wallet,
      identity,
      discovery: { enabled: true, asLocalhost: false },
    });
  } catch (error) {
    console.log(error);
    app.log.error(`Error initializing Hyperledger network: ${error}`);
  }
}

async function initializeHyperledgerContract() {
  try {
    network = await gateway.getNetwork(CHANNEL_NAME);
    contract = network.getContract(CONTRACT_NAME);
    networkConnections[CONTRACT_NAME] = contract;
    return contract;
  } catch (error) {
    console.log(error);
    app.log.error(`Error initializing Hyperledger contract: ${error}`);
  }
}

const networkConnections = {};
async function getActorConnection() {
  if (!networkConnections[CHANNEL_NAME]) {
    return await initializeHyperledgerContract();
  }
  return networkConnections[CONTRACT_NAME];
}

module.exports = {
  getActorConnection,
  initializeHyperledgerNetwork,
};
