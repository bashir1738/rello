use anchor_lang::prelude::*;

use crate::constants::ASSET_CONFIG_SEED;
use crate::state::AssetConfig;

#[derive(Accounts)]
pub struct SetMaxTrade<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [ASSET_CONFIG_SEED, asset_config.asset.as_ref()],
        bump,
        has_one = authority,
    )]
    pub asset_config: Account<'info, AssetConfig>,
}

pub(crate) fn handler(
    ctx: Context<SetMaxTrade>,
    max_trade_amount: u64,
    max_slippage_bps: u16,
) -> Result<()> {
    let config = &mut ctx.accounts.asset_config;
    config.max_trade_amount = max_trade_amount;
    config.max_slippage_bps = max_slippage_bps;

    msg!(
        "Max trade updated: {} tokens, {} bps slippage for asset {}",
        max_trade_amount,
        max_slippage_bps,
        config.asset
    );
    Ok(())
}
