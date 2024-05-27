USE master; 
/* Dit voorkomt dat de database gebruikt wordt tijdens verwijdering. */
ALTER DATABASE [SkoolWorkshop] set single_user with rollback immediate 

DROP DATABASE IF EXISTS SkoolWorkshop;
CREATE DATABASE SkoolWorkshop;

USE SkoolWorkshop;

DROP TABLE IF EXISTS "User";
CREATE TABLE "User" (
	Username				NVARCHAR(64)	NOT NULL						,
	Birthdate				DATE			NOT NULL						,
	City					NVARCHAR(100)	NOT NULL						,
	Address					NVARCHAR(100)	NOT NULL						,
	EmailAddress			NVARCHAR(100)	NOT NULL	UNIQUE				,
	PhoneNumber				NVARCHAR(20)	NOT NULL	UNIQUE				,
	PostalCode				NVARCHAR(11)	NOT NULL						,
	BTWNumber				INTEGER											,
	KVKNumber				INTEGER											,
	BankId					NVARCHAR(34)	NOT NULL						,
	Role					NVARCHAR(20)	NOT NULL						,
	Permission				NVARCHAR(20)	NOT NULL	DEFAULT 'Default'	,
	SalaryPerHourInEuro		DECIMAL(5,2)	NOT NULL						,
	UsesPublicTransit		BIT				NOT NULL						,
	HasCar					BIT				NOT NULL						,
	HasLicense				BIT				NOT NULL						,

	CONSTRAINT CHK_Role CHECK (Role = 'ZZP' OR Role = 'Flex'),
	CONSTRAINT CHK_Permission CHECK (Permission = 'Default' OR Permission = 'Moderator' OR Permission = 'Admin')
)






/* USER FOR ACCES */
-- Step 1: Create the login
DROP LOGIN SkoolWorkshopAdmin;

-- Step 1: Create the login
CREATE LOGIN SkoolWorkshopAdmin WITH PASSWORD = '6p&3YYD3#y';

-- Step 2: Create the user in the specific database
USE SkoolWorkshop;
DROP USER IF EXISTS SkoolWorkshopAdmin;
CREATE USER SkoolWorkshopAdmin FOR LOGIN SkoolWorkshopAdmin;

-- Step 3: Grant read and write privileges to the specific database
ALTER ROLE db_datareader ADD MEMBER SkoolWorkshopAdmin;
ALTER ROLE db_datawriter ADD MEMBER SkoolWorkshopAdmin;