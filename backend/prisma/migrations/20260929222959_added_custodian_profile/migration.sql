/*
  Warnings:

  - You are about to drop the `custodian_profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `custodian_profiles` DROP FOREIGN KEY `custodian_profiles_custodian_id_fkey`;

-- DropTable
DROP TABLE `custodian_profiles`;
