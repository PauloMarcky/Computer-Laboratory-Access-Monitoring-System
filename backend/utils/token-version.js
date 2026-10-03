function isCurrentTokenVersion(tokenVersion, currentVersion) {
  const version = Number(tokenVersion ?? 0);
  return Number.isSafeInteger(version) && version === currentVersion;
}

module.exports = { isCurrentTokenVersion };