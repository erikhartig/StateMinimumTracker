CREATE TABLE alcohol (
  pk SERIAL NOT NULL,
  alcoholType varchar(256),
  michiganDistiller BOOLEAN,
  ADAnum int,
  liquorCode int,
  brandName varchar(256),
  proof numeric,
  sizeML int,
  packSize int,
  basePrice numeric,
  licenseePrice numeric,
  minimumShelfPrice numeric,
  newChange varchar(256),
  PRIMARY KEY(pk)
);
