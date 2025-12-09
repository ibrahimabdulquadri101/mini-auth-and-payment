export function computeExpiry(expiry: '1H'|'1D'|'1M'|'1Y') {
  const now = new Date();
  switch (expiry) {
    case '1H': now.setHours(now.getHours() + 1); break;
    case '1D': now.setDate(now.getDate() + 1); break;
    case '1M': now.setMonth(now.getMonth() + 1); break;
    case '1Y': now.setFullYear(now.getFullYear() + 1); break;
    default: throw new Error('Invalid expiry token');
  }
  return now;
}
