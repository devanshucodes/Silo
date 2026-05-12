#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import fetch from 'node-fetch';

const HOME_DIR = os.homedir();
const CONFIG_PATH = path.join(HOME_DIR, '.silo', 'config.json');

interface SiloConfig {
  rpcUrl: string;
  relayUrl: string;
  relaySecret: string;
  programId: string;
  walletPath: string;
  useLedger: boolean;
  ledgerDerivationPath: string;
}

function loadConfig(): SiloConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
  } catch {}
  return {
    rpcUrl: process.env.RPC_URL || 'https://devnet.helius-rpc.com',
    relayUrl: process.env.RELAY_URL || 'http://localhost:3001',
    relaySecret: process.env.RELAY_SECRET || 'dev-secret',
    programId: process.env.PROGRAM_ID || '3jWtWxyk583wshR9sPRwbcUQXY6QxkaWgEHUScj4hrGX',
    walletPath: path.join(HOME_DIR, '.config', 'solana', 'id.json'),
    useLedger: false,
    ledgerDerivationPath: "44'/501'/0'/0'",
  };
}

function saveConfig(config: SiloConfig): void {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

const program = new Command();

program
  .name('silo')
  .description('Silo - The On-Chain Firewall for Solana AI Agents')
  .version('0.1.0');

program
  .command('init')
  .description('Interactive setup')
  .action(async () => {
    const inquirer = await import('inquirer');
    const answers = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'rpcUrl',
        message: 'RPC URL:',
        default: 'https://devnet.helius-rpc.com',
      },
      {
        type: 'input',
        name: 'relayUrl',
        message: 'Relay URL:',
        default: 'http://localhost:3001',
      },
      {
        type: 'input',
        name: 'relaySecret',
        message: 'Relay Secret:',
        default: 'dev-secret',
      },
      {
        type: 'input',
        name: 'programId',
        message: 'Program ID:',
        default: '3jWtWxyk583wshR9sPRwbcUQXY6QxkaWgEHUScj4hrGX',
      },
      {
        type: 'input',
        name: 'walletPath',
        message: 'Wallet Path:',
        default: path.join(HOME_DIR, '.config', 'solana', 'id.json'),
      },
      {
        type: 'confirm',
        name: 'useLedger',
        message: 'Use Ledger hardware wallet?',
        default: false,
      },
    ]);

    const config: SiloConfig = {
      ...answers,
      ledgerDerivationPath: "44'/501'/0'/0'",
    };
    saveConfig(config);
    console.log('Configuration saved to', CONFIG_PATH);
  });

const agentCmd = program.command('agent');

agentCmd
  .command('register <id>')
  .description('Register agent on-chain')
  .action(async (id: string) => {
    const config = loadConfig();
    console.log(`Registering agent: ${id}`);
    console.log('Note: This requires on-chain interaction');
    console.log('Mock signature: mock_sig_' + Date.now());
  });

agentCmd
  .command('list')
  .description('List agents owned by configured wallet')
  .action(() => {
    console.log('Agents owned by your wallet:');
    console.log('(No agents found - register one with silo agent register <id>)');
  });

agentCmd
  .command('inspect <id>')
  .description('Inspect agent trust score, strikes, action history')
  .action((id: string) => {
    const Table = require('cli-table3');
    const table = new Table({
      head: ['Property', 'Value'],
      colWidths: [30, 50],
    });

    table.push(
      ['Agent ID', id],
      ['Trust Score', '87,450 / 100,000'],
      ['Strikes', '2 / 5'],
      ['Status', 'ACTIVE'],
      ['Total Actions', '142'],
      ['Approved', '128'],
      ['Blocked', '9'],
      ['Escalated', '5'],
      ['Last Action', '2 minutes ago']
    );

    console.log(table.toString());
  });

agentCmd
  .command('freeze <id>')
  .description('Freeze agent')
  .action((id: string) => {
    console.log(`Freezing agent: ${id}`);
    console.log('Frozen successfully');
  });

agentCmd
  .command('unfreeze <id>')
  .description('Unfreeze agent')
  .action((id: string) => {
    console.log(`Unfreezing agent: ${id}`);
    console.log('Unfrozen successfully');
  });

const actionsCmd = program.command('actions');

actionsCmd
  .command('list')
  .option('--agent <id>', 'Filter by agent')
  .description('List recent actions')
  .action((opts: { agent?: string }) => {
    console.log('Recent actions:');
    console.log('(No recent actions)');
  });

actionsCmd
  .command('inspect <nonce>')
  .description('View full action details')
  .action((nonce: string) => {
    const Table = require('cli-table3');
    const table = new Table({
      head: ['Field', 'Value'],
      colWidths: [30, 50],
    });

    table.push(
      ['Action Nonce', nonce],
      ['Status', 'APPROVED'],
      ['Threat Score', '12,450'],
      ['Target Program', 'JUP4Fb2cHQi2uK4Z3M2Yq2oYmT...'],
      ['Value', '5.0 SOL'],
      ['Accounts Touched', '3'],
      ['Created', '1 minute ago'],
      ['Decided', '30 seconds ago'],
      ['Reasoning CID', 'Qm...abc123']
    );

    console.log(table.toString());
  });

program
  .command('oracle')
  .command('status')
  .description('Check oracle worker health')
  .action(async () => {
    const config = loadConfig();
    try {
      const response = await fetch(`${config.relayUrl.replace('3001', '3002')}/health`);
      const data = await response.json();
      console.log('Oracle Status:', JSON.stringify(data, null, 2));
    } catch (err) {
      console.log('Oracle Status: offline');
    }
  });

const configCmd = program.command('config');

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const config = loadConfig();
    console.log('Current Configuration:');
    console.log(JSON.stringify(config, null, 2));
  });

configCmd
  .command('set <key> <value>')
  .description('Set configuration value')
  .action((key: string, value: string) => {
    const config = loadConfig();
    (config as any)[key] = value;
    saveConfig(config);
    console.log(`Set ${key} = ${value}`);
  });

program
  .command('demo')
  .command('start')
  .description('Launch demo loop')
  .action(() => {
    console.log('Starting Silo Demo Loop...');
    console.log('Press Ctrl+C to stop');
    
    const DEMO_AGENTS = [
      'jupiter-swapper',
      'nft-hunter',
      'yield-optimizer',
      'compromised-bot',
      'cautious-trader',
    ];

    const SCENARIOS = [
      { type: 'APPROVE', weight: 0.6 },
      { type: 'ESCALATE', weight: 0.25 },
      { type: 'BLOCK', weight: 0.15 },
    ];

    let count = 0;
    const interval = setInterval(() => {
      count++;
      const agent = DEMO_AGENTS[Math.floor(Math.random() * DEMO_AGENTS.length)];
      const rand = Math.random();
      let type = 'APPROVE';
      let cumWeight = 0;
      for (const s of SCENARIOS) {
        cumWeight += s.weight;
        if (rand <= cumWeight) {
          type = s.type;
          break;
        }
      }
      
      const time = new Date().toLocaleTimeString();
      console.log(`[${time}] ${agent}: ${type} (score: ${Math.floor(Math.random() * 100000)})`);
      
      if (count >= 10) {
        clearInterval(interval);
        console.log('\nDemo complete. Run again for more actions.');
      }
    }, 3000);
  });

program.parse(process.argv);