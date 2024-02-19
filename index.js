// private-mint-network/index.js

"use strict";

const privateMintChaincode = require("./lib/PrivateMintChaincode");

module.exports.privateMintChaincode = privateMintChaincode;
module.exports.contracts = [privateMintChaincode];
