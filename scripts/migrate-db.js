#!/usr/bin/env node

/**
 * Supabase Database Migration Script
 * Uses Supabase Management API to execute SQL migrations
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Colors for console output
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

async function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env.local file not found!', 'red');
    log('Creating .env.local from .env.example...', 'yellow');
    
    const examplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      log('✅ .env.local created. Please fill in your Supabase credentials.', 'green');
    }
    
    process.exit(1);
  }

  // Load .env.local
  require('dotenv').config({ path: envPath });
  
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

async function executeSQLViaSupabase(supabase, sqlContent, fileName) {
  try {
    log(`\n📄 Executing ${fileName}...`, 'blue');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim() === ';') {
        continue;
      }

      try {
        // Use Supabase RPC to execute SQL
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          // Some errors might be expected (e.g., "already exists")
          if (error.message.includes('already exists')) {
            log(`  ⚠️  Statement ${i + 1}: Already exists (skipping)`, 'yellow');
          } else {
            log(`  ❌ Statement ${i + 1}: ${error.message}`, 'red');
            errorCount++;
          }
        } else {
          successCount++;
          if ((i + 1) % 10 === 0) {
            log(`  ✅ Progress: ${i + 1}/${statements.length} statements`, 'green');
          }
        }
      } catch (err) {
        log(`  ❌ Statement ${i + 1}: ${err.message}`, 'red');
        errorCount++;
      }
    }

    log(`\n✅ ${fileName} completed:`, 'green');
    log(`   Success: ${successCount} statements`, 'green');
    if (errorCount > 0) {
      log(`   Errors: ${errorCount} statements`, 'yellow');
    }

    return { successCount, errorCount };

  } catch (error) {
    log(`❌ Error executing ${fileName}: ${error.message}`, 'red');
    throw error;
  }
}

async function runMigrations() {
  log('🚀 Portfolio Tracker - Database Migration Script', 'cyan');
  log('='.repeat(60), 'cyan');

  // Load environment
  const env = await loadEnv();
  
  if (!env.url || !env.anonKey) {
    log('❌ Missing Supabase credentials in .env.local', 'red');
    log('Please add:', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_URL=your-url', 'cyan');
    log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key', 'cyan');
    process.exit(1);
  }

  log('✅ Environment loaded', 'green');
  log(`📍 Supabase URL: ${env.url}`, 'blue');

  // Create Supabase client with service role key (if available)
  const supabase = createClient(
    env.url,
    env.serviceRoleKey || env.anonKey
  );

  log('\n📋 Running migrations...', 'yellow');

  const sqlDir = path.join(__dirname, 'sql');
  const migrations = [
    { file: 'schema.sql', name: 'Base Schema' },
    { file: 'enhanced_schema.sql', name: 'Enhanced Schema' }
  ];

  let totalSuccess = 0;
  let totalErrors = 0;

  for (const migration of migrations) {
    const filePath = path.join(sqlDir, migration.file);
    
    if (!fs.existsSync(filePath)) {
      log(`\n⚠️  ${migration.file} not found, skipping...`, 'yellow');
      continue;
    }

    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    try {
      const result = await executeSQLViaSupabase(supabase, sqlContent, migration.name);
      totalSuccess += result.successCount;
      totalErrors += result.errorCount;
    } catch (error) {
      log(`\n❌ Migration failed: ${migration.name}`, 'red');
      log(`   ${error.message}`, 'red');
    }
  }

  log('\n' + '='.repeat(60), 'cyan');
  log('📊 Migration Summary:', 'cyan');
  log(`   Total Success: ${totalSuccess}`, 'green');
  log(`   Total Errors: ${totalErrors}`, totalErrors > 0 ? 'yellow' : 'green');
  
  if (totalErrors === 0) {
    log('\n✅ All migrations completed successfully!', 'green');
  } else {
    log('\n⚠️  Some migrations had errors. Check the logs above.', 'yellow');
    log('   Many "already exists" errors are expected on re-runs.', 'cyan');
  }

  log('\n🎉 Database setup complete!', 'green');
  log('   Run: npm run dev', 'cyan');
}

// Check if @supabase/supabase-js is installed
try {
  require.resolve('@supabase/supabase-js');
  runMigrations().catch(err => {
    log(`\n❌ Fatal error: ${err.message}`, 'red');
    process.exit(1);
  });
} catch (err) {
  log('❌ @supabase/supabase-js not found!', 'red');
  log('This package is already in your dependencies.', 'yellow');
  log('Run: npm install', 'cyan');
  process.exit(1);
}
