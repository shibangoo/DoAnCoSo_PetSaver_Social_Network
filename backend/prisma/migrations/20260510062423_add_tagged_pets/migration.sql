BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [displayName] NVARCHAR(1000),
    [avatar] NVARCHAR(1000),
    [dob] DATETIME2,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'USER',
    [accountType] NVARCHAR(1000) NOT NULL CONSTRAINT [User_accountType_df] DEFAULT 'PERSONAL',
    [petLimit] INT NOT NULL CONSTRAINT [User_petLimit_df] DEFAULT 5,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[TagBlock] (
    [id] INT NOT NULL IDENTITY(1,1),
    [blockerId] INT NOT NULL,
    [blockedId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TagBlock_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [TagBlock_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TagBlock_blockerId_blockedId_key] UNIQUE NONCLUSTERED ([blockerId],[blockedId])
);

-- CreateTable
CREATE TABLE [dbo].[Pet] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000),
    [avatar] NVARCHAR(1000),
    [species] NVARCHAR(1000),
    [breed] NVARCHAR(1000),
    [age] INT,
    [healthStatus] NVARCHAR(1000),
    [ownerId] INT NOT NULL,
    [coOwnerId] INT,
    [shelterId] INT,
    [isAdopted] BIT NOT NULL CONSTRAINT [Pet_isAdopted_df] DEFAULT 0,
    [deletedAt] DATETIME2,
    [isPermanentlyDeleted] BIT NOT NULL CONSTRAINT [Pet_isPermanentlyDeleted_df] DEFAULT 0,
    [requireTagApproval] BIT NOT NULL CONSTRAINT [Pet_requireTagApproval_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Pet_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Pet_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Post] (
    [id] INT NOT NULL IDENTITY(1,1),
    [content] NVARCHAR(1000),
    [image] NVARCHAR(1000),
    [authorId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Post_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Post_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PostTag] (
    [id] INT NOT NULL IDENTITY(1,1),
    [postId] INT NOT NULL,
    [petId] INT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [PostTag_status_df] DEFAULT 'PENDING',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PostTag_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PostTag_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PostTag_postId_petId_key] UNIQUE NONCLUSTERED ([postId],[petId])
);

-- CreateTable
CREATE TABLE [dbo].[Reaction] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type] NVARCHAR(1000) NOT NULL,
    [userId] INT NOT NULL,
    [postId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Reaction_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Reaction_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Reaction_userId_postId_key] UNIQUE NONCLUSTERED ([userId],[postId])
);

-- CreateTable
CREATE TABLE [dbo].[Comment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [content] NVARCHAR(1000) NOT NULL,
    [userId] INT NOT NULL,
    [postId] INT NOT NULL,
    [parentId] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Comment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Comment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[TagBlock] ADD CONSTRAINT [TagBlock_blockerId_fkey] FOREIGN KEY ([blockerId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TagBlock] ADD CONSTRAINT [TagBlock_blockedId_fkey] FOREIGN KEY ([blockedId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Pet] ADD CONSTRAINT [Pet_ownerId_fkey] FOREIGN KEY ([ownerId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Pet] ADD CONSTRAINT [Pet_coOwnerId_fkey] FOREIGN KEY ([coOwnerId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Pet] ADD CONSTRAINT [Pet_shelterId_fkey] FOREIGN KEY ([shelterId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Post] ADD CONSTRAINT [Post_authorId_fkey] FOREIGN KEY ([authorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PostTag] ADD CONSTRAINT [PostTag_postId_fkey] FOREIGN KEY ([postId]) REFERENCES [dbo].[Post]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PostTag] ADD CONSTRAINT [PostTag_petId_fkey] FOREIGN KEY ([petId]) REFERENCES [dbo].[Pet]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Reaction] ADD CONSTRAINT [Reaction_postId_fkey] FOREIGN KEY ([postId]) REFERENCES [dbo].[Post]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Reaction] ADD CONSTRAINT [Reaction_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Comment] ADD CONSTRAINT [Comment_parentId_fkey] FOREIGN KEY ([parentId]) REFERENCES [dbo].[Comment]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Comment] ADD CONSTRAINT [Comment_postId_fkey] FOREIGN KEY ([postId]) REFERENCES [dbo].[Post]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Comment] ADD CONSTRAINT [Comment_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
