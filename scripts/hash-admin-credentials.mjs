import { createHash } from 'node:crypto';
import { stdin, stdout } from 'node:process';

const salt = process.env.PII_HASH_SALT;
if (!salt) {
  console.error('Set PII_HASH_SALT through your secret manager before running this script.');
  process.exit(1);
}
if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
  console.error('Run this script in an interactive terminal so credentials can be hidden.');
  process.exit(1);
}

function promptHidden(label) {
  stdout.write(label);
  stdin.setRawMode(true);
  stdin.resume();

  return new Promise((resolve, reject) => {
    let value = '';
    const onData = chunk => {
      for (const character of chunk.toString('utf8')) {
        if (character === '\u0003') {
          stdin.setRawMode(false);
          stdin.removeListener('data', onData);
          stdout.write('\n');
          reject(new Error('Cancelled.'));
          return;
        }
        if (character === '\r' || character === '\n') {
          stdin.setRawMode(false);
          stdin.removeListener('data', onData);
          stdout.write('\n');
          resolve(value);
          return;
        }
        if (character === '\u007f' || character === '\b') {
          if (value.length) {
            value = value.slice(0, -1);
            stdout.write('\b \b');
          }
          continue;
        }
        if (character >= ' ') {
          value += character;
          stdout.write('*');
        }
      }
    };
    stdin.on('data', onData);
  });
}

function hash(value) {
  return createHash('sha256')
    .update(`${salt}${String(value).trim().toUpperCase()}`)
    .digest('hex');
}

try {
  const mobile = await promptHidden('Administrator mobile: ');
  const pin = await promptHidden('Administrator PIN: ');
  if (!mobile.trim() || !pin.trim()) throw new Error('Both values are required.');
  console.log(`ADMIN_MOBILE_HASH=${hash(mobile)}`);
  console.log(`ADMIN_PIN_HASH=${hash(pin)}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
