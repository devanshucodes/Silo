use anchor_lang::prelude::*;

declare_id!("3jWtWxyk583wshR9sPRwbcUQXY6QxkaWgEHUScj4hrGX");

#[program]
pub mod silo_firewall {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, oracle_authority: Pubkey) -> Result<()> {
        let config = &mut ctx.accounts.global_config;
        config.authority = ctx.accounts.authority.key();
        config.oracle_authority = oracle_authority;
        config.total_agents = 0;
        config.total_actions = 0;
        config.total_blocked = 0;
        config.paused = false;
        config.bump = ctx.bumps.global_config;
        Ok(())
    }

    pub fn register_agent(
        ctx: Context<RegisterAgent>,
        agent_id: String,
        max_strikes: u8,
    ) -> Result<()> {
        require!(agent_id.len() >= 1 && agent_id.len() <= 32, SiloError::AgentIdTooLong);
        require!(
            agent_id.chars().all(|c| c.is_alphanumeric() || c == '-'),
            SiloError::AgentIdInvalid
        );
        require!(max_strikes >= 1 && max_strikes <= 10, SiloError::InvalidMaxStrikes);
        require!(!ctx.accounts.global_config.paused, SiloError::ProgramPaused);

        let mut padded_id = [0u8; 32];
        let id_bytes = agent_id.as_bytes();
        padded_id[..id_bytes.len()].copy_from_slice(id_bytes);

        let record = &mut ctx.accounts.agent_record;
        record.owner = ctx.accounts.owner.key();
        record.agent_id = padded_id;
        record.trust_score = 80_000;
        record.strikes = 0;
        record.max_strikes = max_strikes;
        record.frozen = false;
        record.registered_at = Clock::get()?.unix_timestamp;
        record.last_action_at = 0;
        record.action_nonce = 0;
        record.total_actions = 0;
        record.total_approved = 0;
        record.total_blocked = 0;
        record.total_escalated = 0;
        record.bump = ctx.bumps.agent_record;

        ctx.accounts.global_config.total_agents += 1;
        Ok(())
    }

    pub fn queue_action(
        ctx: Context<QueueAction>,
        payload_hash: [u8; 32],
        relay_key: String,
        target_program: Pubkey,
        lamports: u64,
        sim_accounts_touched: u8,
    ) -> Result<()> {
        require!(
            ctx.accounts.agent_record.owner == ctx.accounts.owner.key(),
            SiloError::Unauthorized
        );
        require!(!ctx.accounts.agent_record.frozen, SiloError::AgentFrozen);
        require!(
            ctx.accounts.agent_record.strikes < ctx.accounts.agent_record.max_strikes,
            SiloError::TooManyStrikes
        );
        require!(relay_key.len() <= 64, SiloError::RelayKeyTooLong);
        require!(!ctx.accounts.global_config.paused, SiloError::ProgramPaused);

        let action_nonce = ctx.accounts.agent_record.action_nonce;
        let timestamp = Clock::get()?.unix_timestamp;

        let record = &mut ctx.accounts.action_record;
        record.agent = ctx.accounts.agent_record.key();
        record.owner = ctx.accounts.agent_record.owner;
        record.action_nonce = action_nonce;
        record.payload_hash = payload_hash;
        record.relay_key = relay_key.clone();
        record.target_program = target_program;
        record.lamports = lamports;
        record.sim_accounts_touched = sim_accounts_touched;
        record.status = ActionStatus::Queued;
        record.verdict = Verdict::Pending;
        record.threat_score = 0;
        record.reasoning_cid = String::new();
        record.created_at = timestamp;
        record.decided_at = 0;
        record.bump = ctx.bumps.action_record;

        ctx.accounts.agent_record.action_nonce += 1;
        ctx.accounts.agent_record.total_actions += 1;
        ctx.accounts.agent_record.last_action_at = timestamp;
        ctx.accounts.global_config.total_actions += 1;

        emit!(ActionQueued {
            agent: ctx.accounts.action_record.agent,
            owner: ctx.accounts.action_record.owner,
            action_nonce,
            payload_hash,
            relay_key,
            target_program,
            lamports,
            sim_accounts_touched,
            timestamp,
        });

        Ok(())
    }

    pub fn submit_verdict(
        ctx: Context<SubmitVerdict>,
        verdict: Verdict,
        threat_score: u32,
        reasoning_cid: String,
    ) -> Result<()> {
        require!(
            ctx.accounts.oracle_authority.key() == ctx.accounts.global_config.oracle_authority,
            SiloError::Unauthorized
        );
        require!(
            ctx.accounts.action_record.status == ActionStatus::Queued,
            SiloError::InvalidStatus
        );
        require!(threat_score <= 100_000, SiloError::InvalidScore);

        let timestamp = Clock::get()?.unix_timestamp;

        ctx.accounts.action_record.verdict = verdict.clone();
        ctx.accounts.action_record.threat_score = threat_score;
        ctx.accounts.action_record.reasoning_cid = reasoning_cid;
        ctx.accounts.action_record.decided_at = timestamp;
        ctx.accounts.action_record.status = ActionStatus::Decided;

        match verdict {
            Verdict::Approve => {
                ctx.accounts.agent_record.trust_score = ctx
                    .accounts
                    .agent_record
                    .trust_score
                    .saturating_add(50)
                    .min(100_000);
                ctx.accounts.agent_record.total_approved += 1;
            }
            Verdict::Block => {
                ctx.accounts.agent_record.trust_score =
                    ctx.accounts.agent_record.trust_score.saturating_sub(5_000);
                ctx.accounts.agent_record.strikes += 1;
                ctx.accounts.agent_record.total_blocked += 1;
                ctx.accounts.global_config.total_blocked += 1;
                if ctx.accounts.agent_record.strikes >= ctx.accounts.agent_record.max_strikes {
                    ctx.accounts.agent_record.frozen = true;
                    emit!(AgentFrozenEvent {
                        agent: ctx.accounts.agent_record.key(),
                        owner: ctx.accounts.agent_record.owner,
                        reason: FreezeReason::MaxStrikes,
                        timestamp,
                    });
                }
            }
            Verdict::Escalate => {
                ctx.accounts.agent_record.total_escalated += 1;
            }
            Verdict::Pending => {
                return err!(SiloError::InvalidVerdict);
            }
        }

        emit!(VerdictSubmitted {
            agent: ctx.accounts.agent_record.key(),
            action_nonce: ctx.accounts.action_record.action_nonce,
            verdict: ctx.accounts.action_record.verdict.clone(),
            threat_score,
            new_trust_score: ctx.accounts.agent_record.trust_score,
            reasoning_cid: ctx.accounts.action_record.reasoning_cid.clone(),
            timestamp,
        });

        Ok(())
    }

    pub fn resolve_escalation(ctx: Context<ResolveEscalation>, approved: bool) -> Result<()> {
        require!(
            ctx.accounts.action_record.verdict == Verdict::Escalate,
            SiloError::InvalidStatus
        );
        require!(
            ctx.accounts.action_record.status == ActionStatus::Decided,
            SiloError::InvalidStatus
        );

        if approved {
            ctx.accounts.action_record.status = ActionStatus::Executed;
            ctx.accounts.agent_record.trust_score = ctx
                .accounts
                .agent_record
                .trust_score
                .saturating_add(50)
                .min(100_000);
        } else {
            ctx.accounts.action_record.status = ActionStatus::Rejected;
            ctx.accounts.agent_record.strikes += 1;
            ctx.accounts.agent_record.total_blocked += 1;
            if ctx.accounts.agent_record.strikes >= ctx.accounts.agent_record.max_strikes {
                ctx.accounts.agent_record.frozen = true;
                emit!(AgentFrozenEvent {
                    agent: ctx.accounts.agent_record.key(),
                    owner: ctx.accounts.agent_record.owner,
                    reason: FreezeReason::MaxStrikes,
                    timestamp: Clock::get()?.unix_timestamp,
                });
            }
        }

        Ok(())
    }

    pub fn freeze_agent(ctx: Context<FreezeAgent>) -> Result<()> {
        ctx.accounts.agent_record.frozen = true;
        Ok(())
    }

    pub fn unfreeze_agent(ctx: Context<UnfreezeAgent>) -> Result<()> {
        ctx.accounts.agent_record.frozen = false;
        Ok(())
    }

    pub fn update_oracle_authority(
        ctx: Context<UpdateOracleAuthority>,
        new_authority: Pubkey,
    ) -> Result<()> {
        ctx.accounts.global_config.oracle_authority = new_authority;
        Ok(())
    }
}

// ─── Account Structs ─────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct GlobalConfig {
    pub authority: Pubkey,
    pub oracle_authority: Pubkey,
    pub total_agents: u64,
    pub total_actions: u64,
    pub total_blocked: u64,
    pub paused: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct AgentRecord {
    pub owner: Pubkey,
    pub agent_id: [u8; 32],
    pub trust_score: u32,
    pub strikes: u8,
    pub max_strikes: u8,
    pub frozen: bool,
    pub registered_at: i64,
    pub last_action_at: i64,
    pub action_nonce: u64,
    pub total_actions: u64,
    pub total_approved: u64,
    pub total_blocked: u64,
    pub total_escalated: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct ActionRecord {
    pub agent: Pubkey,
    pub owner: Pubkey,
    pub action_nonce: u64,
    pub payload_hash: [u8; 32],
    #[max_len(64)]
    pub relay_key: String,
    pub target_program: Pubkey,
    pub lamports: u64,
    pub sim_accounts_touched: u8,
    pub status: ActionStatus,
    pub verdict: Verdict,
    pub threat_score: u32,
    #[max_len(64)]
    pub reasoning_cid: String,
    pub created_at: i64,
    pub decided_at: i64,
    pub bump: u8,
}

// ─── Enums ────────────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, InitSpace)]
pub enum ActionStatus {
    Queued,
    Analyzing,
    Decided,
    Executed,
    Rejected,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, InitSpace)]
pub enum Verdict {
    Pending,
    Approve,
    Escalate,
    Block,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub enum FreezeReason {
    MaxStrikes,
    ManualFreeze,
}

// ─── Events ───────────────────────────────────────────────────────────────────

#[event]
pub struct ActionQueued {
    pub agent: Pubkey,
    pub owner: Pubkey,
    pub action_nonce: u64,
    pub payload_hash: [u8; 32],
    pub relay_key: String,
    pub target_program: Pubkey,
    pub lamports: u64,
    pub sim_accounts_touched: u8,
    pub timestamp: i64,
}

#[event]
pub struct VerdictSubmitted {
    pub agent: Pubkey,
    pub action_nonce: u64,
    pub verdict: Verdict,
    pub threat_score: u32,
    pub new_trust_score: u32,
    pub reasoning_cid: String,
    pub timestamp: i64,
}

#[event]
pub struct AgentFrozenEvent {
    pub agent: Pubkey,
    pub owner: Pubkey,
    pub reason: FreezeReason,
    pub timestamp: i64,
}

// ─── Errors ───────────────────────────────────────────────────────────────────

#[error_code]
pub enum SiloError {
    #[msg("Agent ID must be 1-32 characters")]
    AgentIdTooLong,
    #[msg("Agent ID: alphanumeric and hyphens only")]
    AgentIdInvalid,
    #[msg("max_strikes must be 1-10")]
    InvalidMaxStrikes,
    #[msg("Silo is globally paused")]
    ProgramPaused,
    #[msg("Not authorized")]
    Unauthorized,
    #[msg("Agent is frozen")]
    AgentFrozen,
    #[msg("Agent has exceeded max strikes")]
    TooManyStrikes,
    #[msg("Relay key must be 64 chars or less")]
    RelayKeyTooLong,
    #[msg("Action is not in expected status")]
    InvalidStatus,
    #[msg("Threat score must be 100,000 or less")]
    InvalidScore,
    #[msg("Invalid verdict value")]
    InvalidVerdict,
}

// ─── Account Validation Structs ───────────────────────────────────────────────

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + GlobalConfig::INIT_SPACE,
        seeds = [b"global_config"],
        bump
    )]
    pub global_config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(agent_id: String)]
pub struct RegisterAgent<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + AgentRecord::INIT_SPACE,
        seeds = [b"agent", owner.key().as_ref(), agent_id.as_bytes()],
        bump
    )]
    pub agent_record: Account<'info, AgentRecord>,
    #[account(mut, seeds = [b"global_config"], bump = global_config.bump)]
    pub global_config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct QueueAction<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + ActionRecord::INIT_SPACE,
        seeds = [b"action", agent_record.key().as_ref(), &agent_record.action_nonce.to_le_bytes()],
        bump
    )]
    pub action_record: Account<'info, ActionRecord>,
    #[account(
        mut,
        seeds = [b"agent", owner.key().as_ref(), &agent_record.agent_id],
        bump = agent_record.bump
    )]
    pub agent_record: Account<'info, AgentRecord>,
    #[account(mut, seeds = [b"global_config"], bump = global_config.bump)]
    pub global_config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitVerdict<'info> {
    #[account(
        mut,
        constraint = action_record.agent == agent_record.key() @ SiloError::Unauthorized
    )]
    pub action_record: Account<'info, ActionRecord>,
    #[account(mut)]
    pub agent_record: Account<'info, AgentRecord>,
    #[account(mut, seeds = [b"global_config"], bump = global_config.bump)]
    pub global_config: Account<'info, GlobalConfig>,
    pub oracle_authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResolveEscalation<'info> {
    #[account(
        mut,
        constraint = action_record.agent == agent_record.key() @ SiloError::Unauthorized,
        constraint = action_record.owner == owner.key() @ SiloError::Unauthorized
    )]
    pub action_record: Account<'info, ActionRecord>,
    #[account(mut)]
    pub agent_record: Account<'info, AgentRecord>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct FreezeAgent<'info> {
    #[account(
        mut,
        constraint = agent_record.owner == owner.key() @ SiloError::Unauthorized
    )]
    pub agent_record: Account<'info, AgentRecord>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct UnfreezeAgent<'info> {
    #[account(
        mut,
        constraint = agent_record.owner == owner.key() @ SiloError::Unauthorized
    )]
    pub agent_record: Account<'info, AgentRecord>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateOracleAuthority<'info> {
    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump,
        constraint = global_config.authority == authority.key() @ SiloError::Unauthorized
    )]
    pub global_config: Account<'info, GlobalConfig>,
    pub authority: Signer<'info>,
}
