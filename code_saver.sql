-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 17, 2020 at 03:14 PM
-- Server version: 5.7.30-0ubuntu0.18.04.1
-- PHP Version: 7.4.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `code_saver`
--
CREATE DATABASE IF NOT EXISTS `code_saver` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `code_saver`;

-- --------------------------------------------------------

--
-- Table structure for table `codeSampleMods`
--

DROP TABLE IF EXISTS `codeSampleMods`;
CREATE TABLE `codeSampleMods` (
  `id` int(11) NOT NULL,
  `codeSampleId` int(11) NOT NULL,
  `isReadPrivate` tinyint(1) NOT NULL DEFAULT '0',
  `isWritePrivate` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `codeSamples`
--

DROP TABLE IF EXISTS `codeSamples`;
CREATE TABLE `codeSamples` (
  `id` int(11) NOT NULL,
  `name` varchar(256) DEFAULT NULL,
  `authorId` int(11) NOT NULL,
  `code` text NOT NULL,
  `createdTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `editedTime` datetime DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Triggers `codeSamples`
--
DROP TRIGGER IF EXISTS `codeSamples_AFTER_INSERT`;
DELIMITER $$
CREATE TRIGGER `codeSamples_AFTER_INSERT` AFTER INSERT ON `codeSamples` FOR EACH ROW BEGIN
	INSERT INTO `codeSampleMods` SET codeSampleId = NEW.id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `codeSamplesHistory`
--

DROP TABLE IF EXISTS `codeSamplesHistory`;
CREATE TABLE `codeSamplesHistory` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `codeSampleId` int(11) NOT NULL,
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` smallint(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
CREATE TABLE `files` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(64) DEFAULT NULL,
  `secondName` varchar(64) DEFAULT NULL,
  `registeredTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `login` varchar(128) NOT NULL,
  `password` varchar(128) NOT NULL,
  `avatars` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `codeSampleMods`
--
ALTER TABLE `codeSampleMods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `codeSampleMods_codeSampleId` (`codeSampleId`);

--
-- Indexes for table `codeSamples`
--
ALTER TABLE `codeSamples`
  ADD PRIMARY KEY (`id`),
  ADD KEY `codeSamples_authorId` (`authorId`) USING BTREE;

--
-- Indexes for table `codeSamplesHistory`
--
ALTER TABLE `codeSamplesHistory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `codeSamples_userId` (`userId`),
  ADD KEY `codeSamples_codeSampleId` (`codeSampleId`),
  ADD KEY `codeSampleId` (`id`);

--
-- Indexes for table `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `path` (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `login` (`login`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `codeSampleMods`
--
ALTER TABLE `codeSampleMods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `codeSamples`
--
ALTER TABLE `codeSamples`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `codeSamplesHistory`
--
ALTER TABLE `codeSamplesHistory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `codeSampleMods`
--
ALTER TABLE `codeSampleMods`
  ADD CONSTRAINT `codeSampleMods_codeSampleId` FOREIGN KEY (`codeSampleId`) REFERENCES `codeSamples` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `codeSamples`
--
ALTER TABLE `codeSamples`
  ADD CONSTRAINT `code_samples_author_id` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `codeSamplesHistory`
--
ALTER TABLE `codeSamplesHistory`
  ADD CONSTRAINT `codeSamples_codeSampleId` FOREIGN KEY (`codeSampleId`) REFERENCES `codeSamples` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `codeSamples_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
