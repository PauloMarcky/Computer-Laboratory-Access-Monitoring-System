-- AlterTable
ALTER TABLE `schedules` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `subjects` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;
