-- CreateEnum
CREATE TYPE "WorkspaceMemberStatus" AS ENUM ('PENDING', 'ACTIVE');

-- AlterTable
ALTER TABLE "WorkspaceMember" ADD COLUMN     "status" "WorkspaceMemberStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "WorkspaceMember_workspaceId_status_idx" ON "WorkspaceMember"("workspaceId", "status");
