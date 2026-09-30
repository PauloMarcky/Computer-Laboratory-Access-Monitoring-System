-- CreateTable
CREATE TABLE `instructor_subjects` (
    `instructor_subject_id` INTEGER NOT NULL AUTO_INCREMENT,
    `instructor_id` INTEGER NOT NULL,
    `subject_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `instructor_subjects_instructor_id_subject_id_key`(`instructor_id`, `subject_id`),
    PRIMARY KEY (`instructor_subject_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `instructor_subjects` ADD CONSTRAINT `instructor_subjects_instructor_id_fkey` FOREIGN KEY (`instructor_id`) REFERENCES `instructor_profiles`(`instructor_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor_subjects` ADD CONSTRAINT `instructor_subjects_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE CASCADE ON UPDATE CASCADE;
