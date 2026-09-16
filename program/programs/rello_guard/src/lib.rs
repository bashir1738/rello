pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("EbR22rNs4fWi6zKjJNVhKDiD8axopWUWmb66saFLFx1N");

#[program]
pub mod rello_guard {
    use super::*;

    pub fn register_asset(
        ctx: Context<RegisterAsset>,
        deviation_threshold_bps: u16,
        max_trade_amount: u64,
        max_slippage_bps: u16,
        authorized_agent: Pubkey,
    ) -> Result<()> {
        instructions::register_asset::handler(
            ctx,
            deviation_threshold_bps,
            max_trade_amount,
            max_slippage_bps,
            authorized_agent,
        )
    }

    pub fn set_threshold(
        ctx: Context<SetThreshold>,
        new_threshold_bps: u16,
    ) -> Result<()> {
        instructions::set_threshold::handler(ctx, new_threshold_bps)
    }

    pub fn set_max_trade(
        ctx: Context<SetMaxTrade>,
        max_trade_amount: u64,
        max_slippage_bps: u16,
    ) -> Result<()> {
        instructions::set_max_trade::handler(ctx, max_trade_amount, max_slippage_bps)
    }

    pub fn set_agent(
        ctx: Context<SetAgent>,
        new_agent: Pubkey,
    ) -> Result<()> {
        instructions::set_agent::handler(ctx, new_agent)
    }

    pub fn check_and_authorize(
        ctx: Context<CheckAndAuthorize>,
        proposed_asset: Pubkey,
        proposed_deviation_bps: u16,
        proposed_trade_amount: u64,
    ) -> Result<()> {
        instructions::check_and_authorize::handler(
            ctx,
            proposed_asset,
            proposed_deviation_bps,
            proposed_trade_amount,
        )
    }

    pub fn record_event(
        ctx: Context<RecordEvent>,
        asset: Pubkey,
        reference_price: u64,
        market_price: u64,
        deviation_bps: u16,
        trade_amount: u64,
    ) -> Result<()> {
        instructions::record_event::handler(
            ctx,
            asset,
            reference_price,
            market_price,
            deviation_bps,
            trade_amount,
        )
    }
}
