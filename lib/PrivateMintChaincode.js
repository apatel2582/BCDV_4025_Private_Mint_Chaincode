// private-mint-network/lib/PrivateMintChaincode.js

"use strict";

const { Contract } = require("fabric-contract-api");

class PrivateMintChaincode extends Contract {
  async initLedger(ctx) {
    console.info("Chaincode Initialization");
    const wallets = [
      {
        userId: "user1",
        fakeUSD: "1000",
        pmCoin: "50",
      },
      {
        userId: "user2",
        fakeUSD: "1500",
        pmCoin: "75",
      },
      {
        userId: "bank",
        fakeUSD: "10000000",
        pmCoin: "5000",
      },
      {
        userId: "mint",
        fakeUSD: "0",
        pmCoin: "10000000",
      },
    ];

    for (const wallet of wallets) {
      await this.upsertWallet(
        ctx,
        wallet.userId,
        wallet.fakeUSD,
        wallet.pmCoin
      );
      console.info(`Wallet for ${wallet.userId} initialized`);
    }
  }

  // Create or update a user wallet
  async upsertWallet(ctx, userId, fakeUSD = "0", pmCoin = "0") {
    const wallet = {
      docType: "wallet",
      fakeUSD,
      pmCoin,
    };

    await ctx.stub.putState(userId, Buffer.from(JSON.stringify(wallet)));
    return JSON.stringify(wallet);
  }

  // Retrieve a user wallet
  async getWallet(ctx, userId) {
    const walletAsBytes = await ctx.stub.getState(userId);
    if (!walletAsBytes || walletAsBytes.length === 0) {
      throw new Error(`The wallet ${userId} does not exist`);
    }
    console.log(walletAsBytes.toString());
    return walletAsBytes.toString();
  }

  // "Cheat" add FakeUSD to a wallet, pending approval
  async cheatAddFakeUSD(ctx, userId, amount) {
    const walletAsBytes = await ctx.stub.getState(userId);
    const wallet = JSON.parse(walletAsBytes.toString());

    wallet.fakeUSD = (parseInt(wallet.fakeUSD) + parseInt(amount)).toString();

    await ctx.stub.putState(userId, Buffer.from(JSON.stringify(wallet)));
    return JSON.stringify(wallet);
  }

  // Transfer FakeUSD from one user to another
  async transferFakeUSD(ctx, fromUserId, toUserId, amount) {
    const fromWalletAsBytes = await ctx.stub.getState(fromUserId);
    const fromWallet = JSON.parse(fromWalletAsBytes.toString());

    const toWalletAsBytes = await ctx.stub.getState(toUserId);
    const toWallet = JSON.parse(toWalletAsBytes.toString());

    fromWallet.fakeUSD = (
      parseInt(fromWallet.fakeUSD) - parseInt(amount)
    ).toString();
    toWallet.fakeUSD = (
      parseInt(toWallet.fakeUSD) + parseInt(amount)
    ).toString();

    await ctx.stub.putState(
      fromUserId,
      Buffer.from(JSON.stringify(fromWallet))
    );
    await ctx.stub.putState(toUserId, Buffer.from(JSON.stringify(toWallet)));

    return JSON.stringify({ fromWallet, toWallet });
  }

  // Purchase PM Coin using FakeUSD
  async purchasePMCoin(ctx, userId, pmCoinAmount) {
    const walletAsBytes = await ctx.stub.getState(userId);
    const wallet = JSON.parse(walletAsBytes.toString());
    const cost = parseInt(pmCoinAmount) * 1; // Assuming 1 FakeUSD = 1 PM Coin for simplicity

    if (parseInt(wallet.fakeUSD) < cost) {
      throw new Error("Insufficient FakeUSD balance");
    }

    wallet.fakeUSD = (parseInt(wallet.fakeUSD) - cost).toString();
    wallet.pmCoin = (
      parseInt(wallet.pmCoin) + parseInt(pmCoinAmount)
    ).toString();

    await ctx.stub.putState(userId, Buffer.from(JSON.stringify(wallet)));
    return JSON.stringify(wallet);
  }
}

module.exports = PrivateMintChaincode;
