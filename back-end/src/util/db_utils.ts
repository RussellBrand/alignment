// TODO: should compare against a list of good chars instead of bad chars

export function isValidMongoDbName(name: string): boolean {
  if (name.length === 0) return false;

  const forbiddenChars = /[\/\\\."$]/;
  const byteLength = Buffer.byteLength(name, "utf8");

  return !forbiddenChars.test(name) && byteLength <= 64;
}

// TODO: make a fix / replace with hash if fails function
