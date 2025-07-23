#!/usr/bin/env node

/**
 * Script para verificar que las páginas de debug estén protegidas en producción
 * Usage: node scripts/check-debug-protection.js [URL_BASE]
 */

const https = require('https');
const http = require('http');

const DEBUG_ROUTES = [
  '/analytics-test',
  '/adsense-debug',
];

const BASE_URL = process.argv[2] || 'https://www.encontramecanico.com.ar';

console.log('🔍 Checking debug page protection...');
console.log(`Base URL: ${BASE_URL}`);
console.log('═'.repeat(50));

async function checkRoute(route) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${route}`;
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, (res) => {
      const isProtected = res.statusCode === 404 || res.statusCode === 403;

      console.log(`${route.padEnd(20)} ${isProtected ? '✅' : '❌'} (${res.statusCode})`);

      resolve({
        route,
        statusCode: res.statusCode,
        isProtected,
      });
    });

    req.on('error', (err) => {
      console.log(`${route.padEnd(20)} ❌ ERROR: ${err.message}`);
      resolve({
        route,
        statusCode: 'ERROR',
        isProtected: false,
        error: err.message,
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`${route.padEnd(20)} ❌ TIMEOUT`);
      resolve({
        route,
        statusCode: 'TIMEOUT',
        isProtected: false,
      });
    });
  });
}

async function main() {
  const results = [];

  for (const route of DEBUG_ROUTES) {
    const result = await checkRoute(route);
    results.push(result);
  }

  console.log('═'.repeat(50));

  const protectedCount = results.filter(r => r.isProtected).length;
  const totalCount = results.length;

  if (protectedCount === totalCount) {
    console.log('🎉 All debug routes are properly protected!');
    process.exit(0);
  } else {
    console.log(`❌ ${totalCount - protectedCount}/${totalCount} routes are NOT protected!`);
    console.log('');
    console.log('Unprotected routes:');
    results
      .filter(r => !r.isProtected)
      .forEach(r => console.log(`  - ${r.route} (${r.statusCode})`));

    console.log('');
    console.log('🔧 Fix suggestions:');
    console.log('  1. Check middleware.ts configuration');
    console.log('  2. Verify DebugWrapper is used');
    console.log('  3. Ensure NODE_ENV=production in deployment');

    process.exit(1);
  }
}

main().catch(console.error);