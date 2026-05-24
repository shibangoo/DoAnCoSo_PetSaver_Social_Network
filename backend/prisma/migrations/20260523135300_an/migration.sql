BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Post] ADD [feeling] NVARCHAR(255);

-- AlterTable
ALTER TABLE [dbo].[User] ADD [bannedAt] DATETIME2,
[createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[status] NVARCHAR(1000) NOT NULL CONSTRAINT [User_status_df] DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE [dbo].[Report] (
    [id] INT NOT NULL IDENTITY(1,1),
    [reporterId] INT NOT NULL,
    [targetType] NVARCHAR(1000) NOT NULL,
    [targetId] INT NOT NULL,
    [reason] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Report_status_df] DEFAULT 'PENDING',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Report_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Report_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AuditLog] (
    [id] INT NOT NULL IDENTITY(1,1),
    [adminId] INT NOT NULL,
    [action] NVARCHAR(1000) NOT NULL,
    [details] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AuditLog_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [AuditLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Conversation] (
    [id] INT NOT NULL IDENTITY(1,1),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Conversation_status_df] DEFAULT 'PENDING',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Conversation_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Conversation_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ConversationParticipant] (
    [id] INT NOT NULL IDENTITY(1,1),
    [conversationId] INT NOT NULL,
    [userId] INT NOT NULL,
    [hasMuted] BIT NOT NULL CONSTRAINT [ConversationParticipant_hasMuted_df] DEFAULT 0,
    CONSTRAINT [ConversationParticipant_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ConversationParticipant_conversationId_userId_key] UNIQUE NONCLUSTERED ([conversationId],[userId])
);

-- CreateTable
CREATE TABLE [dbo].[Message] (
    [id] INT NOT NULL IDENTITY(1,1),
    [conversationId] INT NOT NULL,
    [senderId] INT NOT NULL,
    [content] NVARCHAR(max),
    [image] NVARCHAR(max),
    [isRead] BIT NOT NULL CONSTRAINT [Message_isRead_df] DEFAULT 0,
    [isEmergency] BIT NOT NULL CONSTRAINT [Message_isEmergency_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Message_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Message_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Report] ADD CONSTRAINT [Report_reporterId_fkey] FOREIGN KEY ([reporterId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AuditLog] ADD CONSTRAINT [AuditLog_adminId_fkey] FOREIGN KEY ([adminId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ConversationParticipant] ADD CONSTRAINT [ConversationParticipant_conversationId_fkey] FOREIGN KEY ([conversationId]) REFERENCES [dbo].[Conversation]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ConversationParticipant] ADD CONSTRAINT [ConversationParticipant_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_conversationId_fkey] FOREIGN KEY ([conversationId]) REFERENCES [dbo].[Conversation]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Message] ADD CONSTRAINT [Message_senderId_fkey] FOREIGN KEY ([senderId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
