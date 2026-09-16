use anchor_lang::prelude::*;

use crate::constants::ASSET_CONFIG_SEED;
use crate::state::AssetConfig;

#[derive(Accounts)]
pub struct RegisterAsset<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = AssetConfig::LEN,
        seeds = [ASSET_CONFIG_SEED, asset.key().as_ref()],
        bump,
    )]
    pub asset_config: Account<'info, AssetConfig>,

    /// CHECK: The asset token mint — validated by the user
    pub asset: AccountInfo<'info>,

    /// CHECK: The Pyth price feed — validated by the user
    pub reference_feed: AccountInfo<'info>,

    /// CHECK: The Meteora pool — validated by the user
    pub pool_address: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<RegisterAsset>,
    deviation_threshold_bps: u16,
    max_trade_amount: u64,
    max_slippage_bps: u16,
    authorized_agent: Pubkey,
) -> Result<()> {
    let config = &mut ctx.accounts.asset_config;
    config.authority = ctx.accounts.authority.key();
    config.asset = ctx.accounts.asset.key();
    config.reference_feed = ctx.accounts.reference_feed.key();
    config.deviation_threshold_bps = deviation_threshold_bps;
    config.max_trade_amount = max_trade_amount;
    config.max_slippage_bps = max_slippage_bps;
    config.authorized_agent = authorized_agent;
    config.pool_address = ctx.accounts.pool_address.key();
    config.active = true;

    msg!(
        "Asset registered: {} with threshold {} bps",
        config.asset,
        config.deviation_threshold_bps
    );
    Ok(())
}
