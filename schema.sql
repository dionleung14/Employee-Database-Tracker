DROP DATABASE IF EXISTS company_db;
CREATE DATABASE company_db;

USE company_db;

CREATE TABLE department(
    id INT(10) NOT NULL,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE role(
    id INT(10) NOT NULL,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(15,2) NOT NULL,
    department_id INT,
    PRIMARY KEY(id)
);

CREATE TABLE employee(
    id INT(10) NOT NULL,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT(10),
    manager_id INT(10),
    PRIMARY KEY (id)
);