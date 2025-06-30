/*
  Warnings:

  - You are about to drop the column `isBlocked` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailverified` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "isBlocked",
DROP COLUMN "isEmailverified",
ADD COLUMN     "is_blocked" BOOLEAN DEFAULT false,
ADD COLUMN     "is_email_verified" BOOLEAN DEFAULT false;
