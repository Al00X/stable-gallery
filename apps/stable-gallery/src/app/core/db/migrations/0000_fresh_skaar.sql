CREATE TABLE `entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text NOT NULL,
	`seed` text,
	`sampler` text,
	`cfg` integer,
	`clip_skip` integer,
	`steps` integer,
	`width` integer,
	`height` integer,
	`model_hash` text,
	`model_name` text,
	`added_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `images_to_tags` (
	`image_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	`is_negative` integer DEFAULT false,
	FOREIGN KEY (`image_id`) REFERENCES `entries`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stats` (
	`id` integer PRIMARY KEY NOT NULL,
	`favorite` integer DEFAULT false,
	`nsfw` integer DEFAULT false,
	FOREIGN KEY (`id`) REFERENCES `entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `entries_path_unique` ON `entries` (`path`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);