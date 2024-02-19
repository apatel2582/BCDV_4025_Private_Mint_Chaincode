#!/bin/bash

# Navigate to the network directory
cd fabric-samples/private-mint-network

# Step 1: Generate Cryptographic Material
cryptogen generate --config=./crypto-config.yaml --output="organizations"

# Step 2: Create Channel Artifacts
export FABRIC_CFG_PATH=$PWD/configtx
configtxgen -profile TwoOrgsOrdererGenesis -outputBlock ./channel-artifacts/genesis.block
configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID mychannel

# Step 3: Start the Network
docker-compose up -d

# Wait for the network to start
sleep 10

# Step 4: Creating and Joining the Channel
# Assuming you have a CLI container configured in docker-compose.yaml
docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/channel.tx --outputBlock ./channel-artifacts/mychannel.block
docker exec cli peer channel join -b ./channel-artifacts/mychannel.block

echo "Network setup complete"
