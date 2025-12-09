import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export function generateApiKey() {
  return randomBytes(32).toString('hex');
}

export function generateReference() {
  return `ref_${uuidv4()}`;
}
