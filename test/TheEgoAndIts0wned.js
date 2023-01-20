/* global expect web3 */

const TheEgoAndIts0wned = artifacts.require("TheEgoAndIts0wned");

const NUM_TOKENS = web3.utils.toBN(32);

contract("TheEgoAndIts0wned", (accounts) => {
  const owner = accounts[0];
  const other = accounts[1];

  it("Should initialize contract state correctly", async function () {
    const teai0 = await TheEgoAndIts0wned.deployed();
    const num_tokens = await teai0.NUM_TOKENS();

    expect(num_tokens.eq(NUM_TOKENS)).to.be.true;
    expect(await teai0.name()).to.equal("The Ego, and It's 0wned");
    expect(await teai0.symbol()).to.equal("TEAI0");
    
    expect(num_tokens.eq(await teai0.balanceOf(owner))).to.be.true;
  });

  it("Should allow owner to transfer", async function () {
    const teai0 = await TheEgoAndIts0wned.deployed();
    const num_tokens = await teai0.NUM_TOKENS();
    
    for (let i = 1; i <= num_tokens; i++) {
      await teai0.transferFrom(owner, other, i);
      expect(await teai0.ownerOf(i))
        .to.equal(other);
    }

    for (let i = 1; i <= num_tokens; i++) {
      await teai0
        .transferFrom(other, owner, i, { from: other });
      expect(await teai0.ownerOf(i))
        .to.equal(owner);
    }
  });

  it("Should not allow non-owner to transfer", async function () {
    const teai0 = await TheEgoAndIts0wned.deployed();
    const num_tokens = await teai0.NUM_TOKENS();

    for (let i = 1; i <= num_tokens; i++) {
      try {
        await teai0.transferFrom(
          owner,
          other,
          i,
          { from: other }
        );
        expect.fail("Should fail! Caller is not token owner nor approved.");
      } catch (error) {
        expect(error.data.reason)
          .to.equal("ERC721: caller is not token owner or approved");
      }
    }
  });

  it("token URLs can be updated", async () => {
    const teai0 = await TheEgoAndIts0wned.deployed();
    await teai0.setBaseUri("aaa://newurl/");
    assert.equal(await teai0.tokenURI(3), "aaa://newurl/3");
  });

  it("only owner can set token URLs", async () => {
    const teai0 = await TheEgoAndIts0wned.deployed();
    try {
      await teai0.setBaseUri("aaa://newerurl/", { from: accounts[2] });
      assert(false, "token should throw if non-owner tries to set base URL");
    } catch (error) {
      // Test passed
    }
  });

});
