use anchor_lang::prelude::*;

#[error_code]
pub enum RelloError {
    #[msg("Unauthorized agent signer")]
    UnauthorizedAgent,

    #[msg("Asset configuration is not active")]
    AssetNotActive,

    #[msg("Deviation is below the configured threshold")]
    DeviationBelowThreshold,

    #[msg("Trade amount exceeds the configured maximum")]
    TradeExceedsMaximum,

    #[msg("Slippage exceeds the configured maximum")]
    SlippageExceedsMaximum,

    #[msg("Pool address does not match the configured pool")]
    InvalidPool,

    #[msg("Asset pubkey does not match the configured asset")]
    InvalidAsset,

    #[msg("Reference feed does not match the configured feed")]
    InvalidFeed,
}
