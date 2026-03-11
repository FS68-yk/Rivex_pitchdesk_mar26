const { connectLambda, getStore } = require("@netlify/blobs");

const STORE_NAME = "rivex-admin";

function initBlobs(event) {
  if (event && event.blobs) {
    connectLambda(event);
  }
}

function getAdminStore(event) {
  initBlobs(event);
  return getStore(STORE_NAME);
}

module.exports = {
  getAdminStore,
};
