function isCurrentTokenVersion(tokenVersion, currentVersion) {
  const version = Number(tokenVersion ?? 0);
  const current = Number(currentVersion ?? 0);
  return Number.isSafeInteger(version) && Number.isSafeInteger(current) && version === current;
}

module.exports = { isCurrentTokenVersion };