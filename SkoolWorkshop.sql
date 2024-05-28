USE SkoolWorkshop;

DROP TABLE IF EXISTS "User";
CREATE TABLE "User" (
	UserId					INTEGER			NOT NULL	PRIMARY KEY IDENTITY(1,1)	,
	Username				NVARCHAR(64)	NOT NULL								,
	Birthdate				DATE			NOT NULL								,
	City					NVARCHAR(100)	NOT NULL								,
	Address					NVARCHAR(100)	NOT NULL								,
	Email					NVARCHAR(100)	NOT NULL	UNIQUE						,
	Password				NVARCHAR(100)	NOT NULL								,
	PhoneNumber				NVARCHAR(20)	NOT NULL	UNIQUE						,
	PostalCode				NVARCHAR(11)	NOT NULL								,
	BTWNumber				INTEGER													,
	KVKNumber				INTEGER													,
	BankId					NVARCHAR(34)	NOT NULL								,
	Role					NVARCHAR(20)	NOT NULL								,
	Permission				NVARCHAR(20)	NOT NULL	DEFAULT 'Default'			,
	SalaryPerHourInEuro		DECIMAL(5,2)	NOT NULL								,
	UsesPublicTransit		BIT				NOT NULL								,
	HasCar					BIT				NOT NULL								,
	HasLicense				BIT				NOT NULL								,
	
	CONSTRAINT CHK_Role CHECK (Role = 'ZZP' OR Role = 'Flex'),
	CONSTRAINT CHK_Permission CHECK (Permission = 'Default' OR Permission = 'Moderator' OR Permission = 'Admin'),
	CONSTRAINT CHK_RoleZzpHasBTWAndKVK CHECK (Role != 'ZZP' OR (BTWNumber IS NOT NULL AND KVKNumber IS NOT NULL))
)

INSERT INTO "User" VALUES (
	'Clinten Pique', '1999-02-02', 'Breda', 'Lovensdijkstraat 61', 'info@skoolworkshop.com', 'password' ,'+316000000', '4614RM', '5641421', '4542522', 'NL06241231231312', 'ZZP', 'Admin', '100', '0', '1', '1'
)

DROP TABLE IF EXISTS "Workshop";
CREATE TABLE Workshop (
	WorkshopId				INTEGER			NOT NULL	PRIMARY KEY IDENTITY(1,1)	,
	Name					NVARCHAR(64)	NOT NULL								,
	Category				NVARCHAR(64)	NOT NULL								,
	Requirements			NVARCHAR(4000)	NOT NULL								,
	Description				NVARCHAR(4000)	NOT NULL								,
)

DROP TABLE IF EXISTS "Client";
CREATE TABLE Client (
	ClientId				INTEGER			NOT NULL	PRIMARY KEY IDENTITY(1,1)	,
	ClientName				NVARCHAR(100)	NOT NULL	,
	Organisation			NVARCHAR(100)	NOT NULL	,
	TargetAudience			NVARCHAR(100)	NOT NULL	,
	Email					NVARCHAR(100)	NOT NULL	,
	PhoneNumber				NVARCHAR(100)	NULL		,
	ContactPerson			NVARCHAR(100)	NOT NULL	,
	Address					NVARCHAR(100)	NOT NULL	,
	KvkNumber				INT				NULL
);

INSERT INTO Client VALUES (
	'Avans Hogeschool', 'Avans Hogeschool B.V', 'Studenten', 'avans@hogeschool.com', '+3163332552', 'Marjolein Gerdes', 'Lovensdijkstraat 61', '324212'
)