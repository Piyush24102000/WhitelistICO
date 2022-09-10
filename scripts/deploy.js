require("dotenv").config({ path: ".env" });

const hre = require("hardhat");
const { contractaddress } = require("../constants");

async function main() {
  const contractAddress = contractaddress;

  const Lock = await hre.ethers.getContractFactory("techbulltoken");
  const lock = await Lock.deploy(contractAddress);

  await lock.deployed();

  console.log(" 1 ETH deployed to:", lock.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
