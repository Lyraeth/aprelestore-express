/*
  Warnings:

  - You are about to drop the column `name` on the `plan` table. All the data in the column will be lost.
  - Added the required column `duration` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Plan_name_key` ON `plan`;

-- AlterTable
ALTER TABLE `plan` DROP COLUMN `name`,
    ADD COLUMN `duration` VARCHAR(191) NOT NULL;
