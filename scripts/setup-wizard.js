#!/usr/bin/env node

/**
 * Simple Database Migration Helper
 * Provides interactive guidance for running SQL migrations
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printBox(title, content, color = 'cyan') {
  const width = 70;
  log('╔' + '═'.repeat(width) + '╗', color);
  log('║' + title.padEnd(width) + '║', color);
  log('╠' + '═'.repeat(width) + '╣', color);
  content.forEach(line => {
    log('║ ' + line.padEnd(width - 1) + '║', color);
  });
  log('╚' + '═'.repeat(width) + '╝', color);
}

async function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main() {
  console.clear();
  
  printBox('🚀 Portfolio Tracker - Database Setup Wizard', [
    '',
    'This wizard will help you set up your database with all required',
    'tables, views, and seed data for the portfolio tracker.',
    ''
  ], 'cyan');

  log('\n');

  // Step 1: Check environment
  const envPath = path.join(__dirname, '.env.local');
  const hasEnv = fs.existsSync(envPath);

  if (!hasEnv) {
    log('❌ .env.local not found!', 'red');
    log('\n📝 Creating .env.local from template...', 'yellow');
    
    const examplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      log('✅ .env.local created!', 'green');
      log('\n⚠️  Please edit .env.local and add your Supabase credentials:', 'yellow');
      log('   1. NEXT_PUBLIC_SUPABASE_URL', 'cyan');
      log('   2. NEXT_PUBLIC_SUPABASE_ANON_KEY', 'cyan');
      log('   3. SUPABASE_SERVICE_ROLE_KEY (optional)', 'cyan');
      log('\nAfter adding credentials, run this script again.', 'yellow');
      process.exit(0);
    } else {
      log('❌ .env.example not found. Cannot create .env.local', 'red');
      process.exit(1);
    }
  }

  log('✅ .env.local found', 'green');

  // Read Supabase URL
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
  const supabaseUrl = urlMatch ? urlMatch[1].trim().replace(/['"]/g, '') : null;

  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    log('\n⚠️  Supabase URL not configured in .env.local', 'yellow');
    log('Please update NEXT_PUBLIC_SUPABASE_URL with your actual project URL', 'cyan');
    process.exit(1);
  }

  log(`📍 Supabase Project: ${supabaseUrl}`, 'blue');

  // Step 2: Check migration files
  log('\n📁 Checking migration files...', 'blue');
  const sqlDir = path.join(__dirname, 'sql');
  const migrations = [
    { file: 'schema.sql', name: 'Base Schema (investments table)' },
    { file: 'enhanced_schema.sql', name: 'Enhanced Schema (transactions, analytics)' }
  ];

  const availableMigrations = [];
  migrations.forEach(m => {
    const filePath = path.join(sqlDir, m.file);
    if (fs.existsSync(filePath)) {
      log(`  ✅ ${m.name}`, 'green');
      availableMigrations.push({ ...m, path: filePath });
    } else {
      log(`  ❌ ${m.name} - FILE NOT FOUND`, 'red');
    }
  });

  if (availableMigrations.length === 0) {
    log('\n❌ No migration files found!', 'red');
    process.exit(1);
  }

  // Step 3: Instructions
  log('\n');
  printBox('📋 SETUP INSTRUCTIONS', [
    '',
    '1. Open Supabase Dashboard in your browser',
    '2. Go to: SQL Editor section',
    '3. Create a new query',
    '4. Copy and paste the SQL from each migration file',
    '5. Click RUN to execute',
    ''
  ], 'yellow');

  log('\n🔗 Quick Links:', 'cyan');
  const dashboardUrl = supabaseUrl.replace('/rest/v1', '');
  log(`   Dashboard: ${dashboardUrl}/project/_/sql`, 'blue');

  log('\n📄 Migration Files (in order):', 'cyan');
  availableMigrations.forEach((m, i) => {
    log(`\n   ${i + 1}. ${m.name}`, 'green');
    log(`      📂 ${m.path}`, 'cyan');
    
    const content = fs.readFileSync(m.path, 'utf8');
    const lines = content.split('\n').length;
    const size = (content.length / 1024).toFixed(2);
    log(`      📊 ${lines} lines, ${size} KB`, 'blue');
  });

  // Step 4: Copy to clipboard option
  log('\n');
  const answer = await askQuestion(colors.yellow + '❓ Would you like to see the SQL content? (y/n): ' + colors.reset);

  if (answer === 'y' || answer === 'yes') {
    for (const migration of availableMigrations) {
      log('\n' + '='.repeat(70), 'cyan');
      log(`📄 ${migration.name}`, 'green');
      log('='.repeat(70), 'cyan');
      log('\n💡 Copy the content below and paste it into Supabase SQL Editor:\n', 'yellow');
      
      const content = fs.readFileSync(migration.path, 'utf8');
      console.log(content);
      
      log('\n' + '='.repeat(70), 'cyan');
      
      const next = await askQuestion(colors.cyan + '\n⏭️  Press Enter to continue to next migration...' + colors.reset);
    }
  }

  // Step 5: Verification checklist
  log('\n');
  printBox('✅ VERIFICATION CHECKLIST', [
    '',
    'After running all migrations, verify these tables exist:',
    '',
    '  ☐ investments        - Main investment records',
    '  ☐ transactions       - Buy/sell/bonus/split records',
    '  ☐ stock_metadata     - Stock sector/industry data',
    '',
    'Also check these views exist:',
    '',
    '  ☐ v_portfolio_by_sector',
    '  ☐ v_portfolio_by_industry', 
    '  ☐ v_portfolio_by_market_cap',
    ''
  ], 'green');

  log('\n🎉 Setup Guide Complete!', 'green');
  log('\n📚 Next Steps:', 'cyan');
  log('   1. Run migrations in Supabase SQL Editor', 'blue');
  log('   2. Verify tables are created', 'blue');
  log('   3. Run: npm run dev', 'blue');
  log('   4. Visit: http://localhost:3000', 'blue');
  log('\n💡 Need help? Check QUICK_START.md', 'yellow');
  log('');
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}`, 'red');
  process.exit(1);
});
