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

DROP TABLE IF EXISTS "Workshop";
CREATE TABLE Workshop (
	ID						INTEGER			NOT NULL	PRIMARY KEY IDENTITY(1,1),
	Name					NVARCHAR(64)	NOT NULL						,
	Category				NVARCHAR(64)	NOT NULL						,
	Requirements			NVARCHAR(4000)	NOT NULL						,
	Description				NVARCHAR(4000)	NOT NULL						,
)