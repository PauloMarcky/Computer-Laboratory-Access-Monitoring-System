const STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
const ALLOWED_TRANSITIONS = {
  PENDING: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED'],
  RESOLVED: [],
  REJECTED: [],
};

function canTransitionIssueStatus(current, next) {
  return current === next || Boolean(ALLOWED_TRANSITIONS[current]?.includes(next));
}

module.exports = { STATUSES, canTransitionIssueStatus };