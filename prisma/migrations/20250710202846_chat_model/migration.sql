-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "model" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "lastPrompt" TEXT,
    "lastResponse" TEXT,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);
