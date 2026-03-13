-- Internlink Complete Database Schema
-- Last Updated: 2026-03-13

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for users
-- ----------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `fullname` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20),
    `bio` TEXT,
    `linkedin` VARCHAR(255),
    `github` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for user_academic_info
-- ----------------------------
CREATE TABLE IF NOT EXISTS `user_academic_info` (
    `user_id` INT PRIMARY KEY,
    `technical_field` VARCHAR(100),
    `academic_level` VARCHAR(100),
    `institution` VARCHAR(150),
    CONSTRAINT `fk_academic_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for user_job_preferences
-- ----------------------------
CREATE TABLE IF NOT EXISTS `user_job_preferences` (
    `user_id` INT PRIMARY KEY,
    `opportunity_type` VARCHAR(50),
    `work_preference` VARCHAR(50),
    `relocation` VARCHAR(10),
    CONSTRAINT `fk_pref_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for user_skills
-- ----------------------------
CREATE TABLE IF NOT EXISTS `user_skills` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `skill_name` VARCHAR(100),
    CONSTRAINT `fk_skill_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for user_tools
-- ----------------------------
CREATE TABLE IF NOT EXISTS `user_tools` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `tool_name` VARCHAR(100),
    CONSTRAINT `fk_tool_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for opportunities
-- ----------------------------
CREATE TABLE IF NOT EXISTS `opportunities` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `company` VARCHAR(100) NOT NULL,
    `location` VARCHAR(100),
    `type` ENUM('Internship', 'Industrial Attachment', 'Graduate Program', 'Volunteering'),
    `work_type` ENUM('Remote', 'On-site', 'Hybrid'),
    `description` TEXT,
    `bg_color` VARCHAR(50) DEFAULT 'bg-emerald-500',
    `text_color` VARCHAR(50) DEFAULT 'text-emerald-500',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for applications
-- ----------------------------
CREATE TABLE IF NOT EXISTS `applications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `opportunity_id` INT,
    `cover_letter` TEXT,
    `status` ENUM('Pending', 'Reviewed', 'Accepted', 'Declined') DEFAULT 'Pending',
    `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_app_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_app_opportunity` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `message` TEXT NOT NULL,
    `type` VARCHAR(50), 
    `is_read` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
