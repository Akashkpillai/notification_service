/*
  Warnings:

  - The `otp_expiry` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "otp_expiry",
ADD COLUMN     "otp_expiry" TIMESTAMP(3);
