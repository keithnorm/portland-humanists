/**
 * Drupal 7 password hash verification, for the lazy-migration auth bridge.
 *
 * D7 hashes look like `$S$D<8-char salt><43-char digest>` (55 chars total):
 * an iterated, salted SHA-512 with Drupal's custom base64 alphabet.
 * Accounts migrated from Drupal 6 are prefixed `U` and were re-hashed from
 * the MD5 of the original password.
 *
 * Port of includes/password.inc (_password_crypt / _password_base64_encode).
 */
import { createHash, timingSafeEqual } from 'node:crypto';

const ITOA64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const HASH_LENGTH = 55;

function drupalBase64(input: Buffer): string {
  const count = input.length;
  let output = '';
  let i = 0;
  do {
    let value = input[i++];
    output += ITOA64[value & 0x3f];
    if (i < count) value |= input[i] << 8;
    output += ITOA64[(value >> 6) & 0x3f];
    if (i++ >= count) break;
    if (i < count) value |= input[i] << 16;
    output += ITOA64[(value >> 12) & 0x3f];
    if (i++ >= count) break;
    output += ITOA64[(value >> 18) & 0x3f];
  } while (i < count);
  return output;
}

export function hashDrupalPassword(password: string, setting: string): string | null {
  // setting = "$S$" + iterations char + 8-char salt (first 12 chars of a hash)
  if (!setting.startsWith('$S$')) return null;
  const countLog2 = ITOA64.indexOf(setting[3]);
  if (countLog2 < 7 || countLog2 > 30) return null;
  const salt = setting.slice(4, 12);
  if (salt.length !== 8) return null;

  const pwd = Buffer.from(password, 'utf8');
  let digest = createHash('sha512').update(Buffer.concat([Buffer.from(salt, 'utf8'), pwd])).digest();
  const rounds = 1 << countLog2;
  for (let i = 0; i < rounds; i++) {
    digest = createHash('sha512').update(Buffer.concat([digest, pwd])).digest();
  }
  return (setting.slice(0, 12) + drupalBase64(digest)).slice(0, HASH_LENGTH);
}

export function verifyDrupalPassword(password: string, storedHash: string): boolean {
  let hash = storedHash;
  let pwd = password;
  if (hash.startsWith('U$')) {
    // Drupal 6 account migrated by update.php: stored hash is of md5(password)
    hash = hash.slice(1);
    pwd = createHash('md5').update(password, 'utf8').digest('hex');
  }
  if (!hash.startsWith('$S$') || hash.length !== HASH_LENGTH) return false;

  const computed = hashDrupalPassword(pwd, hash);
  if (!computed || computed.length !== hash.length) return false;
  return timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}
