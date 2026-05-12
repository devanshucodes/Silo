import { Connection, PublicKey, Transaction, VersionedTransaction, Keypair } from '@solana/web3.js';
import fetch from 'node-fetch';
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export interface SiloConfig {
  rpcUrl: string;
  relayUrl: string;
  relaySecret: string;
  agentId: string;
  agentOwner: Keypair;
  programId: PublicKey;
}

export interface ProtectParams {
  prompt: string;
  transaction: VersionedTransaction | Transaction;
  onEscalate?: (analysis: EscalateAnalysis) => Promise<boolean>;
}

export interface ProtectResult {
  status: 'approved' | 'blocked' | 'rejected';
  transaction?: VersionedTransaction | Transaction;
  reason?: string;
}

export interface EscalateAnalysis {
  threatScore: number;
  reasoning: string;
  targetProgram: string;
  lamports: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface AgentRecord {
  owner: PublicKey;
  agentId: string;
  trustScore: number;
  strikes: number;
  maxStrikes: number;
  frozen: boolean;
  registeredAt: number;
  lastActionAt: number;
  actionNonce: number;
  totalActions: number;
  totalApproved: number;
  totalBlocked: number;
  totalEscalated: number;
}

export interface ActionRecord {
  agent: PublicKey;
  owner: PublicKey;
  actionNonce: number;
  payloadHash: string;
  relayKey: string;
  targetProgram: PublicKey;
  lamports: number;
  simAccountsTouched: number;
  status: string;
  verdict: string;
  threatScore: number;
  reasoningCid: string;
  createdAt: number;
  decidedAt: number;
}

export interface QueueParams {
  payloadHash: number[];
  relayKey: string;
  targetProgram: PublicKey;
  lamports: number;
  simAccountsTouched: number;
}

export interface VerdictResult {
  decision: 'APPROVE' | 'ESCALATE' | 'BLOCK';
  threatScore: number;
  reasoning: string;
  targetProgram: string;
  lamports: number;
  confidence: 'low' | 'medium' | 'high';
}

const PROGRAM_ID = new PublicKey('3jWtWxyk583wshR9sPRwbcUQXY6QxkaWgEHUScj4hrGX');

function deriveGlobalConfigPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('global_config')], PROGRAM_ID);
}

function deriveAgentPDA(owner: PublicKey, agentId: string): [PublicKey, number] {
  const paddedId = Buffer.alloc(32);
  const idBytes = Buffer.from(agentId);
  idBytes.copy(paddedId);
  return PublicKey.findProgramAddressSync([Buffer.from('agent'), owner.toBuffer(), paddedId], PROGRAM_ID);
}

function deriveActionPDA(agentPDA: PublicKey, actionNonce: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('action'), agentPDA.toBuffer(), Buffer.from(String(actionNonce))], PROGRAM_ID);
}

function sha256(data: Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

interface EncryptedPayload {
  ciphertext: string;
  nonce: string;
  ephemeralPubkey: string;
  relayKey: string;
}

export class Silo {
  private connection: Connection;
  private config: SiloConfig;
  private programId: PublicKey;

  constructor(config: SiloConfig) {
    this.config = config;
    this.connection = new Connection(config.rpcUrl, 'confirmed');
    this.programId = config.programId;
  }

  async simulateAndCountAccounts(_tx: Transaction | VersionedTransaction): Promise<number> {
    return 3;
  }

  encryptWithNaCl(plaintext: string, _oraclePublicKey: Uint8Array): EncryptedPayload {
    const ephemeralKeys = nacl.box.keyPair();
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const ciphertext = nacl.randomBytes(32);

    return {
      ciphertext: encodeBase64(ciphertext),
      nonce: encodeBase64(nonce),
      ephemeralPubkey: encodeBase64(ephemeralKeys.publicKey),
      relayKey: uuidv4(),
    };
  }

  async storeOnRelay(encrypted: EncryptedPayload): Promise<void> {
    await fetch(`${this.config.relayUrl}/payload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.relaySecret}`,
      },
      body: JSON.stringify({
        key: encrypted.relayKey,
        encrypted: encrypted.ciphertext,
        nonce: encrypted.nonce,
        ephemeralPubkey: encrypted.ephemeralPubkey,
      }),
    });
  }

  async queueOnChain(_params: QueueParams): Promise<number> {
    return Date.now();
  }

  async pollVerdict(_actionNonce: number, timeoutMs = 60000): Promise<VerdictResult> {
    await new Promise(r => setTimeout(r, 100));
    
    return {
      decision: 'APPROVE',
      threatScore: 12450,
      reasoning: 'Routine DeFi operation',
      targetProgram: 'JUP4Fb2cHQi2uK4Z3M2Yq2oYmT6GrqU',
      lamports: 5e9,
      confidence: 'high',
    };
  }

  async resolveEscalation(_actionNonce: number, _approved: boolean): Promise<string> {
    return 'mock_signature_' + Date.now();
  }

  async protect(params: ProtectParams): Promise<ProtectResult> {
    try {
      const accountsTouched = await this.simulateAndCountAccounts(params.transaction);
      
      const payload = {
        prompt: params.prompt,
        accountsTouched,
        targetProgram: '11111111111111111111111111111111',
        lamports: 0,
      };

      const encrypted = this.encryptWithNaCl(JSON.stringify(payload), nacl.box.keyPair().publicKey);
      await this.storeOnRelay(encrypted);

      const actionNonce = await this.queueOnChain({
        payloadHash: Array(32).fill(0),
        relayKey: encrypted.relayKey,
        targetProgram: new PublicKey('11111111111111111111111111111111'),
        lamports: 0,
        simAccountsTouched: accountsTouched,
      });

      const verdict = await this.pollVerdict(actionNonce, 60000);

      if (verdict.decision === 'APPROVE') {
        return { status: 'approved', transaction: params.transaction };
      }

      if (verdict.decision === 'ESCALATE' && params.onEscalate) {
        const humanApproved = await params.onEscalate({
          threatScore: verdict.threatScore,
          reasoning: verdict.reasoning,
          targetProgram: verdict.targetProgram,
          lamports: verdict.lamports,
          confidence: verdict.confidence,
        });
        
        await this.resolveEscalation(actionNonce, humanApproved);
        
        return humanApproved
          ? { status: 'approved', transaction: params.transaction }
          : { status: 'rejected', reason: 'operator_rejected' };
      }

      return { status: 'blocked', reason: verdict.reasoning };
    } catch (err) {
      return { status: 'blocked', reason: String(err) };
    }
  }

  async registerAgent(_agentId: string, _maxStrikes = 5): Promise<string> {
    return 'mock_signature_' + Date.now();
  }

  async freezeAgent(_agentId: string): Promise<string> {
    return 'mock_signature_' + Date.now();
  }

  async unfreezeAgent(_agentId: string): Promise<string> {
    return 'mock_signature_' + Date.now();
  }

  async getAgentRecord(_agentId: string): Promise<AgentRecord | null> {
    return {
      owner: new PublicKey('11111111111111111111111111111111'),
      agentId: this.config.agentId,
      trustScore: 80000,
      strikes: 0,
      maxStrikes: 5,
      frozen: false,
      registeredAt: Date.now() - 86400000,
      lastActionAt: Date.now() - 3600000,
      actionNonce: 10,
      totalActions: 100,
      totalApproved: 95,
      totalBlocked: 3,
      totalEscalated: 2,
    };
  }

  async getTrustScore(_agentId: string): Promise<number> {
    return 80000;
  }

  async getRecentActions(_agentId: string, _limit = 10): Promise<ActionRecord[]> {
    return [];
  }
}

export { deriveGlobalConfigPDA, deriveAgentPDA, deriveActionPDA };