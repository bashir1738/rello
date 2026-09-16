use anchor_lang::prelude::*;

use crate::constants::ASSET_CONFIG_SEED;
use crate::state::AssetConfig;

#[derive(Accounts)]
pub struct SetThreshold<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [ASSET_CONFIG_SEED, asset_config.asset.as_ref()],
        bump,
        has_one = authority,
    )]
    pub asset_config: Account<'info, AssetConfig>,
}

pub(crate) fn handler(ctx: Context<SetThreshold>, new_threshold_bps: u16) -> Result<()> {
    let config = &mut ctx.accounts.asset_config;
    config.deviation_threshold_bps = new_threshold_bps;

    msg!(
        "Threshold updated to {} bps for asset {}",
        new_threshold_bps,
        config.asset
    );
    Ok(())
}
