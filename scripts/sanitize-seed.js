#!/usr/bin/env node
/**
 * Remove secrets from Ghost export before committing to the demo repo.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'content-seed', 'demo-posts.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const secretKeys = new Set([
  'ghost_private_key',
  'members_private_key',
  'members_email_auth_secret',
  'members_otc_secret',
  'admin_session_secret',
  'theme_session_secret',
]);

for (const db of data.db || []) {
  if (db.data?.settings) {
    db.data.settings = db.data.settings.filter((s) => !secretKeys.has(s.key));
  }
  if (db.data?.users) {
    for (const user of db.data.users) {
      delete user.password;
      user.email = 'demo@example.com';
    }
  }
}

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Sanitized content-seed/demo-posts.json');
