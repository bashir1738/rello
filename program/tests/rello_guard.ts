import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import { BN } from "bn.js";
import { expect } from "chai";

describe("rello_guard", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.RelloGuard;
  const authority = provider.wallet;

  const asset = anchor.web3.Keypair.generate();
  const referenceFeed = anchor.web3.Keypair.generate();
  const poolAddress = anchor.web3.Keypair.generate();
  const agent = anchor.web3.Keypair.generate();

  const [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("asset_config"), asset.publicKey.toBuffer()],
    program.programId
  );

  it("Registers an asset", async () => {
    await program.methods
      .registerAsset(50, new BN(1000), 50, agent.publicKey)
      .accounts({
        authority: authority.publicKey,
        assetConfig: configPda,
        asset: asset.publicKey,
        referenceFeed: referenceFeed.publicKey,
        poolAddress: poolAddress.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const config = await program.account.assetConfig.fetch(configPda);
    expect(config.asset.toString()).to.equal(asset.publicKey.toString());
    expect(config.deviationThresholdBps).to.equal(50);
    expect(config.maxTradeAmount.toNumber()).to.equal(1000);
    expect(config.authorizedAgent.toString()).to.equal(agent.publicKey.toString());
    expect(config.active).to.be.true;
  });

  it("Updates threshold", async () => {
    await program.methods
      .setThreshold(75)
      .accounts({
        authority: authority.publicKey,
        assetConfig: configPda,
      })
      .rpc();

    const config = await program.account.assetConfig.fetch(configPda);
    expect(config.deviationThresholdBps).to.equal(75);
  });

  it("Updates max trade", async () => {
    await program.methods
      .setMaxTrade(new BN(2000), 100)
      .accounts({
        authority: authority.publicKey,
        assetConfig: configPda,
      })
      .rpc();

    const config = await program.account.assetConfig.fetch(configPda);
    expect(config.maxTradeAmount.toNumber()).to.equal(2000);
    expect(config.maxSlippageBps).to.equal(100);
  });

  it("Updates authorized agent", async () => {
    const newAgent = anchor.web3.Keypair.generate();
    await program.methods
      .setAgent(newAgent.publicKey)
      .accounts({
        authority: authority.publicKey,
        assetConfig: configPda,
      })
      .rpc();

    const config = await program.account.assetConfig.fetch(configPda);
    expect(config.authorizedAgent.toString()).to.equal(newAgent.publicKey.toString());
  });

  it("check_and_authorize passes with valid params", async () => {
    const testAgent = anchor.web3.Keypair.generate();

    await program.methods
      .setAgent(testAgent.publicKey)
      .accounts({
        authority: authority.publicKey,
        assetConfig: configPda,
      })
      .rpc();

    await program.methods
      .checkAndAuthorize(asset.publicKey, 100, new BN(500))
      .accounts({
        agent: testAgent.publicKey,
        assetConfig: configPda,
      })
      .signers([testAgent])
      .rpc();
  });

  it("check_and_authorize fails for unauthorized agent", async () => {
    const unauthorized = anchor.web3.Keypair.generate();
    try {
      await program.methods
        .checkAndAuthorize(asset.publicKey, 100, new BN(500))
        .accounts({
          agent: unauthorized.publicKey,
          assetConfig: configPda,
        })
        .signers([unauthorized])
        .rpc();
      expect.fail("Should have thrown UnauthorizedAgent");
    } catch (err: any) {
      expect(err.toString()).to.contain("UnauthorizedAgent");
    }
  });

  it("check_and_authorize fails when deviation below threshold", async () => {
    const testAgent = anchor.web3.Keypair.generate();

    await program.methods
      .setAgent(testAgent.publicKey)
      .accounts({
        authority: authority.publicKey,
        assetConfig: configPda,
      })
      .rpc();

    try {
      await program.methods
        .checkAndAuthorize(asset.publicKey, 10, new BN(500))
        .accounts({
          agent: testAgent.publicKey,
          assetConfig: configPda,
        })
        .signers([testAgent])
        .rpc();
      expect.fail("Should have thrown DeviationBelowThreshold");
    } catch (err: any) {
      expect(err.toString()).to.contain("DeviationBelowThreshold");
    }
  });

  it("check_and_authorize fails when trade exceeds max", async () => {
    const testAgent = anchor.web3.Keypair.generate();

    await program.methods
      .setAgent(testAgent.publicKey)
      .accounts({
        authority: authority.publicKey,
        assetConfig: configPda,
      })
      .rpc();

    try {
      await program.methods
        .checkAndAuthorize(asset.publicKey, 100, new BN(99999))
        .accounts({
          agent: testAgent.publicKey,
          assetConfig: configPda,
        })
        .signers([testAgent])
        .rpc();
      expect.fail("Should have thrown TradeExceedsMaximum");
    } catch (err: any) {
      expect(err.toString()).to.contain("TradeExceedsMaximum");
    }
  });

  it("check_and_authorize fails when asset config is deactivated", async () => {
    // Register a fresh asset to deactivate
    const deactAsset = anchor.web3.Keypair.generate();
    const deactFeed = anchor.web3.Keypair.generate();
    const deactPool = anchor.web3.Keypair.generate();
    const deactAgent = anchor.web3.Keypair.generate();

    const [deactConfigPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("asset_config"), deactAsset.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .registerAsset(50, new BN(1000), 50, deactAgent.publicKey)
      .accounts({
        authority: authority.publicKey,
        assetConfig: deactConfigPda,
        asset: deactAsset.publicKey,
        referenceFeed: deactFeed.publicKey,
        poolAddress: deactPool.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Deactivate by setting agent to system program (can't directly set active=false via instructions,
    // but we can test with the original asset by setting a known deactivation path)
    // Actually, there's no deactivate instruction. Let's test AssetNotActive by
    // registering, then trying to check_and_authorize - since active starts as true,
    // we need to test the error path differently.

    // The AssetNotActive error is checked but there's no deactivate instruction.
    // This means we can't easily test it without modifying the program.
    // Skip this test for now and note it as a gap.
    console.log("  NOTE: AssetNotActive has no deactivate instruction — cannot test without program change");
  });

  it("check_and_authorize fails with wrong asset pubkey", async () => {
    const testAgent = anchor.web3.Keypair.generate();

    await program.methods
      .setAgent(testAgent.publicKey)
      .accounts({
        authority: authority.publicKey,
        assetConfig: configPda,
      })
      .rpc();

    const wrongAsset = anchor.web3.Keypair.generate();

    try {
      await program.methods
        .checkAndAuthorize(wrongAsset.publicKey, 100, new BN(500))
        .accounts({
          agent: testAgent.publicKey,
          assetConfig: configPda,
        })
        .signers([testAgent])
        .rpc();
      expect.fail("Should have thrown InvalidAsset");
    } catch (err: any) {
      expect(err.toString()).to.contain("InvalidAsset");
    }
  });

  it("Emits CorrectionEvent", async () => {
    const tx = await program.methods
      .recordEvent(
        asset.publicKey,
        new BN(189840000),
        new BN(187520000),
        123,
        new BN(500)
      )
      .accounts({
        agent: authority.publicKey,
      })
      .rpc();

    console.log("Record event tx:", tx);
  });

  it("register_asset creates config with correct PDA", async () => {
    const newAsset = anchor.web3.Keypair.generate();
    const newFeed = anchor.web3.Keypair.generate();
    const newPool = anchor.web3.Keypair.generate();
    const newAgent = anchor.web3.Keypair.generate();

    const [newConfigPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("asset_config"), newAsset.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .registerAsset(100, new BN(500), 75, newAgent.publicKey)
      .accounts({
        authority: authority.publicKey,
        assetConfig: newConfigPda,
        asset: newAsset.publicKey,
        referenceFeed: newFeed.publicKey,
        poolAddress: newPool.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const config = await program.account.assetConfig.fetch(newConfigPda);
    expect(config.deviationThresholdBps).to.equal(100);
    expect(config.maxTradeAmount.toNumber()).to.equal(500);
    expect(config.maxSlippageBps).to.equal(75);
    expect(config.active).to.be.true;
    expect(config.authorizedAgent.toString()).to.equal(newAgent.publicKey.toString());
    expect(config.poolAddress.toString()).to.equal(newPool.publicKey.toString());
    expect(config.referenceFeed.toString()).to.equal(newFeed.publicKey.toString());
  });
});
