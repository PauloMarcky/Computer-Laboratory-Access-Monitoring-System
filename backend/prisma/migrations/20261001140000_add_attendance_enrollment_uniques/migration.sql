DELETE newer
FROM `class_enrollment` AS newer
JOIN `class_enrollment` AS older
  ON older.`student_profile_id` = newer.`student_profile_id`
  AND older.`schedule_id` = newer.`schedule_id`
  AND older.`class_enrollment_id` < newer.`class_enrollment_id`;

DELETE newer
FROM `attendance_log` AS newer
JOIN `attendance_log` AS older
  ON older.`student_profile_id` = newer.`student_profile_id`
  AND older.`active_session_id` = newer.`active_session_id`
  AND older.`attendance_log_id` < newer.`attendance_log_id`;

ALTER TABLE `class_enrollment`
ADD CONSTRAINT `class_enrollment_student_schedule_key`
UNIQUE (`student_profile_id`, `schedule_id`);

ALTER TABLE `attendance_log`
ADD CONSTRAINT `attendance_log_student_session_key`
UNIQUE (`student_profile_id`, `active_session_id`);