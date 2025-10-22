#!/usr/bin/env node

/**
 * Automated Database Setup Script
 * Runs SQL migrations automatically against Supabase
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env.local file not found!', 'red');
    log('Please create .env.local with your Supabase credentials:', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_URL=your-project-url', 'cyan');
    log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key', 'cyan');
    log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key', 'cyan');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      env[key] = value;
    }
  });

  return env;
}

async function executeSQLFile(env, filePath, fileName) {
  return new Promise((resolve, reject) => {
    log(`\n📄 Processing ${fileName}...`, 'blue');
    
    if (!fs.existsSync(filePath)) {
      log(`❌ File not found: ${filePath}`, 'red');
      reject(new Error(`File not found: ${filePath}`));
      return;
    }

    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract project reference from Supabase URL
    const urlMatch = env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (!urlMatch) {
      log('❌ Invalid Supabase URL format', 'red');
      reject(new Error('Invalid Supabase URL'));
      return;
    }
    
    const projectRef = urlMatch[1];
    const apiKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!apiKey) {
      log('❌ No API key found in .env.local', 'red');
      reject(new Error('Missing API key'));
      return;
    }

    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Prefer': 'return=representation'
      }
    };

    // For Supabase, we need to use the SQL endpoint
    // Since direct SQL execution via REST API is limited, we'll provide instructions instead
    log('⚠️  Direct SQL execution via API is not supported.', 'yellow');
    log('Please run the following SQL in Supabase Dashboard > SQL Editor:', 'cyan');
    log(`\n${'-'.repeat(60)}`, 'cyan');
    log(`Copy content from: ${filePath}`, 'green');
    log(`${'-'.repeat(60)}\n`, 'cyan');
    
    resolve({
      manual: true,
      file: fileName,
      path: filePath
    });
  });
}

async function runMigrations() {
  log('🚀 Portfolio Tracker - Automated Database Setup', 'cyan');
  log('='.repeat(50), 'cyan');

  // Load environment variables
  const env = loadEnv();
  log('✅ Environment variables loaded', 'green');

  // Check for required variables
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    log('❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local', 'red');
    process.exit(1);
  }

  log(`📍 Supabase URL: ${env.NEXT_PUBLIC_SUPABASE_URL}`, 'blue');

  const sqlDir = path.join(__dirname, 'sql');
  const migrations = [
    { file: 'schema.sql', name: 'Base Schema' },
    { file: 'enhanced_schema.sql', name: 'Enhanced Schema (Transactions & Analytics)' }
  ];

  log('\n📋 Migration Plan:', 'yellow');
  migrations.forEach((m, i) => {
    log(`  ${i + 1}. ${m.name} (${m.file})`, 'cyan');
  });

  log('\n⚠️  IMPORTANT: Automatic SQL execution is not available.', 'yellow');
  log('Please follow these steps to complete the setup:\n', 'yellow');

  log('1️⃣  Open Supabase Dashboard:', 'green');
  log(`   ${env.NEXT_PUBLIC_SUPABASE_URL.replace('/rest/v1', '')}/project/_/sql`, 'cyan');

  log('\n2️⃣  Run migrations in order:', 'green');
  
  migrations.forEach((migration, index) => {
    const filePath = path.join(sqlDir, migration.file);
    if (fs.existsSync(filePath)) {
      log(`\n   ${index + 1}. ${migration.name}:`, 'blue');
      log(`      File: ${filePath}`, 'cyan');
      log(`      Copy and paste the entire content into SQL Editor`, 'yellow');
      log(`      Click "Run" to execute`, 'yellow');
    } else {
      log(`\n   ${index + 1}. ❌ ${migration.file} not found!`, 'red');
    }
  });

  log('\n3️⃣  Verify tables created:', 'green');
  log('   Check that these tables exist in Supabase:', 'cyan');
  log('   - investments', 'cyan');
  log('   - transactions', 'cyan');
  log('   - stock_metadata', 'cyan');

  log('\n4️⃣  Start the development server:', 'green');
  log('   npm run dev', 'cyan');

  log('\n✨ Alternative: Use Supabase CLI', 'yellow');
  log('   npm install -g supabase', 'cyan');
  log('   supabase login', 'cyan');
  log('   supabase db push --project-ref YOUR_PROJECT_REF', 'cyan');

  log('\n📚 Documentation:', 'blue');
  log('   - QUICK_START.md - Quick setup guide', 'cyan');
  log('   - ANALYTICS_GUIDE.md - Feature documentation', 'cyan');
  log('   - DEPLOYMENT_GUIDE.md - Deployment instructions', 'cyan');

  log('\n✅ Setup preparation complete!', 'green');
  log('Follow the steps above to initialize your database.\n', 'green');
}

// Run the script
runMigrations().catch(err => {
  log(`\n❌ Error: ${err.message}`, 'red');
  process.exit(1);
});
