import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
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
      .registerAsset(
        asset.publicKey,
        referenceFeed.publicKey,
        50,
        new anchor.BN(1000),
        50,
        agent.publicKey
      )
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
      .setMaxTrade(new anchor.BN(2000), 100)
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
      .checkAndAuthorize(asset.publicKey, 100, new anchor.BN(500))
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
        .checkAndAuthorize(asset.publicKey, 100, new anchor.BN(500))
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
        .checkAndAuthorize(asset.publicKey, 10, new anchor.BN(500))
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
        .checkAndAuthorize(asset.publicKey, 100, new anchor.BN(99999))
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

  it("Emits CorrectionEvent", async () => {
    const tx = await program.methods
      .recordEvent(
        asset.publicKey,
        new anchor.BN(189840000),
        new anchor.BN(187520000),
        123,
        new anchor.BN(500)
      )
      .accounts({
        agent: authority.publicKey,
      })
      .rpc();

    console.log("Record event tx:", tx);
  });
});
