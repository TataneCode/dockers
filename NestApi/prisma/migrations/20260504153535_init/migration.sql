-- CreateTable
CREATE TABLE `heroes` (
    `id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `alias` VARCHAR(200) NOT NULL,
    `origin` VARCHAR(300) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `powers` (
    `id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `level` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hero_powers` (
    `heroId` VARCHAR(64) NOT NULL,
    `powerId` VARCHAR(64) NOT NULL,
    `position` INTEGER NOT NULL,

    INDEX `hero_powers_heroId_position_idx`(`heroId`, `position`),
    INDEX `hero_powers_powerId_idx`(`powerId`),
    PRIMARY KEY (`heroId`, `powerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hero_powers` ADD CONSTRAINT `hero_powers_heroId_fkey` FOREIGN KEY (`heroId`) REFERENCES `heroes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hero_powers` ADD CONSTRAINT `hero_powers_powerId_fkey` FOREIGN KEY (`powerId`) REFERENCES `powers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
