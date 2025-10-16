use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Burn, Mint, Token, TokenAccount, Transfer},
};

declare_id!("EGatesVote111111111111111111111111111111111");

// Magic Eden $ME token mint address
pub const ME_MINT: Pubkey = pubkey!("MEFNBXixkEbait3xn9bkm8WsJzXtVsaJEn4c8Sam21u");

// Edens Gates rewards wallet pubkey  
pub const REWARDS_OWNER: Pubkey = pubkey!("8rjP7XVxt1eVioDJoLSMMBnse1QAo9SCkoYmVN3t8KAE");

#[program]
pub mod edens_gates {
    use super::*;

    /// Charge exactly 0.5 $ME per vote: burn 50% and transfer 50% to rewards wallet
    pub fn vote_with_fee(ctx: Context<VoteWithFee>, founder_uuid: [u8; 16]) -> Result<()> {
        let me_mint = &ctx.accounts.me_mint;
        
        // Compute fee using mint decimals: 0.5 $ME = 0.5 * 10^decimals
        let decimals = me_mint.decimals as u32;
        let fee_total = 5 * 10_u64.pow(decimals - 1);
        let burn_amount = fee_total / 2;  // 50% burned
        let reward_amount = fee_total / 2; // 50% to rewards
        
        // Validate sufficient balance
        require!(
            ctx.accounts.payer_me_ata.amount >= fee_total,
            VoteError::InsufficientFunds
        );

        // CPI #1: Burn 50% of fee
        let burn_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.me_mint.to_account_info(),
                from: ctx.accounts.payer_me_ata.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        );
        token::burn(burn_ctx, burn_amount)?;

        // CPI #2: Transfer 50% of fee to rewards wallet
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.payer_me_ata.to_account_info(),
                to: ctx.accounts.rewards_ata.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, reward_amount)?;

        // Emit vote charged event
        emit!(VoteCharged {
            voter: ctx.accounts.payer.key(),
            founder_uuid,
            fee: fee_total,
            burn: burn_amount,
            reward: reward_amount,
        });

        msg!(
            "Vote charged: voter={}, fee={}, burned={}, reward={}",
            ctx.accounts.payer.key(),
            fee_total,
            burn_amount,
            reward_amount
        );

        Ok(())
    }
}

#[derive(Accounts)]
pub struct VoteWithFee<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        associated_token::mint = me_mint,
        associated_token::authority = payer
    )]
    pub payer_me_ata: Account<'info, TokenAccount>,

    #[account(
        constraint = me_mint.key() == ME_MINT @ VoteError::InvalidMint
    )]
    pub me_mint: Account<'info, Mint>,

    #[account(
        constraint = rewards_owner.key() == REWARDS_OWNER @ VoteError::InvalidOwner
    )]
    /// CHECK: Verified against REWARDS_OWNER constant
    pub rewards_owner: AccountInfo<'info>,

    #[account(
        mut,
        associated_token::mint = me_mint,
        associated_token::authority = rewards_owner
    )]
    pub rewards_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct VoteCharged {
    pub voter: Pubkey,
    pub founder_uuid: [u8; 16],
    pub fee: u64,
    pub burn: u64,
    pub reward: u64,
}

#[error_code]
pub enum VoteError {
    #[msg("Invalid $ME mint address")]
    InvalidMint,
    #[msg("Invalid rewards owner")]
    InvalidOwner,
    #[msg("Insufficient $ME tokens to pay vote fee")]
    InsufficientFunds,
    #[msg("Wrong amount calculated")]
    WrongAmount,
}