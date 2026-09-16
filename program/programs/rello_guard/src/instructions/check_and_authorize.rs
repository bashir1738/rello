use anchor_lang::prelude::*;

use crate::constants::ASSET_CONFIG_SEED;
use crate::error::RelloError;
use crate::state::AssetConfig;

#[derive(Accounts)]
pub struct CheckAndAuthorize<'info> {
    pub agent: Signer<'info>,

    #[account(
        seeds = [ASSET_CONFIG_SEED, asset_config.asset.as_ref()],
        bump,
    )]
    pub asset_config: Account<'info, AssetConfig>,
}

pub(crate) fn handler(
    ctx: Context<CheckAndAuthorize>,
    proposed_asset: Pubkey,
    proposed_deviation_bps: u16,
    proposed_trade_amount: u64,
) -> Result<()> {
    let config = &ctx.accounts.asset_config;

    require!(config.active, RelloError::AssetNotActive);

    require!(
        ctx.accounts.agent.key() == config.authorized_agent,
        RelloError::UnauthorizedAgent
    );

    require!(
        proposed_asset == config.asset,
        RelloError::InvalidAsset
    );

    require!(
        proposed_deviation_bps >= config.deviation_threshold_bps,
        RelloError::DeviationBelowThreshold
    );

    require!(
        proposed_trade_amount <= config.max_trade_amount,
        RelloError::TradeExceedsMaximum
    );

    msg!(
        "Authorization PASSED for asset {} — deviation {} bps, trade {}",
        proposed_asset,
        proposed_deviation_bps,
        proposed_trade_amount
    );

    Ok(())
}
