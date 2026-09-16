use anchor_lang::prelude::*;

use crate::constants::ASSET_CONFIG_SEED;
use crate::state::AssetConfig;

#[derive(Accounts)]
pub struct SetAgent<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [ASSET_CONFIG_SEED, asset_config.asset.as_ref()],
        bump,
        has_one = authority,
    )]
    pub asset_config: Account<'info, AssetConfig>,
}

pub fn handler(ctx: Context<SetAgent>, new_agent: Pubkey) -> Result<()> {
    let config = &mut ctx.accounts.asset_config;
    config.authorized_agent = new_agent;

    msg!(
        "Authorized agent updated to {} for asset {}",
        new_agent,
        config.asset
    );
    Ok(())
}
