export function isValidMongoDbName(name) {
  if (typeof name !== 'string' || name.length === 0) return false;

  const forbiddenChars = /[\/\\\."$]/;
  const byteLength = Buffer.byteLength(name, 'utf8');

  return !forbiddenChars.test(name) && byteLength <= 64;
}

// TODO: make a fix / replace with hash if fails function
