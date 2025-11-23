import knex from 'knex';
import knexfile from '../knexfile.js';

const db = knex(knexfile[process.env.NODE_ENV || 'development']);

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('Usage: node scripts/create-admin.js <email> <password> <name>');
    process.exit(1);
  }
  const [email, password, ...nameParts] = args;
  const name = nameParts.join(' ');

  const existingAdmin = await db('users').where({ role: 'admin' }).first();
  if (existingAdmin) {
    console.log('An admin already exists (id=' + existingAdmin.id + '). Aborting.');
    process.exit(1);
  }

  const [id] = await db('users').insert({ name, email, password, role: 'admin' });
  console.log('Created admin user with id:', id);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
