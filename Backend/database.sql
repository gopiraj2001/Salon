-- Create database
CREATE DATABASE IF NOT EXISTS salon;

-- Select the database
USE salon;

-- Create table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_contact VARCHAR(50),
    customer_email VARCHAR(100),
    category VARCHAR(100),
    message TEXT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    CONSTRAINT unique_slot UNIQUE (appointment_date, appointment_time)
);
