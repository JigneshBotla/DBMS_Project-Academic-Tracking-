CREATE TABLE programme (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dept_name VARCHAR(50) NOT NULL,
    degree VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    FOREIGN KEY (dept_name) REFERENCES department(name) ON DELETE CASCADE
);