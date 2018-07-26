/* Creates a table to contain basic user data including username, hashed password,
 and salt */
CREATE TABLE users (
  pk int NOT NULL AUTO_INCREMENT,
  username varchar(50) NOT NULL UNIQUE,
  passwordHashed varchar(256) NOT NULL,
  salt varchar(256) NOT NULL,
  PRIMARY KEY(pk)
);
