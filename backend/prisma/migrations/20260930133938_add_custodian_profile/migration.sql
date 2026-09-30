-- CreateTable
CREATE TABLE `custodian_profiles` (
    `custodian_profile_id` INTEGER NOT NULL AUTO_INCREMENT,
    `custodian_id` INTEGER NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `custodian_profiles_custodian_id_key`(`custodian_id`),
    PRIMARY KEY (`custodian_profile_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `custodian_profiles` ADD CONSTRAINT `custodian_profiles_custodian_id_fkey` FOREIGN KEY (`custodian_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
