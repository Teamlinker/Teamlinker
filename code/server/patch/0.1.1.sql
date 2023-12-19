CREATE TABLE `teamlinker`.`plan`  (
  `id` bigint NOT NULL,
  `name` varchar(65) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `start_time` timestamp NOT NULL,
  `organization_user_id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  `organization_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id_UNIQUE`(`id` ASC) USING BTREE,
  INDEX `organization_user_id`(`organization_user_id` ASC) USING BTREE,
  INDEX `project_id`(`project_id` ASC) USING BTREE,
  INDEX `organization_id`(`organization_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

CREATE TABLE `teamlinker`.`plan_table`  (
  `id` bigint NOT NULL,
  `sort` tinyint UNSIGNED NOT NULL,
  `type` tinyint NOT NULL,
  `name` varchar(65) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `ref_id` bigint NULL DEFAULT NULL,
  `progress` tinyint NULL DEFAULT NULL,
  `depend_id` bigint NULL DEFAULT NULL,
  `delay` int NULL DEFAULT NULL,
  `parent_id` bigint NULL DEFAULT NULL,
  `plan_id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id_UNIQUE`(`id` ASC) USING BTREE,
  INDEX `sort`(`sort` ASC) USING BTREE,
  INDEX `ref_id`(`ref_id` ASC) USING BTREE,
  INDEX `depend_id`(`depend_id` ASC) USING BTREE,
  INDEX `parent_id`(`parent_id` ASC) USING BTREE,
  INDEX `plan_id`(`plan_id` ASC) USING BTREE,
  INDEX `project_id`(`project_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

ALTER TABLE `teamlinker`.`project_issue` ADD COLUMN `man_day` int NULL DEFAULT 1 AFTER `unique_id`;

ALTER TABLE `teamlinker`.`user` ADD COLUMN `from_type` tinyint NULL DEFAULT 0 AFTER `count`;

ALTER TABLE `teamlinker`.`user` ADD COLUMN `from_id` varchar(65) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL AFTER `from_type`;

ALTER TABLE `teamlinker`.`user` ADD UNIQUE INDEX `from_id_UNIQUE`(`from_id` ASC) USING BTREE;

ALTER TABLE `teamlinker`.`user` ADD INDEX `from_id`(`from_id` ASC) USING BTREE;