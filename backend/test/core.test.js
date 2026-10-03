const test = require('node:test');
const assert = require('node:assert/strict');
const authorize = require('../middleware/authorize');
const { canTransitionIssueStatus } = require('../utils/pc-issue-status');
const { findScheduleConflict } = require('../utils/schedule-conflicts');
const { formatSchoolDate, getAttendanceStatus } = require('../utils/schedule-match');
const { isCurrentTokenVersion } = require('../utils/token-version');
const { validateStudentImportRows } = require('../utils/student-import');

function responseDouble() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('authorization allows configured roles and rejects others', () => {
  const allowResponse = responseDouble();
  let continued = false;
  authorize('ADMIN')({ user: { role: 'ADMIN' } }, allowResponse, () => { continued = true; });
  assert.equal(continued, true);

  const denyResponse = responseDouble();
  authorize('ADMIN')({ user: { role: 'STUDENT' } }, denyResponse, () => { });
  assert.equal(denyResponse.statusCode, 403);
});

test('password changes invalidate older token versions but preserve existing version-zero tokens', () => {
  assert.equal(isCurrentTokenVersion(undefined, 0), true);
  assert.equal(isCurrentTokenVersion(2, 2), true);
  assert.equal(isCurrentTokenVersion(1, 2), false);
});

test('student import validates required data and rejects duplicate school IDs', () => {
  const validStudent = {
    schoolId: '000123',
    firstName: 'Alex',
    lastName: 'Student',
    password: 'temporary-password',
    course: 'BSIT',
    yearLevel: 2,
  };
  assert.equal(validateStudentImportRows([validStudent]).students[0].schoolId, '000123');
  assert.match(
    validateStudentImportRows([validStudent, { ...validStudent, schoolId: '000123' }]).errors[0],
    /duplicated/,
  );
  assert.match(
    validateStudentImportRows([{ ...validStudent, password: 'short', yearLevel: 5 }]).errors[0],
    /password.*year level/,
  );
  assert.match(
    validateStudentImportRows([{ ...validStudent, course: '', yearLevel: null }]).errors[0],
    /course.*year level is required/,
  );
});

test('issue status transitions follow the repair workflow', () => {
  assert.equal(canTransitionIssueStatus('PENDING', 'IN_PROGRESS'), true);
  assert.equal(canTransitionIssueStatus('PENDING', 'REJECTED'), true);
  assert.equal(canTransitionIssueStatus('IN_PROGRESS', 'RESOLVED'), true);
  assert.equal(canTransitionIssueStatus('RESOLVED', 'IN_PROGRESS'), false);
  assert.equal(canTransitionIssueStatus('REJECTED', 'RESOLVED'), false);
});

test('schedule conflicts include room and instructor overlaps within the same term', () => {
  const existing = {
    scheduleId: 1,
    termId: 10,
    dayOfWeek: 'MONDAY',
    startTime: new Date('1970-01-01T10:00:00Z'),
    endTime: new Date('1970-01-01T11:00:00Z'),
    labRoomId: 2,
    instructorId: 3,
  };
  const candidate = {
    ...existing,
    scheduleId: 2,
    startTime: new Date('1970-01-01T10:30:00Z'),
    endTime: new Date('1970-01-01T11:30:00Z'),
    labRoomId: 4,
  };
  assert.ok(findScheduleConflict([existing], candidate));
  assert.equal(findScheduleConflict([existing], { ...candidate, termId: 11 }), null);
  assert.equal(findScheduleConflict([existing], { ...candidate, startTime: new Date('1970-01-01T11:00:00Z') }), null);
});

test('attendance report uses the school-local date and scheduled lateness cutoff', () => {
  const schedule = {
    startTime: new Date('1970-01-01T10:00:00Z'),
    endTime: new Date('1970-01-01T12:00:00Z'),
  };
  assert.equal(getAttendanceStatus('2026-10-01T02:29:00.000Z', schedule), 'On-Time');
  assert.equal(getAttendanceStatus('2026-10-01T02:30:00.000Z', schedule), 'Late');
  assert.equal(formatSchoolDate(new Date('2026-09-30T16:00:00.000Z')), '2026-10-01');
});
