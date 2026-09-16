import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function run(cmd: string) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

function copyDirRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function main() {
  console.log('=== Step 1: Preparing SQLite schema for Standalone Electron build ===');
  const schemaPath = path.resolve('prisma', 'schema.prisma');
  const envPath = path.resolve('.env');

  const originalSchema = fs.readFileSync(schemaPath, 'utf-8');
  const originalEnv = fs.readFileSync(envPath, 'utf-8');

  try {
    // Switch to SQLite for the standalone desktop build
    const sqliteSchema = originalSchema.replace(
      /provider\s*=\s*"postgresql"/,
      'provider = "sqlite"'
    );
    fs.writeFileSync(schemaPath, sqliteSchema, 'utf-8');
    fs.writeFileSync(envPath, 'DATABASE_URL="file:./dev.db"\n', 'utf-8');

    console.log('=== Step 2: Generating Prisma Client for SQLite ===');
    run('npx prisma generate');

    console.log('=== Step 3: Building Next.js Standalone ===');
    run('npx next build');

    console.log('=== Step 4: Copying Static Assets into Standalone output ===');
    const standaloneDir = path.resolve('.next', 'standalone');
    const staticSrc = path.resolve('.next', 'static');
    const staticDest = path.join(standaloneDir, '.next', 'static');
    const publicSrc = path.resolve('public');
    const publicDest = path.join(standaloneDir, 'public');

    copyDirRecursive(staticSrc, staticDest);
    copyDirRecursive(publicSrc, publicDest);

    // Copy dev.db.bak to standalone prisma directory
    const standalonePrismaDir = path.join(standaloneDir, 'prisma');
    if (!fs.existsSync(standalonePrismaDir)) {
      fs.mkdirSync(standalonePrismaDir, { recursive: true });
    }
    const devDbBak = path.resolve('prisma', 'dev.db.bak');
    if (fs.existsSync(devDbBak)) {
      fs.copyFileSync(devDbBak, path.join(standalonePrismaDir, 'dev.db'));
    }

    console.log('=== Step 5: Packaging with electron-builder ===');
    run('npx electron-builder --win --x64');

    console.log('\n============================================================');
    console.log('🎉 SUCCESS! Windows Installer (.exe) generated in dist/ folder!');
    console.log('============================================================\n');
  } finally {
    console.log('=== Restoring original PostgreSQL configuration for workspace ===');
    fs.writeFileSync(schemaPath, originalSchema, 'utf-8');
    fs.writeFileSync(envPath, originalEnv, 'utf-8');
    run('npx prisma generate');
    console.log('Original PostgreSQL configuration restored.');
  }
}

main().catch((err) => {
  console.error('Build Electron Error:', err);
  process.exit(1);
});