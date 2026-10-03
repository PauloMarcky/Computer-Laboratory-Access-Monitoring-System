-- RenameIndex
ALTER TABLE `attendance_log` RENAME INDEX `attendance_log_student_session_key` TO `attendance_log_student_profile_id_active_session_id_key`;

-- RenameIndex
ALTER TABLE `class_enrollment` RENAME INDEX `class_enrollment_student_schedule_key` TO `class_enrollment_student_profile_id_schedule_id_key`;
