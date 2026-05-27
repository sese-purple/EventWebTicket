-- 1. Create the Database
CREATE DATABASE IF NOT EXISTS event_db;
USE event_db;

-- 2. Users Table
-- Handles Authentication (5.3) and Roles (4)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Encrypted password
    role ENUM('admin', 'organizer', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Events Table
-- Stores event details (5.2) and approval status (4.4)
CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    organizer_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- e.g., Concert, Workshop
    banner_image LONGTEXT, -- URL or base64 encoded image
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending', -- For Admin approval
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Tickets Table (Ticket Types)
-- Defines price and capacity per ticket type (5.4)
CREATE TABLE tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    ticket_name VARCHAR(50) NOT NULL, -- e.g., VIP, Regular, Early Bird
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    quantity_available INT NOT NULL, -- Total stock for this type
    quantity_sold INT NOT NULL DEFAULT 0, -- Track sold tickets
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- 5. Bookings Table
-- Connects a user to a specific ticket type (5.4)
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ticket_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    qr_code VARCHAR(255), -- Unique string for QR generation (5.5)
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);

-- 6. Payments Table
-- Tracks transaction details (5.4)
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50), -- e.g., 'Credit Card', 'PayPal'
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- 7. Check-ins Table
-- Validates tickets at the door (Requirement 8)
CREATE TABLE checkins (
    checkin_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE, -- One check-in per booking
    checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('valid', 'already_used') DEFAULT 'valid',
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);