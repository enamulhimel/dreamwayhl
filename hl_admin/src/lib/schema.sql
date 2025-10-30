-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 17, 2025 at 12:01 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hl`
--

-- --------------------------------------------------------

--
-- Table structure for table `agent`
--

CREATE TABLE `agent` (
  `id` int(11) NOT NULL,
  `agent_name` varchar(100) NOT NULL,
  `agent_image` longblob NOT NULL,
  `agent_number` int(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `amenities`
--

CREATE TABLE `amenities` (
  `id` int(11) NOT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `beds` int(11) DEFAULT NULL,
  `baths` int(11) DEFAULT NULL,
  `balconies` int(11) DEFAULT NULL,
  `drawing` tinyint(1) DEFAULT NULL,
  `dining` tinyint(1) DEFAULT NULL,
  `kitchen` tinyint(1) DEFAULT NULL,
  `family_living` tinyint(1) DEFAULT NULL,
  `servant_bed` tinyint(1) DEFAULT NULL,
  `Car Parking` tinyint(1) DEFAULT NULL,
  `Servant Bed` tinyint(1) DEFAULT NULL,
  `Sub-station` tinyint(1) DEFAULT NULL,
  `Generator` tinyint(1) DEFAULT NULL,
  `Elevator` tinyint(1) DEFAULT NULL,
  `CC Camera` tinyint(1) DEFAULT NULL,
  `Conference Room` tinyint(1) DEFAULT NULL,
  `Health Club` tinyint(1) DEFAULT NULL,
  `Prayer Zone` tinyint(1) DEFAULT NULL,
  `BBQ Zone` tinyint(1) DEFAULT NULL,
  `Child Corner` tinyint(1) DEFAULT NULL,
  `Gardening` tinyint(1) DEFAULT NULL,
  `Swimming Pool` tinyint(1) DEFAULT NULL,
  `Fountain` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='amenities';

-- --------------------------------------------------------

--
-- Table structure for table `contact`
--

CREATE TABLE `contact` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `email` varchar(200) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `subject` varchar(300) DEFAULT NULL,
  `message` varchar(3000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `newsletter`
--

CREATE TABLE `newsletter` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `properties`
--

CREATE TABLE `properties` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `home_serial` int(2) NOT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `img_thub` longblob DEFAULT NULL,
  `img_hero` longblob DEFAULT NULL,
  `img1` longblob DEFAULT NULL,
  `img2` longblob DEFAULT NULL,
  `img3` longblob DEFAULT NULL,
  `img4` longblob DEFAULT NULL,
  `img5` longblob DEFAULT NULL,
  `video1` varchar(300) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `land_area` varchar(50) DEFAULT NULL,
  `flat_size` varchar(100) DEFAULT NULL,
  `building_type` varchar(255) DEFAULT NULL,
  `project_status` varchar(50) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `map_src` varchar(300) DEFAULT NULL,
  `description` varchar(2000) NOT NULL,
  `typical_floor_plan` longblob DEFAULT NULL,
  `ground_floor_plan` longblob DEFAULT NULL,
  `roof_floor_plan` longblob DEFAULT NULL,
  `agent_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `id` int(11) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `image` longblob DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `project_name` varchar(100) DEFAULT NULL,
  `review` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(32) NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `visit`
--

CREATE TABLE `visit` (
  `id` int(11) NOT NULL,
  `property_name` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `message` varchar(1000) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agent`
--
ALTER TABLE `agent`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `amenities`
--
ALTER TABLE `amenities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact`
--
ALTER TABLE `contact`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `newsletter`
--
ALTER TABLE `newsletter`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `properties`
--
ALTER TABLE `properties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_agent` (`agent_id`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `visit`
--
ALTER TABLE `visit`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agent`
--
ALTER TABLE `agent`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `amenities`
--
ALTER TABLE `amenities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact`
--
ALTER TABLE `contact`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `newsletter`
--
ALTER TABLE `newsletter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `properties`
--
ALTER TABLE `properties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `review`
--
ALTER TABLE `review`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `visit`
--
ALTER TABLE `visit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `amenities`
--
ALTER TABLE `amenities`
  ADD CONSTRAINT `pro_fk` FOREIGN KEY (`id`) REFERENCES `properties` (`id`);

--
-- Constraints for table `properties`
--
ALTER TABLE `properties`
  ADD CONSTRAINT `fk_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- MIGRATION: Add 'role' column, migrate is_admin, and remove is_admin
-- 1. Add the new 'role' column
ALTER TABLE users ADD COLUMN role VARCHAR(32) NOT NULL DEFAULT 'user';

-- 2. Migrate existing data: set role to 'admin' where is_admin=1, else 'user'
UPDATE users SET role = 'admin' WHERE is_admin = 1;
UPDATE users SET role = 'user' WHERE is_admin = 0;

-- 3. (Optional) Remove the is_admin column after verifying migration
-- ALTER TABLE users DROP COLUMN is_admin;

-- Update CREATE TABLE for new setups:
-- CREATE TABLE `users` (
--   `id` int(11) NOT NULL,
--   `name` varchar(255) NOT NULL,
--   `email` varchar(255) NOT NULL,
--   `password` varchar(255) NOT NULL,
--   `role` varchar(32) NOT NULL DEFAULT 'user',
--   `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
--   `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
--   PRIMARY KEY (`id`),
--   UNIQUE KEY `email` (`email`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
