use anchor_lang::prelude::*;

use crate::state::CorrectionEvent;

#[derive(Accounts)]
pub struct RecordEvent<'info> {
    /// CHECK: The agent recording the event
    pub agent: Signer<'info>,
}

pub fn handler(
    _ctx: Context<RecordEvent>,
    asset: Pubkey,
    reference_price: u64,
    market_price: u64,
    deviation_bps: u16,
    trade_amount: u64,
) -> Result<()> {
    let timestamp = Clock::get()?.unix_timestamp;

    emit!(CorrectionEvent {
        asset,
        reference_price,
        market_price,
        deviation_bps,
        trade_amount,
        timestamp,
    });

    msg!(
        "CorrectionEvent emitted: asset={}, deviation={} bps, trade={}",
        asset,
        deviation_bps,
        trade_amount
    );

    Ok(())
}
