CREATE TABLE `FormSubmissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` integer NOT NULL,
	`formId` integer NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`formId`) REFERENCES `Form`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Form` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`content` text DEFAULT '[]' NOT NULL,
	`visits` integer DEFAULT 0 NOT NULL,
	`submissions` integer DEFAULT 0 NOT NULL,
	`shareURL` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Form_shareURL_unique` ON `Form` (`shareURL`);--> statement-breakpoint
CREATE UNIQUE INDEX `Form_name_userId_unique` ON `Form` (`name`,`userId`);