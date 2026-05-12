import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
let oracleAuthorityArg = '';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--oracle-authority' && args[i + 1]) {
    oracleAuthorityArg = args[i + 1];
  }
}

const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8899';
const WALLET_PATH = (process.env.DEPLOYER_KEYPAIR_PATH || '~/.config/solana/id.json').replace(
  '~',
  process.env.HOME || ''
);
const ORACLE_PATH = (process.env.ORACLE_KEYPAIR_PATH || '~/.config/solana/silo-oracle.json').replace(
  '~',
  process.env.HOME || ''
);
const PROGRAM_ID = process.env.PROGRAM_ID || 'HFE7XdEE2f3rNbkZhynSwc7JWFNA3zgsnVBzeLeutLD2';

async function main() {
  console.log('Silo — Initialize GlobalConfig');
  console.log('================================');

  const keypairData = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf8'));
  const wallet = Keypair.fromSecretKey(new Uint8Array(keypairData));

  const connection = new Connection(RPC_URL, 'confirmed');
  const programId = new PublicKey(PROGRAM_ID);

  let oracleAuthority: PublicKey;
  if (oracleAuthorityArg) {
    oracleAuthority = new PublicKey(oracleAuthorityArg);
  } else if (fs.existsSync(ORACLE_PATH)) {
    const oracleData = JSON.parse(fs.readFileSync(ORACLE_PATH, 'utf8'));
    oracleAuthority = Keypair.fromSecretKey(new Uint8Array(oracleData)).publicKey;
  } else {
    throw new Error('Oracle keypair not found. Set ORACLE_KEYPAIR_PATH or pass --oracle-authority');
  }

  console.log(`Deployer : ${wallet.publicKey.toString()}`);
  console.log(`Program  : ${PROGRAM_ID}`);
  console.log(`Oracle   : ${oracleAuthority.toString()}`);
  console.log(`RPC      : ${RPC_URL}`);

  const idlPath = path.resolve(__dirname, '../target/idl/silo_firewall.json');
  if (!fs.existsSync(idlPath)) {
    throw new Error(`IDL not found at ${idlPath}. Run anchor build first.`);
  }
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { commitment: 'confirmed' }
  );
  anchor.setProvider(provider);

  const program = new anchor.Program(idl as anchor.Idl, provider);

  const [globalConfigPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('global_config')],
    programId
  );

  console.log(`\nGlobalConfig PDA: ${globalConfigPDA.toString()}`);

  const existing = await connection.getAccountInfo(globalConfigPDA);
  if (existing) {
    console.log('\nGlobalConfig already initialized!');
    const config = await (program.account as any).globalConfig.fetch(globalConfigPDA);
    console.log(`  Authority     : ${config.authority.toString()}`);
    console.log(`  Oracle Auth   : ${config.oracleAuthority.toString()}`);
    console.log(`  Total Agents  : ${config.totalAgents.toString()}`);
    console.log(`  Total Actions : ${config.totalActions.toString()}`);
    console.log(`  Paused        : ${config.paused}`);
    return;
  }

  console.log('\nInitializing...');
  const sig = await (program.methods as any)
    .initialize(oracleAuthority)
    .accounts({
      globalConfig: globalConfigPDA,
      authority: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log(`\nTransaction: ${sig}`);
  console.log('GlobalConfig initialized successfully!');
  console.log(`Explorer: https://explorer.solana.com/tx/${sig}?cluster=custom&customUrl=${encodeURIComponent(RPC_URL)}`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
