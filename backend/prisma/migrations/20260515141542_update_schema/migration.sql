BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Pet] ALTER COLUMN [avatar] NVARCHAR(max) NULL;

-- AlterTable
ALTER TABLE [dbo].[Post] ALTER COLUMN [content] NVARCHAR(max) NULL;
ALTER TABLE [dbo].[Post] ALTER COLUMN [image] NVARCHAR(max) NULL;
ALTER TABLE [dbo].[Post] ADD [coordinates] NVARCHAR(1000),
[isLostPet] BIT NOT NULL CONSTRAINT [Post_isLostPet_df] DEFAULT 0,
[lastSeenLocation] NVARCHAR(1000),
[lostDate] DATETIME2,
[reward] NVARCHAR(1000),
[sharedPostId] INT;

-- AlterTable
ALTER TABLE [dbo].[User] ALTER COLUMN [avatar] NVARCHAR(max) NULL;
ALTER TABLE [dbo].[User] ADD [bio] NVARCHAR(max),
[coverImage] NVARCHAR(max),
[isDeactivated] BIT NOT NULL CONSTRAINT [User_isDeactivated_df] DEFAULT 0;

-- CreateTable
CREATE TABLE [dbo].[CommentReaction] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type] NVARCHAR(1000) NOT NULL CONSTRAINT [CommentReaction_type_df] DEFAULT 'LIKE',
    [userId] INT NOT NULL,
    [commentId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CommentReaction_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [CommentReaction_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [CommentReaction_userId_commentId_key] UNIQUE NONCLUSTERED ([userId],[commentId])
);

-- CreateTable
CREATE TABLE [dbo].[CoOwnerInvitation] (
    [id] INT NOT NULL IDENTITY(1,1),
    [petId] INT NOT NULL,
    [inviterId] INT NOT NULL,
    [inviteeId] INT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [CoOwnerInvitation_status_df] DEFAULT 'PENDING',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CoOwnerInvitation_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [CoOwnerInvitation_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PetDeletionRequest] (
    [id] INT NOT NULL IDENTITY(1,1),
    [petId] INT NOT NULL,
    [coOwnerId] INT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [PetDeletionRequest_status_df] DEFAULT 'PENDING',
    [requestedAt] DATETIME2 NOT NULL CONSTRAINT [PetDeletionRequest_requestedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PetDeletionRequest_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Friendship] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user1Id] INT NOT NULL,
    [user2Id] INT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Friendship_status_df] DEFAULT 'PENDING',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Friendship_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Friendship_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Friendship_user1Id_user2Id_key] UNIQUE NONCLUSTERED ([user1Id],[user2Id])
);

-- CreateTable
CREATE TABLE [dbo].[Notification] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [message] NVARCHAR(1000) NOT NULL,
    [isRead] BIT NOT NULL CONSTRAINT [Notification_isRead_df] DEFAULT 0,
    [referenceId] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Notification_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Notification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Post] ADD CONSTRAINT [Post_sharedPostId_fkey] FOREIGN KEY ([sharedPostId]) REFERENCES [dbo].[Post]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CommentReaction] ADD CONSTRAINT [CommentReaction_commentId_fkey] FOREIGN KEY ([commentId]) REFERENCES [dbo].[Comment]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CommentReaction] ADD CONSTRAINT [CommentReaction_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CoOwnerInvitation] ADD CONSTRAINT [CoOwnerInvitation_petId_fkey] FOREIGN KEY ([petId]) REFERENCES [dbo].[Pet]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CoOwnerInvitation] ADD CONSTRAINT [CoOwnerInvitation_inviterId_fkey] FOREIGN KEY ([inviterId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CoOwnerInvitation] ADD CONSTRAINT [CoOwnerInvitation_inviteeId_fkey] FOREIGN KEY ([inviteeId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PetDeletionRequest] ADD CONSTRAINT [PetDeletionRequest_petId_fkey] FOREIGN KEY ([petId]) REFERENCES [dbo].[Pet]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PetDeletionRequest] ADD CONSTRAINT [PetDeletionRequest_coOwnerId_fkey] FOREIGN KEY ([coOwnerId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Friendship] ADD CONSTRAINT [Friendship_user1Id_fkey] FOREIGN KEY ([user1Id]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Friendship] ADD CONSTRAINT [Friendship_user2Id_fkey] FOREIGN KEY ([user2Id]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
