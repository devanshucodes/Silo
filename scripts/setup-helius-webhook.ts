import fetch from 'node-fetch';

const args = process.argv.slice(2);
let programId = 'Si1oXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--program-id' && args[i + 1]) {
    programId = args[i + 1];
  }
}

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';
const HELIUS_WEBHOOK_SECRET = process.env.HELIUS_WEBHOOK_SECRET || 'dev-secret';
const ORACLE_WORKER_URL = process.env.ORACLE_WORKER_URL || 'http://localhost:3002';

async function main() {
  console.log('Silo - Setup Helius Webhook');
  console.log('===========================');

  if (!HELIUS_API_KEY) {
    console.log('');
    console.log('HELIUS_API_KEY not set. Running in mock mode.');
    console.log('In production, you would:');
    console.log('  1. Create a Helius webhook pointing to Oracle Worker');
    console.log('  2. Configure webhook to listen for program events');
    console.log('  3. Set the webhook authentication secret');
    console.log('');
    console.log('To set up manually:');
    console.log('  1. Go to https://dashboard.helius.dev');
    console.log('  2. Create webhook pointing to:');
    console.log(`     ${ORACLE_WORKER_URL}/webhook`);
    console.log('  3. Configure webhook to trigger on program:', programId);
    console.log('');
    return;
  }

  const webhookUrl = `${ORACLE_WORKER_URL}/webhook`;

  console.log(`Program ID: ${programId}`);
  console.log(`Webhook URL: ${webhookUrl}`);
  console.log('');

  const createWebhook = async () => {
    const response = await fetch(`https://api.helius.dev/v0/webhooks?api-key=${HELIUS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webhookURL: webhookUrl,
        transactionTypes: ['ANY'],
        accountAddresses: [programId],
        webhookType: 'enhanced',
        authHeader: HELIUS_WEBHOOK_SECRET,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create webhook: ${error}`);
    }

    const data = await response.json();
    console.log('Webhook created successfully!');
    console.log(`Webhook ID: ${data.webhookId}`);
    console.log(`Webhook URL: ${data.webhookURL}`);
    console.log('');
  };

  try {
    await createWebhook();
  } catch (err) {
    console.log('Note: Webhook creation failed (may already exist).');
    console.log('You can manage webhooks at: https://dashboard.helius.dev');
  }

  console.log('Webhook setup complete!');
}

main().catch(console.error);