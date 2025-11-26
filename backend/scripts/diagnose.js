// Script untuk diagnose masalah backend
// Usage: node scripts/diagnose.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

console.log('🔍 Klinik Sehat - Backend Diagnostics\n');
console.log('='.repeat(50));

async function diagnose() {
  let connection;
  const results = {
    env: false,
    mysql: false,
    database: false,
    tables: false,
    users: false,
  };

  try {
    // 1. Check .env file
    console.log('\n1️⃣  Checking .env file...');
    try {
      const envPath = join(__dirname, '../.env');
      const envContent = readFileSync(envPath, 'utf8');
      
      const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET', 'PORT'];
      const missingVars = [];
      
      requiredVars.forEach(varName => {
        if (!envContent.includes(varName)) {
          missingVars.push(varName);
        }
      });
      
      if (missingVars.length > 0) {
        console.log('   ❌ Missing variables:', missingVars.join(', '));
        console.log('   💡 Copy .env.example and fill in the values');
      } else {
        console.log('   ✅ .env file OK');
        results.env = true;
      }
    } catch (error) {
      console.log('   ❌ .env file not found');
      console.log('   💡 Run: cp .env.example .env');
    }

    // 2. Check MySQL connection
    console.log('\n2️⃣  Testing MySQL connection...');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'clinic_queue_db'}`);
    
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306
      });
      console.log('   ✅ MySQL connection OK');
      results.mysql = true;
    } catch (error) {
      console.log('   ❌ MySQL connection FAILED:', error.message);
      console.log('\n   💡 Troubleshooting:');
      console.log('      • Check if MySQL is running: mysql.server status');
      console.log('      • Start MySQL: mysql.server start');
      console.log('      • Verify password in .env file');
      return;
    }

    // 3. Check database exists
    console.log('\n3️⃣  Checking database...');
    try {
      const dbName = process.env.DB_NAME || 'clinic_queue_db';
      const [databases] = await connection.query(
        'SHOW DATABASES LIKE ?',
        [dbName]
      );
      
      if (databases.length === 0) {
        console.log(`   ❌ Database '${dbName}' not found`);
        console.log('\n   💡 Create database:');
        console.log(`      mysql -u root -p -e "CREATE DATABASE ${dbName};"`);
        console.log(`      mysql -u root -p ${dbName} < backend/database/schema.sql`);
        return;
      }
      
      console.log(`   ✅ Database '${dbName}' exists`);
      results.database = true;
      
      // Switch to database
      await connection.query(`USE ${dbName}`);
    } catch (error) {
      console.log('   ❌ Error checking database:', error.message);
      return;
    }

    // 4. Check tables
    console.log('\n4️⃣  Checking tables...');
    try {
      const [tables] = await connection.query('SHOW TABLES');
      
      const requiredTables = [
        'users', 'profiles', 'doctor_schedules', 'appointments', 
        'queue', 'medical_records', 'consultations', 
        'consultation_messages', 'notifications'
      ];
      
      const existingTables = tables.map(t => Object.values(t)[0]);
      const missingTables = requiredTables.filter(t => !existingTables.includes(t));
      
      if (missingTables.length > 0) {
        console.log(`   ❌ Missing tables: ${missingTables.join(', ')}`);
        console.log('\n   💡 Import schema:');
        console.log('      mysql -u root -p clinic_queue_db < backend/database/schema.sql');
        return;
      }
      
      console.log(`   ✅ All ${tables.length} tables exist`);
      results.tables = true;
    } catch (error) {
      console.log('   ❌ Error checking tables:', error.message);
      return;
    }

    // 5. Check users
    console.log('\n5️⃣  Checking users...');
    try {
      const [users] = await connection.query(
        'SELECT id, email, role FROM users ORDER BY id'
      );
      
      if (users.length === 0) {
        console.log('   ❌ No users found');
        console.log('\n   💡 Create users:');
        console.log('      cd backend');
        console.log('      node scripts/create-users.js');
        return;
      }
      
      console.log(`   ✅ Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`      • ${user.email} (${user.role})`);
      });
      results.users = true;
    } catch (error) {
      console.log('   ❌ Error checking users:', error.message);
      return;
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 DIAGNOSIS SUMMARY\n');
    
    const allOK = Object.values(results).every(v => v);
    
    if (allOK) {
      console.log('✅ ALL CHECKS PASSED!');
      console.log('\n✨ Your backend should work fine.');
      console.log('   If you still have errors:');
      console.log('   1. Restart backend: npm run dev');
      console.log('   2. Check backend console for errors');
      console.log('   3. Test login: node scripts/test-login.js');
    } else {
      console.log('❌ SOME CHECKS FAILED\n');
      console.log('Status:');
      console.log(`   .env file:     ${results.env ? '✅' : '❌'}`);
      console.log(`   MySQL:         ${results.mysql ? '✅' : '❌'}`);
      console.log(`   Database:      ${results.database ? '✅' : '❌'}`);
      console.log(`   Tables:        ${results.tables ? '✅' : '❌'}`);
      console.log(`   Users:         ${results.users ? '✅' : '❌'}`);
      console.log('\n💡 Follow the troubleshooting steps above to fix issues.');
    }
    
    console.log('\n' + '='.repeat(50));

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

diagnose();
