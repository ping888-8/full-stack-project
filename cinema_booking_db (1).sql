-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mar. 20 jan. 2026 à 16:04
-- Version du serveur : 8.0.31
-- Version de PHP : 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `cinema_booking_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_id` int NOT NULL,
  `showtime_id` int NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_id` (`ticket_id`),
  KEY `user_id` (`user_id`),
  KEY `showtime_id` (`showtime_id`),
  KEY `idx_ticket_id` (`ticket_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `bookings`
--

INSERT INTO `bookings` (`id`, `ticket_id`, `user_id`, `showtime_id`, `total_price`, `status`, `created_at`) VALUES
(1, NULL, 3, 3, '19000.00', 'paid', '2026-01-19 14:33:27'),
(2, NULL, 3, 3, '5500.00', 'paid', '2026-01-19 14:36:46'),
(3, NULL, 3, 8, '26000.00', 'paid', '2026-01-19 14:38:18'),
(4, 'CW-M76JG6WK', 2, 1, '3500.00', 'paid', '2026-01-20 16:23:23'),
(5, 'CW-JFREYKYA', 2, 10, '20000.00', 'paid', '2026-01-20 16:28:17');

--
-- Déclencheurs `bookings`
--
DROP TRIGGER IF EXISTS `generate_ticket_id`;
DELIMITER $$
CREATE TRIGGER `generate_ticket_id` BEFORE INSERT ON `bookings` FOR EACH ROW BEGIN
  IF NEW.ticket_id IS NULL OR NEW.ticket_id = '' THEN
    SET NEW.ticket_id = CONCAT('CW-', UPPER(SUBSTRING(MD5(RAND()), 1, 8)));
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `booking_items`
--

DROP TABLE IF EXISTS `booking_items`;
CREATE TABLE IF NOT EXISTS `booking_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `seat_id` int NOT NULL,
  `seat_type` enum('normal','combo') COLLATE utf8mb4_general_ci DEFAULT 'normal',
  `seat_price` decimal(10,2) DEFAULT '2000.00',
  `showtime_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `seat_id` (`seat_id`),
  KEY `showtime_id` (`showtime_id`)
) ENGINE=MyISAM AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `booking_items`
--

INSERT INTO `booking_items` (`id`, `booking_id`, `seat_id`, `seat_type`, `seat_price`, `showtime_id`) VALUES
(1, 1, 5, 'normal', '2000.00', 3),
(2, 1, 6, 'normal', '2000.00', 3),
(3, 1, 40, 'normal', '2000.00', 3),
(4, 1, 39, 'normal', '2000.00', 3),
(5, 1, 54, 'normal', '2000.00', 3),
(6, 1, 55, 'combo', '2000.00', 3),
(7, 1, 10, 'normal', '2000.00', 3),
(8, 1, 77, 'normal', '2000.00', 3),
(9, 2, 89, 'normal', '2000.00', 3),
(10, 2, 90, 'normal', '2000.00', 3),
(11, 3, 1, 'normal', '2000.00', 8),
(12, 3, 2, 'normal', '2000.00', 8),
(13, 3, 3, 'normal', '2000.00', 8),
(14, 3, 4, 'normal', '2000.00', 8),
(15, 3, 12, 'normal', '2000.00', 8),
(16, 3, 13, 'normal', '2000.00', 8),
(17, 3, 21, 'normal', '2000.00', 8),
(18, 3, 22, 'normal', '2000.00', 8),
(19, 3, 23, 'normal', '2000.00', 8),
(20, 3, 24, 'normal', '2000.00', 8),
(21, 4, 5, 'combo', '3500.00', 1),
(22, 5, 4, 'normal', '2000.00', 10),
(23, 5, 5, 'normal', '2000.00', 10),
(24, 5, 6, 'normal', '2000.00', 10),
(25, 5, 15, 'combo', '3500.00', 10),
(26, 5, 24, 'combo', '3500.00', 10),
(27, 5, 25, 'combo', '3500.00', 10),
(28, 5, 26, 'combo', '3500.00', 10);

-- --------------------------------------------------------

--
-- Structure de la table `genres`
--

DROP TABLE IF EXISTS `genres`;
CREATE TABLE IF NOT EXISTS `genres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `movies`
--

DROP TABLE IF EXISTS `movies`;
CREATE TABLE IF NOT EXISTS `movies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `duration` int NOT NULL,
  `poster_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `movies`
--

INSERT INTO `movies` (`id`, `title`, `description`, `duration`, `poster_url`, `release_date`, `created_at`) VALUES
(1, 'Her', 'A lonely writer develops an unlikely relationship with his newly purchased operating system that\'s designed to meet his every need.', 126, 'img/1.jpeg', '2013-12-18', '2026-01-17 10:36:18'),
(2, 'Star Wars', 'When it\'s discovered that the evil Emperor Palpatine did not die at the hands of Darth Vader, the rebels must race against the clock to find out his whereabouts.', 142, 'img/2.jpeg', '2019-12-20', '2026-01-17 10:36:18'),
(3, 'Storm', 'Storm Voeten, son of printer Klaas Voeten, becomes the target of a hunt by the Inquisition. Aided by Marieke, a mysterious girl living in the underground city.', 100, 'img/3.jpg', '2009-01-21', '2026-01-17 10:36:18'),
(4, '1917', 'At the height of the First World War, two young British soldiers must cross enemy territory and deliver a message that will stop a deadly attack.', 119, 'img/4.jpg', '2019-12-25', '2026-01-17 10:36:18'),
(5, 'Avengers', 'Earth\'s mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army.', 143, 'img/5.jpg', '2012-05-04', '2026-01-17 10:36:18'),
(6, 'Rampage', 'When three different animals become infected with a dangerous pathogen, a primatologist and a geneticist team up to stop them.', 107, 'img/6.jpg', '2018-04-13', '2026-01-17 10:36:18');

-- --------------------------------------------------------

--
-- Structure de la table `movie_genres`
--

DROP TABLE IF EXISTS `movie_genres`;
CREATE TABLE IF NOT EXISTS `movie_genres` (
  `movie_id` int NOT NULL,
  `genre_id` int NOT NULL,
  PRIMARY KEY (`movie_id`,`genre_id`),
  KEY `genre_id` (`genre_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `total_seats` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `rooms`
--

INSERT INTO `rooms` (`id`, `name`, `total_seats`) VALUES
(1, 'Salle Principale', 80);

-- --------------------------------------------------------

--
-- Structure de la table `seats`
--

DROP TABLE IF EXISTS `seats`;
CREATE TABLE IF NOT EXISTS `seats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `seat_number` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`)
) ENGINE=MyISAM AUTO_INCREMENT=146 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `seats`
--

INSERT INTO `seats` (`id`, `room_id`, `seat_number`) VALUES
(1, 1, 'A1'),
(2, 1, 'A2'),
(3, 1, 'A3'),
(4, 1, 'A4'),
(5, 1, 'A5'),
(6, 1, 'A6'),
(7, 1, 'A7'),
(8, 1, 'A8'),
(9, 1, 'A9'),
(10, 1, 'A10'),
(11, 1, 'B1'),
(12, 1, 'B2'),
(13, 1, 'B3'),
(14, 1, 'B4'),
(15, 1, 'B5'),
(16, 1, 'B6'),
(17, 1, 'B7'),
(18, 1, 'B8'),
(19, 1, 'B9'),
(20, 1, 'B10'),
(21, 1, 'C1'),
(22, 1, 'C2'),
(23, 1, 'C3'),
(24, 1, 'C4'),
(25, 1, 'C5'),
(26, 1, 'C6'),
(27, 1, 'C7'),
(28, 1, 'C8'),
(29, 1, 'C9'),
(30, 1, 'C10'),
(46, 1, 'E6'),
(47, 1, 'E7'),
(48, 1, 'E8'),
(49, 1, 'E9'),
(50, 1, 'E10'),
(51, 1, 'F1'),
(52, 1, 'F2'),
(53, 1, 'F3'),
(54, 1, 'F4'),
(55, 1, 'F5'),
(56, 1, 'F6'),
(57, 1, 'F7'),
(58, 1, 'F8'),
(59, 1, 'F9'),
(60, 1, 'F10'),
(61, 1, 'G1'),
(62, 1, 'G2'),
(63, 1, 'G3'),
(64, 1, 'G4'),
(65, 1, 'G5'),
(66, 1, 'G6'),
(67, 1, 'G7'),
(68, 1, 'G8'),
(69, 1, 'G9'),
(70, 1, 'G10'),
(71, 1, 'H1'),
(72, 1, 'H2'),
(73, 1, 'H3'),
(74, 1, 'H4'),
(75, 1, 'H5'),
(76, 1, 'H6'),
(77, 1, 'H7'),
(78, 1, 'H8'),
(79, 1, 'H9'),
(80, 1, 'H10');

-- --------------------------------------------------------

--
-- Structure de la table `showtimes`
--

DROP TABLE IF EXISTS `showtimes`;
CREATE TABLE IF NOT EXISTS `showtimes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `movie_id` int NOT NULL,
  `room_id` int NOT NULL,
  `show_date` date NOT NULL,
  `start_time` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `movie_id` (`movie_id`),
  KEY `room_id` (`room_id`)
) ENGINE=MyISAM AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `showtimes`
--

INSERT INTO `showtimes` (`id`, `movie_id`, `room_id`, `show_date`, `start_time`) VALUES
(1, 2, 1, '2026-01-21', '15:00:00'),
(2, 6, 1, '2026-01-21', '18:00:00'),
(3, 1, 1, '2026-01-22', '12:00:00'),
(4, 5, 1, '2026-01-22', '18:00:00'),
(5, 4, 1, '2026-01-22', '21:00:00'),
(6, 1, 1, '2026-01-23', '15:00:00'),
(7, 2, 1, '2026-01-23', '18:00:00'),
(8, 3, 1, '2026-01-24', '12:00:00'),
(9, 5, 1, '2026-01-24', '18:00:00'),
(10, 6, 1, '2026-01-24', '21:00:00'),
(11, 3, 1, '2026-01-25', '12:00:00'),
(12, 5, 1, '2026-01-25', '15:00:00'),
(13, 4, 1, '2026-01-25', '18:00:00'),
(14, 1, 1, '2026-01-26', '12:00:00'),
(15, 3, 1, '2026-01-26', '15:00:00'),
(16, 4, 1, '2026-01-26', '21:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `ticket_verifications`
--

DROP TABLE IF EXISTS `ticket_verifications`;
CREATE TABLE IF NOT EXISTS `ticket_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `verified_by` int NOT NULL,
  `verified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `verified_by` (`verified_by`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'user',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Test User', 'test@cinemawave.com', 'hashed_password', 'user', '2026-01-01 14:48:51'),
(2, 'McKaleXMArksman', 'bakopmckale@gmail.com', '$2b$10$neRRVZ8aOAVaDSzmJdSz6OaZfu2v/TBG1o.0ObokP7t1ZBCShdHHS', 'user', '2026-01-19 14:27:14'),
(3, 'Test user', 'testuser@cinewave.com', '$2b$10$kJpt41IZVu/xvjST10uFR.hPnQvGBTkuPeFVuV.0lU3s09yAlvH3u', 'user', '2026-01-19 14:30:52');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
