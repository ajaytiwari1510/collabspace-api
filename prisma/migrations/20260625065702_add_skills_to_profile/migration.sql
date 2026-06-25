-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
