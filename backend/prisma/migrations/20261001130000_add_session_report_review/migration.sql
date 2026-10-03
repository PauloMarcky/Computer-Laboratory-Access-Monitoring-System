ALTER TABLE `active_session`
ADD COLUMN `report_status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
ADD COLUMN `report_remarks` TEXT NULL;