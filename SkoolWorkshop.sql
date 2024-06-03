DROP TABLE IF EXISTS "EmailTemplate";
DROP TABLE IF EXISTS "CommissionWorkshopUser";
DROP TABLE IF EXISTS "CommissionWorkshop";
DROP TABLE IF EXISTS "Workshop";
DROP TABLE IF EXISTS "Commission";
DROP TABLE IF EXISTS "Client";
DROP TABLE IF EXISTS "User";


/* 
████████╗░█████╗░██████╗░██╗░░░░░███████╗░██████╗
╚══██╔══╝██╔══██╗██╔══██╗██║░░░░░██╔════╝██╔════╝
░░░██║░░░███████║██████╦╝██║░░░░░█████╗░░╚█████╗░
░░░██║░░░██╔══██║██╔══██╗██║░░░░░██╔══╝░░░╚═══██╗
░░░██║░░░██║░░██║██████╦╝███████╗███████╗██████╔╝
░░░╚═╝░░░╚═╝░░╚═╝╚═════╝░╚══════╝╚══════╝╚═════╝░
*/
CREATE TABLE "User" (
	UserId					INTEGER			PRIMARY KEY	IDENTITY(1,1),
	Username				NVARCHAR(64)	NOT NULL,
	Birthdate				DATE			NOT NULL,
	City					NVARCHAR(100)	NOT NULL,
	Address					NVARCHAR(100)	NOT NULL,
	Email					NVARCHAR(100)	NOT NULL	UNIQUE,
	Password				NVARCHAR(300)	NOT NULL,
	PhoneNumber				NVARCHAR(20)	NOT NULL	UNIQUE,
	PostalCode				NVARCHAR(11)	NOT NULL,
	BTWNumber				INTEGER	,
	KVKNumber				INTEGER	,
	BankId					NVARCHAR(34)	NOT NULL,
	Role					NVARCHAR(20)	NOT NULL,
	Permission				NVARCHAR(20)	NOT NULL	DEFAULT 'Default',
	SalaryPerHourInEuro		DECIMAL(5,2)	NOT NULL,
	UsesPublicTransit		BIT				NOT NULL,
	HasCar					BIT				NOT NULL,
	HasLicense				BIT				NOT NULL,
	
	CONSTRAINT CHK_Role CHECK (Role = 'ZZP' OR Role = 'Flex'),
	CONSTRAINT CHK_Permission CHECK (Permission = 'Default' OR Permission = 'Moderator' OR Permission = 'Admin'),
	CONSTRAINT CHK_RoleZzpHasBTWAndKVK CHECK (Role != 'ZZP' OR (BTWNumber IS NOT NULL AND KVKNumber IS NOT NULL))
)

CREATE TABLE Workshop (
	WorkshopId				INTEGER			PRIMARY KEY	IDENTITY(1,1),
	Name					NVARCHAR(64)	NOT NULL	UNIQUE,
	Category				NVARCHAR(64)	NOT NULL,
	Requirements			NVARCHAR(4000)	NOT NULL,
	Description				NVARCHAR(4000)	NOT NULL,
	LinkToPicture			NVARCHAR(200)	NOT NULL
);

CREATE TABLE Client (
	ClientId				INTEGER			PRIMARY KEY	IDENTITY(1,1),
	ClientName				NVARCHAR(100)	NOT NULL	UNIQUE,
	Organisation			NVARCHAR(100)	NOT NULL,
	TargetAudience			NVARCHAR(100)	NOT NULL,
	ContactPerson			NVARCHAR(100)	NOT NULL,
	Email					NVARCHAR(100)	NOT NULL,
	PhoneNumber				NVARCHAR(100)	NULL,
	Address					NVARCHAR(100)	NOT NULL,
	KvkNumber				INT				NULL
);

CREATE TABLE "Commission" (
	CommissionId INTEGER PRIMARY KEY IDENTITY(1,1),
	ClientId INTEGER NOT NULL,
	Name NVARCHAR(100) NOT NULL,
	Address NVARCHAR(100) NOT NULL,
	Date DATE NOT NULL,
	CommissionNotes NVARCHAR(1000) NOT NULL,

	CONSTRAINT FK_Commission_Client FOREIGN KEY (ClientId) REFERENCES Client (ClientId)
	ON DELETE NO ACTION
	ON UPDATE CASCADE
)

CREATE TABLE "CommissionWorkshop" (
	CommissionWorkshopId INTEGER PRIMARY KEY IDENTITY(1,1),
	CommissionId INTEGER NOT NULL,
	WorkshopId INTEGER NOT NULL,
	StartTime TIME NOT NULL,
	EndTime TIME NOT NULL,
	MaxUsers INT NOT NULL,
	NumberOfParticipants INTEGER NOT NULL,
	Location NVARCHAR(100) NOT NULL,
	Level NVARCHAR(10) NOT NULL,
	TargetGroup NVARCHAR(10) NOT NULL,
	WorkshopNotes NVARCHAR(1000) NOT NULL

	CONSTRAINT FK_CommissionWorkshop_Commission FOREIGN KEY (CommissionId) REFERENCES Commission (CommissionId)
	ON DELETE NO ACTION
	ON UPDATE CASCADE,

	CONSTRAINT FK_CommissionWorkshop_Workshop FOREIGN KEY (WorkshopId) REFERENCES Workshop (WorkshopId)
	ON DELETE NO ACTION
	ON UPDATE CASCADE
)

CREATE TABLE "CommissionWorkshopUser" (
	CommissionWorkshopId INTEGER NOT NULL,
	UserId INTEGER NOT NULL,
	Status NVARCHAR(10) NOT NULL

	CONSTRAINT CK_Status CHECK (Status = 'Toegewezen' OR Status = 'Afwachtend' OR Status = 'Afgekeurd')

	CONSTRAINT FK_CommissionWorkshopUser_CommissionWorkshop FOREIGN KEY (CommissionWorkshopId) REFERENCES CommissionWorkshop (CommissionWorkshopId)
	ON DELETE NO ACTION
	ON UPDATE CASCADE,

	CONSTRAINT FK_CommissionWorkshopUser_User FOREIGN KEY (UserId) REFERENCES [dbo].[User] (UserId)
	ON DELETE NO ACTION
	ON UPDATE CASCADE
)

CREATE TABLE "EmailTemplate" (
	Name NVARCHAR(100) PRIMARY KEY,
	Content NVARCHAR(1500) NOT NULL
)


/*
██╗░░░██╗░█████╗░██╗░░░░░██╗░░░██╗███████╗░██████╗
██║░░░██║██╔══██╗██║░░░░░██║░░░██║██╔════╝██╔════╝
╚██╗░██╔╝███████║██║░░░░░██║░░░██║█████╗░░╚█████╗░
░╚████╔╝░██╔══██║██║░░░░░██║░░░██║██╔══╝░░░╚═══██╗
░░╚██╔╝░░██║░░██║███████╗╚██████╔╝███████╗██████╔╝
░░░╚═╝░░░╚═╝░░╚═╝╚══════╝░╚═════╝░╚══════╝╚═════╝░
*/ GO

INSERT INTO "User" (Username, Birthdate, City, Address, Email, Password, PhoneNumber, PostalCode, BTWNumber, KVKNumber, BankId, Role, Permission, SalaryPerHourInEuro, UsesPublicTransit, HasCar, HasLicense)
VALUES
('Janine Doe', '1990-05-15', 'Rotterdam', 'Hoofdstraat 123', 'janine.doe@example.com', '$2a$10$gZuXV7vwJTC6v5cVkLmDJe7hV44wUTvTu3VpAjWiCZY44wS2CKNB2', '+31611111111', '3000AA', NULL, NULL, 'NL34RABO0123456789', 'Flex', 'Default', 50.00, 1, 0, 0),
('John de Vries', '1985-11-30', 'Amsterdam', 'Grachtstraat 456', 'john.devries@example.com', '$2a$10$gZuXV7vwJTC6v5cVkLmDJe7hV44wUTvTu3VpAjWiCZY44wS2CKNB2', '+31622222222', '1011AB', '9876543', '1234567', 'NL44ABNA0123456789', 'ZZP', 'Moderator', 75.00, 0, 1, 1),
('Clinten Pique', '1999-02-02', 'Breda', 'Lovensdijkstraat 61', 'info@skoolworkshop.com', '$2a$10$gZuXV7vwJTC6v5cVkLmDJe7hV44wUTvTu3VpAjWiCZY44wS2CKNB2' ,'+316000000', '4614RM', '5641421', '4542522', 'NL06241231231312', 'ZZP', 'Admin', 100, 0, 1, 1);


INSERT INTO Workshop (Name, Category, Requirements, Description, LinkToPicture)
VALUES
('Vloggen', 'Kunst', 'Camera, Geheugenkaart', 'Leer de basisprincipes van vloggen en verbeter je vaardigheden.', 'https://skoolworkshop.nl/wp-content/uploads/2019/12/Vlog-Workshop-op-school-1024x652.jpg'),
('Openbaar Spreken', 'Communicatie', 'Geen', 'Overwin je angst voor spreken in het openbaar met onze deskundige begeleiding.', 'https://skoolworkshop.nl/wp-content/uploads/2020/09/Jongens-rap-e1643291580110-1024x653.jpg'),
('Python Programmeren', 'Technologie', 'Laptop', 'Introductie tot Python programmeren voor beginners.', 'https://skoolworkshop.nl/wp-content/uploads/2023/09/Workshop-Podcast-Maken.jpg'),
('Java Programmeren', 'Technologie', 'Laptop', 'Introductie tot Java programmeren voor beginners.', 'https://skoolworkshop.nl/wp-content/uploads/2023/09/Workshop-Podcast-Maken.jpg');


INSERT INTO Client (ClientName, Organisation, TargetAudience, ContactPerson, Email, PhoneNumber, Address, KvkNumber)
VALUES
('Technische Universiteit', 'Technische Universiteit Inc.', 'Studenten', 'Sarah Lee', 'sarah.lee@technischeuniversiteit.com', '+31644445555', 'Technologische Laan 42', 654321),
('Wereldwijde Corp', 'Wereldwijde Corporatie', 'Werknemers', 'Michael Bruin', 'michael.bruin@wereldwijdecorp.com', '+31655556666', 'Zakelijk Plaza 78', 987654);


INSERT INTO "Commission" (ClientId, Name, Address, Date, CommissionNotes)
VALUES
((SELECT ClientId FROM Client WHERE ClientName = 'Technische Universiteit'), 'Programmeren Bootcamp', 'Technische Universiteit Campus', '2024-07-15', 'Een uitgebreide bootcamp over programmeren.'),
((SELECT ClientId FROM Client WHERE ClientName = 'Wereldwijde Corp'), 'Teambuilding Workshop', 'Wereldwijde Corp Hoofdkantoor', '2024-08-20', 'Een workshop gericht op het verbeteren van de teamcohesie en samenwerking.');


INSERT INTO "CommissionWorkshop" (CommissionId, WorkshopId, StartTime, EndTime, MaxUsers, NumberOfParticipants, Location, Level, TargetGroup, WorkshopNotes)
VALUES
((SELECT CommissionId FROM "Commission" WHERE Name = 'Programmeren Bootcamp'), (SELECT WorkshopId FROM Workshop WHERE Name = 'Python Programmeren'), '09:00', '17:00', 1, 30, 'Technische Universiteit Campus', 'Gevorderd', 'B', 'Dagdagen bootcamp met praktische python sessies.'),
((SELECT CommissionId FROM "Commission" WHERE Name = 'Programmeren Bootcamp'), (SELECT WorkshopId FROM Workshop WHERE Name = 'Java Programmeren'), '09:00', '17:00', 1, 30, 'Technische Universiteit Campus', 'Gevorderd', 'B', 'Dagdagen bootcamp met praktische java sessies.'),
((SELECT CommissionId FROM "Commission" WHERE Name = 'Teambuilding Workshop'), (SELECT WorkshopId FROM Workshop WHERE Name = 'Openbaar Spreken'), '13:00', '15:00', 2, 25, 'Wereldwijde Corp Hoofdkantoor', 'Beginner', 'C', 'Interactieve sessies voor openbaar spreken om communicatievaardigheden te verbeteren.');


INSERT INTO "CommissionWorkshopUser" (CommissionWorkshopId, UserId, Status)
VALUES
((SELECT CommissionWorkshopId FROM "CommissionWorkshop" WHERE WorkshopNotes = 'Dagdagen bootcamp met praktische java sessies.'), (SELECT UserId FROM "User" WHERE Username = 'Janine Doe'), 'Toegewezen'),
((SELECT CommissionWorkshopId FROM "CommissionWorkshop" WHERE WorkshopNotes = 'Interactieve sessies voor openbaar spreken om communicatievaardigheden te verbeteren.'), (SELECT UserId FROM "User" WHERE Username = 'John de Vries'), 'Toegewezen'),
((SELECT CommissionWorkshopId FROM "CommissionWorkshop" WHERE WorkshopNotes = 'Dagdagen bootcamp met praktische python sessies.'), (SELECT UserId FROM "User" WHERE Username = 'John de Vries'), 'Afwachtend');


INSERT INTO "EmailTemplate" (Name, Content)
VALUES
('Bedankt', 'Beste [Naam], bedankt voor uw deelname aan onze workshop. We hopen dat u een geweldige ervaring had.'),
('Opvolging', 'Beste [Naam], we horen graag uw feedback over de recente workshop die u heeft bijgewoond.');


/*
████████╗██████╗░██╗░██████╗░░██████╗░███████╗██████╗░░██████╗
╚══██╔══╝██╔══██╗██║██╔════╝░██╔════╝░██╔════╝██╔══██╗██╔════╝
░░░██║░░░██████╔╝██║██║░░██╗░██║░░██╗░█████╗░░██████╔╝╚█████╗░
░░░██║░░░██╔══██╗██║██║░░╚██╗██║░░╚██╗██╔══╝░░██╔══██╗░╚═══██╗
░░░██║░░░██║░░██║██║╚██████╔╝╚██████╔╝███████╗██║░░██║██████╔╝
░░░╚═╝░░░╚═╝░░╚═╝╚═╝░╚═════╝░░╚═════╝░╚══════╝╚═╝░░╚═╝╚═════╝░
*/
GO


CREATE TRIGGER MaxUsersOnWorkshop
ON CommissionWorkshopUser
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Temporary table to store CommissionWorkshopId from inserted or updated rows
    DECLARE @TempCommissionWorkshop TABLE (
        CommissionWorkshopId INT
    );

    -- Insert distinct CommissionWorkshopId from inserted or updated rows into the temporary table
    INSERT INTO @TempCommissionWorkshop (CommissionWorkshopId)
    SELECT DISTINCT CommissionWorkshopId
    FROM inserted;

    DECLARE @CommissionWorkshopId INT;
    DECLARE @users INT;
    DECLARE @maxusers INT;

    -- Loop through each CommissionWorkshopId in the temporary table
    DECLARE cur CURSOR LOCAL FOR
    SELECT CommissionWorkshopId FROM @TempCommissionWorkshop;

    OPEN cur;
    FETCH NEXT FROM cur INTO @CommissionWorkshopId;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Count the number of users with status 'Toegewezen' for the current CommissionWorkshopId
        SELECT @users = COUNT(UserId)
        FROM CommissionWorkshopUser
        WHERE CommissionWorkshopId = @CommissionWorkshopId
          AND Status = 'Toegewezen';

        -- Get the max users allowed for this workshop
        SELECT @maxusers = MaxUsers
        FROM CommissionWorkshop
        WHERE CommissionWorkshopId = @CommissionWorkshopId;

        -- Check if the number of users exceeds the max users allowed
        IF (@users > @maxusers)
        BEGIN
            -- Rollback transaction and raise error
            ROLLBACK TRANSACTION;
            RAISERROR('Max users reached. Cannot assign a new user to workshop. The query has been terminated.', 16, 1);
            RETURN;
        END

        FETCH NEXT FROM cur INTO @CommissionWorkshopId;
    END

    CLOSE cur;
    DEALLOCATE cur;

    SET NOCOUNT OFF;
END;


GO
/*
░██████╗░██╗░░░██╗███████╗██████╗░██╗███████╗░██████╗
██╔═══██╗██║░░░██║██╔════╝██╔══██╗██║██╔════╝██╔════╝
██║██╗██║██║░░░██║█████╗░░██████╔╝██║█████╗░░╚█████╗░
╚██████╔╝██║░░░██║██╔══╝░░██╔══██╗██║██╔══╝░░░╚═══██╗
░╚═██╔═╝░╚██████╔╝███████╗██║░░██║██║███████╗██████╔╝
░░░╚═╝░░░░╚═════╝░╚══════╝╚═╝░░╚═╝╚═╝╚══════╝╚═════╝░
*/

-- Get workshops in commissions with no user assigned to it
SELECT CommissionWorkshopId, CommissionId, StartTime, EndTime, NumberOfParticipants, Location, Level, TargetGroup, WorkshopNotes, Workshop.WorkshopId, Workshop.Name, Workshop.Category, Workshop.Requirements, Workshop.Description, Workshop.LinkToPicture
FROM CommissionWorkshop t1
INNER JOIN Workshop ON t1.WorkshopId = Workshop.WorkshopId
WHERE NOT EXISTS (SELECT t2.CommissionWorkshopId, t2.Status FROM CommissionWorkshopUser t2 WHERE t1.CommissionWorkshopId = t2.CommissionWorkshopId AND t2.Status = 'Toegewezen')