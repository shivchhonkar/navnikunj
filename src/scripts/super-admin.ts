import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getPool, query } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { findUserByUsername } from '@/lib/records';

function loadEnv() {
  let text = '';
  try {
    text = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
  } catch {
    return;
  }
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function arg(name: string) {
  const flag = `--${name}`;
  const index = process.argv.indexOf(flag);
  if (index >= 0 && process.argv[index + 1] && !process.argv[index + 1].startsWith('--')) return process.argv[index + 1];
  const inline = process.argv.find((item) => item.startsWith(`${flag}=`));
  return inline ? inline.slice(flag.length + 1) : '';
}

function value(flag: string, envName: string) {
  return arg(flag) || process.env[envName] || '';
}

async function main() {
  loadEnv();
  const username = value('username', 'SUPERADMIN_USERNAME').trim().toLowerCase();
  const password = value('password', 'SUPERADMIN_PASSWORD');
  const name = value('name', 'SUPERADMIN_NAME').trim();
  const email = value('email', 'SUPERADMIN_EMAIL').trim();

  if (!username) {
    console.error('Usage: npm run super-admin -- --username superadmin --password "at least 8 characters" [--name "Super Admin"] [--email you@example.com]');
    console.error('Run the same command again to update that account. Leave --password out to keep the current password.');
    process.exitCode = 1;
    return;
  }
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
    console.error('Username must be 3–40 letters, numbers, dots, or dashes.');
    process.exitCode = 1;
    return;
  }

  const existing = await findUserByUsername(username);
  if (!existing && password.length < 8) {
    console.error('Password must be at least 8 characters when creating a super administrator.');
    process.exitCode = 1;
    return;
  }
  if (password && password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exitCode = 1;
    return;
  }

  if (existing) {
    await query(
      `UPDATE users
       SET display_name = $2, email = $3, role = 'superAdmin', active = TRUE,
           password_hash = CASE WHEN $4 = '' THEN password_hash ELSE $4 END
       WHERE id = $1`,
      [existing.id, name || existing.displayName || username, email || existing.email, password ? hashPassword(password) : ''],
    );
    console.log(`Updated super administrator "${username}".`);
    return;
  }

  const id = `user_${randomBytes(4).toString('hex')}`;
  await query(
    `INSERT INTO users (id, username, password_hash, display_name, email, role, active)
     VALUES ($1, $2, $3, $4, $5, 'superAdmin', TRUE)`,
    [id, username, hashPassword(password), name || username, email],
  );
  console.log(`Created super administrator "${username}".`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'The super administrator could not be saved.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPool().end().catch(() => undefined);
  });
