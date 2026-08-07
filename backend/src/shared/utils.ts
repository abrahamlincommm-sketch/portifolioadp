import crypto from 'crypto';

/**
 * Generates an HMAC-MD5 signature for AliExpress TOP protocol.
 * @param appSecret The application secret.
 * @param params The sorted query parameters as a string.
 * @returns Hex uppercase signature.
 */
export function generateHmacMd5(appSecret: string, paramsStr: string): string {
  const hmac = crypto.createHmac('md5', appSecret);
  hmac.update(appSecret + paramsStr + appSecret, 'utf8');
  return hmac.digest('hex').toUpperCase();
}

/**
 * Generates an HMAC-SHA256 signature for Shopee API.
 * @param partnerKey The partner key.
 * @param message The message to sign (usually partnerId + apiPath + timestamp).
 * @returns Hex signature.
 */
export function generateHmacSha256(partnerKey: string, message: string): string {
  const hmac = crypto.createHmac('sha256', partnerKey);
  hmac.update(message, 'utf8');
  return hmac.digest('hex');
}

/**
 * Formats a Brazilian address for better readability or API compatibility.
 */
export function formatBrazilianAddress(address: any): string {
  if (!address) return '';
  const { street, number, neighborhood, city, state, zip_code } = address;
  return `${street || ''}, ${number || 'S/N'} - ${neighborhood || ''}, ${city || ''} - ${state || ''}, CEP: ${zip_code || ''}`;
}

/**
 * Pauses execution for a given number of milliseconds.
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retries a function a given number of times with exponential backoff.
 */
export async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
}
