CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`number` int NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'WAITING',
	`guichet` int,
	`priority` int DEFAULT 0,
	`service_type` varchar(100) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`called_at` timestamp,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`)
);
