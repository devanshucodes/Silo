#!/usr/bin/env bash
set -euo pipefail

export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

echo "╔══════════════════════════════════════════════════╗"
echo "║           Silo — Deploy Script                   ║"
echo "╚══════════════════════════════════════════════════╝"

# Load .env
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

CLUSTER="${1:-devnet}"
echo "Target cluster: $CLUSTER"

# Resolve RPC URL
if [ "$CLUSTER" = "devnet" ]; then
  RPC_URL_CLUSTER="https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY:-}"
  [ -z "${HELIUS_API_KEY:-}" ] && RPC_URL_CLUSTER="https://api.devnet.solana.com"
elif [ "$CLUSTER" = "mainnet" ] || [ "$CLUSTER" = "mainnet-beta" ]; then
  RPC_URL_CLUSTER="https://api.mainnet-beta.solana.com"
else
  RPC_URL_CLUSTER="http://127.0.0.1:8899"
fi

DEPLOYER_WALLET=$(solana address)
echo "Deployer wallet: $DEPLOYER_WALLET"

# Check required tools
for tool in anchor solana; do
  if ! command -v $tool &>/dev/null; then
    echo "Error: $tool not found in PATH"
    exit 1
  fi
done

# Build Anchor program
echo ""
echo "→ Building Anchor program..."
anchor build

PROGRAM_ID=$(solana-keygen pubkey target/deploy/silo_firewall-keypair.json)
echo "  Program keypair: $PROGRAM_ID"

# Check balance
# Check balance using JSON RPC (more reliable than CLI --url flag)
BALANCE_LAMPORTS=$(curl -s -X POST "$RPC_URL_CLUSTER" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getBalance\",\"params\":[\"$DEPLOYER_WALLET\"]}" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('result',{}).get('value',0))" 2>/dev/null || echo "0")
BALANCE=$(python3 -c "print(round($BALANCE_LAMPORTS / 1e9, 4))" 2>/dev/null || echo "0")
echo "  Wallet balance: ${BALANCE} SOL (${BALANCE_LAMPORTS} lamports)"

if python3 -c "import sys; sys.exit(0 if float('${BALANCE}') >= 3 else 1)" 2>/dev/null; then
  echo "  ✓ Sufficient balance"
else
  echo ""
  echo "⚠  Need ~3 SOL to deploy. Wallet has ${BALANCE} SOL."
  echo ""
  echo "  Deployer address: $DEPLOYER_WALLET"
  echo "  ↳ Airdrop at: https://faucet.solana.com"
  echo "    (Enter the address above, NOT the program ID)"
  echo ""
  if [ "$CLUSTER" = "localnet" ] || echo "$RPC_URL_CLUSTER" | grep -q "127.0.0.1"; then
    echo "  Running localnet airdrop..."
    solana airdrop 10 --url localhost
  else
    exit 1
  fi
fi

# Deploy program
echo ""
echo "→ Deploying silo_firewall..."
solana program deploy \
  target/deploy/silo_firewall.so \
  --url "$RPC_URL_CLUSTER" \
  --program-id target/deploy/silo_firewall-keypair.json

# Update program ID everywhere
echo ""
echo "→ Syncing program ID ($PROGRAM_ID) across codebase..."
find . -name "*.ts" -o -name "*.toml" -o -name "*.rs" -o -name ".env" | \
  grep -v node_modules | grep -v target | grep -v ".git" | \
  xargs sed -i.bak "s/Si1oXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/$PROGRAM_ID/g" 2>/dev/null || true
find . -name "*.bak" | grep -v node_modules | grep -v target | xargs rm -f 2>/dev/null || true

# Initialize GlobalConfig
echo ""
echo "→ Initializing GlobalConfig..."
ORACLE_PUBKEY=$(solana-keygen pubkey "${ORACLE_KEYPAIR_PATH:-$HOME/.config/solana/silo-oracle.json}")

PROGRAM_ID="$PROGRAM_ID" RPC_URL="$RPC_URL_CLUSTER" \
  node_modules/.bin/ts-node --project packages/sdk/tsconfig.json \
  scripts/initialize.ts --oracle-authority "$ORACLE_PUBKEY"

# Build TypeScript packages
echo ""
echo "→ Building TypeScript packages..."
pnpm --filter @silo-sol/relay build
pnpm --filter @silo-sol/oracle-worker build
pnpm --filter @silo-sol/sdk build
pnpm --filter @silo-sol/cli build
pnpm --filter @silo-sol/dashboard build 2>/dev/null || echo "  Dashboard build skipped (requires Next.js setup)"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Silo deployed successfully!                     ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  Program ID : $PROGRAM_ID"
echo "║  Cluster    : $CLUSTER"
echo "║  Oracle     : $ORACLE_PUBKEY"
echo "╚══════════════════════════════════════════════════╝"
