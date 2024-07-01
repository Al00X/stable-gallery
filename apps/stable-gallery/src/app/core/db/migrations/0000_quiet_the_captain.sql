CREATE TABLE `entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text NOT NULL,
	`seed` text,
	`prompt` text,
	`negative_prompt` text,
	`sampler` text,
	`cfg` integer,
	`steps` integer,
	`width` integer,
	`height` integer,
	`model_hash` text,
	`model_name` text,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `stats` (
	`id` integer PRIMARY KEY NOT NULL,
	`favorite` integer DEFAULT false,
	`nsfw` integer DEFAULT false,
	FOREIGN KEY (`id`) REFERENCES `entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `entries_path_unique` ON `entries` (`path`);