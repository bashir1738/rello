use anchor_lang::prelude::*;

#[account]
pub struct AssetConfig {
    pub authority: Pubkey,
    pub asset: Pubkey,
    pub reference_feed: Pubkey,
    pub deviation_threshold_bps: u16,
    pub max_trade_amount: u64,
    pub max_slippage_bps: u16,
    pub authorized_agent: Pubkey,
    pub pool_address: Pubkey,
    pub active: bool,
}

impl AssetConfig {
    pub const LEN: usize = 8
        + 32  // authority
        + 32  // asset
        + 32  // reference_feed
        + 2   // deviation_threshold_bps
        + 8   // max_trade_amount
        + 2   // max_slippage_bps
        + 32  // authorized_agent
        + 32  // pool_address
        + 1;  // active
}

#[event]
pub struct CorrectionEvent {
    pub asset: Pubkey,
    pub reference_price: u64,
    pub market_price: u64,
    pub deviation_bps: u16,
    pub trade_amount: u64,
    pub timestamp: i64,
}
