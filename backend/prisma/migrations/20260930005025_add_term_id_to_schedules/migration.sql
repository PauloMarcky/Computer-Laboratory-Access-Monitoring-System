-- AlterTable
ALTER TABLE `schedules` ADD COLUMN `term_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_term_id_fkey` FOREIGN KEY (`term_id`) REFERENCES `terms`(`term_id`) ON DELETE SET NULL ON UPDATE CASCADE;
