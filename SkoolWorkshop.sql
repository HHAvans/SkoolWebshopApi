DROP TABLE IF EXISTS "UserWorkshop"; 
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
	Country					NVARCHAR(20)	NOT NULL,
	Language				NVARCHAR(10)	NOT NULL,
	BTWNumber				INTEGER	,
	KVKNumber				INTEGER	,
	BankId					NVARCHAR(34)	NOT NULL,
	Role					NVARCHAR(20)	NOT NULL,
	Permission				NVARCHAR(20)	NOT NULL	DEFAULT 'Default',
	SalaryPerHourInEuro		DECIMAL(5,2)	NOT NULL,
	UsesPublicTransit		BIT				NOT NULL,
	HasCar					BIT				NOT NULL,
	HasLicense				BIT				NOT NULL,
	Status 					NVARCHAR(11)	NOT NULL   DEFAULT 'Afwachtend',	
	
	CONSTRAINT CK_Language CHECK (Language = 'Nederlands' OR Language = 'English' OR Language = 'Both'),
	CONSTRAINT CK_StatusUser CHECK (Status = 'Toegewezen' OR Status = 'Afwachtend' OR Status = 'Geblokkeerd'),
	CONSTRAINT CHK_Role CHECK (Role = 'ZZP' OR Role = 'Flex'),
	CONSTRAINT CHK_Permission CHECK (Permission = 'Default' OR Permission = 'Moderator' OR Permission = 'Admin'),
	CONSTRAINT CHK_RoleZzpHasBTWAndKVK CHECK (Role != 'ZZP' OR (BTWNumber IS NOT NULL AND KVKNumber IS NOT NULL))
)

CREATE TABLE Workshop (
	WorkshopId				INTEGER			PRIMARY KEY	IDENTITY(1,1),
	WorkshopName			NVARCHAR(64)	NOT NULL	UNIQUE,
	Category				NVARCHAR(64)	NOT NULL,
	Requirements			NVARCHAR(4000)	NOT NULL,
	Description				NVARCHAR(4000)	NOT NULL,
	LinkToPicture			NVARCHAR(200)	NOT NULL
);

CREATE TABLE UserWorkshop (
	UserId					INTEGER			NOT NULL,
	WorkshopId				INTEGER			NOT NULL

	PRIMARY KEY (UserId, WorkshopId)

	CONSTRAINT FK_UserWorkshop_User FOREIGN KEY (UserId) REFERENCES "User" (UserId)
	ON DELETE NO ACTION
	ON UPDATE CASCADE,

	CONSTRAINT FK_UserWorkshop_Workshop FOREIGN KEY (WorkshopId) REFERENCES Workshop (WorkshopId)
	ON DELETE NO ACTION
	ON UPDATE CASCADE,
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
	CommissionName NVARCHAR(100) NOT NULL,
	Address NVARCHAR(100) NOT NULL,
	Date DATE NOT NULL,
	CommissionNotes NVARCHAR(1000),
	AmountOfRounds INTEGER NOT NULL,
	StartTimeDay TIME(7) NOT NULL,
	EndTimeDay TIME(7) NOT NULL,

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
	SelectedRound INTEGER NOT NULL,
	MaxUsers INT NOT NULL,
	NumberOfParticipants INTEGER NOT NULL,
	Location NVARCHAR(100),
	Level NVARCHAR(50),
	WorkshopNotes NVARCHAR(1000)

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
	Status NVARCHAR(10) NOT NULL,

	PRIMARY KEY (CommissionWorkshopId, UserId),
	CONSTRAINT CK_Status CHECK (Status = 'Toegewezen' OR Status = 'Afwachtend' OR Status = 'Afgekeurd'),

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

INSERT INTO "User" (Username, Birthdate, City, Address, Email, Password, PhoneNumber, PostalCode, Country, Language, BTWNumber, KVKNumber, BankId, Role, Permission, SalaryPerHourInEuro, UsesPublicTransit, HasCar, HasLicense, Status) VALUES
('Janine Doe', '1990-05-15', 'Rotterdam', 'Hoofdstraat 123', 'janine.doe@example.com', '$2a$10$gZuXV7vwJTC6v5cVkLmDJe7hV44wUTvTu3VpAjWiCZY44wS2CKNB2', '+31611111111', '3000AA', 'Nederland', 'Nederlands', NULL, NULL, 'NL34RABO0123456789', 'Flex', 'Default', 50.00, 1, 0, 0, 'Toegewezen'),
('John de Vries', '1985-11-30', 'Amsterdam', 'Grachtstraat 456', 'john.devries@example.com', '$2a$10$gZuXV7vwJTC6v5cVkLmDJe7hV44wUTvTu3VpAjWiCZY44wS2CKNB2', '+31622222222', '1011AB', 'Nederland', 'Nederlands', '9876543', '1234567', 'NL44ABNA0123456789', 'ZZP', 'Moderator', 75.00, 0, 1, 1, 'Toegewezen'),
('Clinten Pique', '1999-02-02', 'Breda', 'Lovensdijkstraat 61', 'info@skoolworkshop.com', '$2a$10$gZuXV7vwJTC6v5cVkLmDJe7hV44wUTvTu3VpAjWiCZY44wS2CKNB2' ,'+316000000', '4614RM', 'Nederland', 'Nederlands', '5641421', '4542522', 'NL06241231231312', 'ZZP', 'Admin', 100, 0, 1, 1, 'Toegewezen');


INSERT INTO Workshop (WorkshopName, Category, Requirements, Description, LinkToPicture) VALUES
('Vloggen', 'Kunst', 'Camera, Geheugenkaart', 'Leer de basisprincipes van vloggen en verbeter je vaardigheden.', 'https://skoolworkshop.nl/wp-content/uploads/2019/12/Vlog-Workshop-op-school-1024x652.jpg'),
('Openbaar Spreken', 'Communicatie', 'Geen', 'Overwin je angst voor spreken in het openbaar met onze deskundige begeleiding.', 'https://skoolworkshop.nl/wp-content/uploads/2020/09/Jongens-rap-e1643291580110-1024x653.jpg'),
('Python Programmeren', 'Technologie', 'Laptop', 'Introductie tot Python programmeren voor beginners.', 'https://skoolworkshop.nl/wp-content/uploads/2023/09/Workshop-Podcast-Maken.jpg'),
('Java Programmeren', 'Technologie', 'Laptop', 'Introductie tot Java programmeren voor beginners.', 'https://skoolworkshop.nl/wp-content/uploads/2023/09/Workshop-Podcast-Maken.jpg');

INSERT INTO UserWorkshop (UserId, WorkshopId) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 2),
(2, 3),
(3, 2);

INSERT INTO Client (ClientName, Organisation, TargetAudience, ContactPerson, Email, PhoneNumber, Address, KvkNumber) VALUES
('Avans Informatica B', 'Avans Hogeschool B.V', 'Studenten', 'Marjolein Gerdes', 'mj.gerdes@avans.nl', '+31633335555', 'Lovensdijkstraat 63', 854321),
('Technische Universiteit', 'Technische Universiteit Inc.', 'Studenten', 'Sarah Lee', 'sarah.lee@technischeuniversiteit.com', '+31644445555', 'Technologische Laan 42', 654321),
('Wereldwijde Corp', 'Wereldwijde Corporatie', 'Werknemers', 'Michael Bruin', 'michael.bruin@wereldwijdecorp.com', '+31655556666', 'Zakelijk Plaza 78', 987654);

INSERT INTO "Commission" (ClientId, CommissionName, Address, Date, CommissionNotes, AmountOfRounds, StartTimeDay, EndTimeDay) VALUES
((SELECT ClientId FROM Client WHERE ClientName = 'Technische Universiteit'), 'Programmeren Bootcamp', 'Technische Universiteit Campus', '2024-07-15', 'Een uitgebreide bootcamp over programmeren.', 1, '13:00', '17:00'),
((SELECT ClientId FROM Client WHERE ClientName = 'Wereldwijde Corp'), 'Teambuilding Workshop', 'Wereldwijde Corp Hoofdkantoor', '2024-08-20', 'Een workshop gericht op het verbeteren van de teamcohesie en samenwerking.', 1, '13:00', '17:00');


INSERT INTO "CommissionWorkshop" (CommissionId, WorkshopId, StartTime, EndTime, MaxUsers, NumberOfParticipants, Location, Level, WorkshopNotes, SelectedRound) VALUES
((SELECT CommissionId FROM "Commission" WHERE CommissionName = 'Programmeren Bootcamp'), (SELECT WorkshopId FROM Workshop WHERE WorkshopName = 'Python Programmeren'), '09:00', '17:00', 1, 30, 'Technische Universiteit Campus', 'Gevorderd', 'Dagdagen bootcamp met praktische python sessies.', 1),
((SELECT CommissionId FROM "Commission" WHERE CommissionName = 'Programmeren Bootcamp'), (SELECT WorkshopId FROM Workshop WHERE WorkshopName = 'Java Programmeren'), '09:00', '17:00', 1, 30, 'Technische Universiteit Campus', 'Gevorderd', 'Dagdagen bootcamp met praktische java sessies.', 1),
((SELECT CommissionId FROM "Commission" WHERE CommissionName = 'Teambuilding Workshop'), (SELECT WorkshopId FROM Workshop WHERE WorkshopName = 'Openbaar Spreken'), '13:00', '15:00', 2, 25, 'Wereldwijde Corp Hoofdkantoor', 'Beginner', 'Interactieve sessies voor openbaar spreken om communicatievaardigheden te verbeteren.', 1);


INSERT INTO "CommissionWorkshopUser" (CommissionWorkshopId, UserId, Status) VALUES
((SELECT CommissionWorkshopId FROM "CommissionWorkshop" WHERE WorkshopNotes = 'Dagdagen bootcamp met praktische java sessies.'), (SELECT UserId FROM "User" WHERE Username = 'Janine Doe'), 'Toegewezen'),
((SELECT CommissionWorkshopId FROM "CommissionWorkshop" WHERE WorkshopNotes = 'Interactieve sessies voor openbaar spreken om communicatievaardigheden te verbeteren.'), (SELECT UserId FROM "User" WHERE Username = 'John de Vries'), 'Toegewezen'),
((SELECT CommissionWorkshopId FROM "CommissionWorkshop" WHERE WorkshopNotes = 'Dagdagen bootcamp met praktische python sessies.'), (SELECT UserId FROM "User" WHERE Username = 'John de Vries'), 'Afwachtend');


INSERT INTO "EmailTemplate" (Name, Content) VALUES
('Approval', 'Beste {FirstName},' + CHAR(13) + CHAR(13) + 'Leuk dat je een workshop wil verzorgen voor Skool Workshop. Met deze mail is jouw workshop voor {Customer} bevestigd.' + CHAR(13) + CHAR(13) + 'Je wordt verwacht op {ExecutionDate} om {StartTime}.' + CHAR(13) + CHAR(13) + 'De workshop start om {FirstRoundStartTime} en eindigt om {LastRoundEndTime}. Als je ervoor kiest om materialen van Skool Workshop te gebruiken, ben je verantwoordelijk voor het gebruik, het ophalen, terugbrengen en het voorkomen van schade of verlies. Login op jouw account om de workshop details te bekijken. Wij wensen je alvast veel plezier!' + CHAR(13) + CHAR(13) + 'Met vriendelijke groeten, Team Skool Workshop Veilingkade 15 | 4815 HC Breda | Tel. 085 - 0653923 | App. 06 - 28318842 Mail. info@skoolworkshop.nl | Web. www.skoolworkshop.n'),

('AvailabilityConfirmation', 'Beste {FirstName}, ' + CHAR(13) + CHAR(13) + 'Je beschikbaarheid voor de {Workshop} op {ExecutionDate} is goed ontvangen. Zodra je bent ingepland ontvang je een bevestigingsmail.' + CHAR(13) + CHAR(13) + 'Met vriendelijke groeten, Team Skool Workshop Veilingkade 15 | 4815 HC Breda | Tel. 085 - 0653923 | App. 06 - 28318842 Mail. info@skoolworkshop.nl | Web. www.skoolworkshop.nl'),

('AvailabilityRejection', 'Beste {FirstName},' + CHAR(13) + CHAR(13) + 'Jouw beschikbaarheid voor de {Workshop} voor {Customer} op {ExecutionDate} is geweigerd.' + CHAR(13) + CHAR(13) + 'Reden: {Reason}' + CHAR(13) + CHAR(13) + 'We hopen je snel weer in te kunnen zetten.' + CHAR(13) + CHAR(13) + 'Met vriendelijke groeten, Team Skool Workshop Veilingkade 15 | 4815 HC Breda | Tel. 085 - 0653923 | App. 06 - 28318842 Mail. info@skoolworkshop.nl | Web. www.skoolworkshop.nl'),

('AvailabilityRequest', 'Beste {FirstName}, Ben jij beschikbaar voor een {Workshop} op {ExecutionDate} van {FirstRoundStartTime} tot {LastRoundEndTime} in {City}? Login op jouw account om de workshop details te bekijken. We zien je reactie graag tegemoet.' + CHAR(13) + CHAR(13) + 'Met vriendelijke groeten, Team Skool Workshop Veilingkade 15 | 4815 HC Breda | Tel. 085 - 0653923 | App. 06 - 28318842 Mail. info@skoolworkshop.nl | Web. www.skoolworkshop.nl'),

('BackupList', 'Beste {FirstName}, Je aanmelding is in goede orde ontvangen. Voor de {Workshop} op {ExecutionDate} in {City} is er al een andere workshopdocent ingepland. We hebben je toegevoegd aan de back-up lijst. Mocht de huidige workshopdocent uitvallen, dan zullen wij jou benaderen.' + CHAR(13) + CHAR(13) + 'Met vriendelijke groeten, Team Skool Workshop Veilingkade 15 | 4815 HC Breda | Tel. 085 - 0653923 | App. 06 - 28318842 Mail. info@skoolworkshop.nl | Web. www.skoolworkshop.nl'),

('Cancellation', 'Beste {FirstName},' + CHAR(13) + CHAR(13) + 'We hebben uw annulering voor de {Workshop} op {ExecutionDate} in {City} ontvangen.' + CHAR(13) + CHAR(13) + 'Reden: {Reden}' + CHAR(13) + CHAR(13) + 'We hopen je snel weer in te kunnen zetten.' + CHAR(13) + CHAR(13) + 'Met vriendelijke groeten, Team Skool Workshop Veilingkade 15 | 4815 HC Breda | Tel. 085 – 0653923 | App. 06 – 28318842 Mail. info@skoolworkshop.nl | Web. www.skoolworkshop.nl'),

('RegistrationConfirmation', 'Beste {FirstName},' + CHAR(13) + CHAR(13) + 'Leuk dat je ons team wil versterken met het geven van workshops.' + CHAR(13) + CHAR(13) + 'Wij hebben je opgenomen in ons docentenregister. Login om jouw profiel bij te werken, zodat jij jezelf kan gaan aanmelden voor opdrachten.' + CHAR(13) + CHAR(13) + 'Met vriendelijke groeten, Team Skool Workshop Veilingkade 15 | 4815 HC Breda | Tel. 085 - 0653923 | App. 06 - 28318842 Mail. info@skoolworkshop.nl | Web. www.skoolworkshop.nl'),

('Registration', 'Beste {FirstName},' + CHAR(13) + CHAR(13) + 'De registratie van je account is in goede orde ontvangen!' + CHAR(13) + CHAR(13) + 'Zodra SkoolWorkshop jouw aanmelding heeft goedgekeurd zal je een mail ontvangen met een link naar de inlogpagina.' + CHAR(13) + CHAR(13) + 'Met vriendelijke groeten, Team Skool Workshop Veilingkade 15 | 4815 HC Breda | Tel. 085 - 0653923 | App. 06 - 28318842 Mail. info@skoolworkshop.nl | Web. www.skoolworkshop.nl');



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
░██████╗████████╗░█████╗░██████╗░███████╗██████╗░
██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██╔══██╗
╚█████╗░░░░██║░░░██║░░██║██████╔╝█████╗░░██║░░██║
░╚═══██╗░░░██║░░░██║░░██║██╔══██╗██╔══╝░░██║░░██║
██████╔╝░░░██║░░░╚█████╔╝██║░░██║███████╗██████╔╝
╚═════╝░░░░╚═╝░░░░╚════╝░╚═╝░░╚═╝╚══════╝╚═════╝░

██████╗░██████╗░░█████╗░░█████╗░███████╗██████╗░██╗░░░██╗██████╗░███████╗
██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗██║░░░██║██╔══██╗██╔════╝
██████╔╝██████╔╝██║░░██║██║░░╚═╝█████╗░░██║░░██║██║░░░██║██████╔╝█████╗░░
██╔═══╝░██╔══██╗██║░░██║██║░░██╗██╔══╝░░██║░░██║██║░░░██║██╔══██╗██╔══╝░░
██║░░░░░██║░░██║╚█████╔╝╚█████╔╝███████╗██████╔╝╚██████╔╝██║░░██║███████╗
╚═╝░░░░░╚═╝░░╚═╝░╚════╝░░╚════╝░╚══════╝╚═════╝░░╚═════╝░╚═╝░░╚═╝╚══════╝
*/

DROP PROCEDURE IF EXISTS WorkshopIdByName;
GO

CREATE PROCEDURE WorkshopIdByName @WorkshopName NVARCHAR(100)
AS
SELECT TOP 1 WorkshopId
FROM Workshop
WHERE WorkshopName = @WorkshopName
GO
/*

EXEC WorkshopIdByName @WorkshopName = 'Vloggen'

*/

DROP PROCEDURE IF EXISTS ClientIdByName;
GO

CREATE PROCEDURE ClientIdByName @ClientName NVARCHAR(100)
AS
SELECT TOP 1 ClientId
FROM Client
WHERE ClientName = @ClientName
GO
/*

EXEC ClientIdByName @ClientName = 'Avans Informatica B'

*/

-- Get all workshops in commissions where a user has been assigned to
DROP PROCEDURE IF EXISTS WorkshopCommissionsWithUserAssigned;
GO

CREATE PROCEDURE WorkshopCommissionsWithUserAssigned @UserId INT
AS
SELECT CommissionWorkshop.CommissionWorkshopId, WorkshopName, CONVERT(VARCHAR(10), Date, 120) AS Date, CONVERT(VARCHAR(8), StartTime, 108) AS StartTime, CONVERT(VARCHAR(8), EndTime, 108) AS EndTime, Requirements, Category, CommissionName, Location, LinkToPicture, CommissionWorkshopUser.UserId, CommissionWorkshopUser.Status
FROM CommissionWorkshop 
INNER JOIN Commission ON CommissionWorkshop.CommissionId = Commission.CommissionId 
INNER JOIN Workshop ON CommissionWorkshop.WorkshopId = Workshop.WorkshopId 
INNER JOIN CommissionWorkshopUser ON CommissionWorkshop.CommissionWorkshopId = CommissionWorkshopUser.CommissionWorkshopId
WHERE CommissionWorkshopUser.UserId = @UserId AND Status = 'Toegewezen'
ORDER BY Date, StartTime;
GO
/*

EXEC WorkshopCommissionsWithUserAssigned @UserId = 1

*/

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
SELECT CommissionWorkshopId, CommissionId, StartTime, EndTime, NumberOfParticipants, Location, Level,  WorkshopNotes, Workshop.WorkshopId, WorkshopName, Workshop.Category, Workshop.Requirements, Workshop.Description, Workshop.LinkToPicture
FROM CommissionWorkshop t1
INNER JOIN Workshop ON t1.WorkshopId = Workshop.WorkshopId
WHERE NOT EXISTS (SELECT t2.CommissionWorkshopId, t2.Status FROM CommissionWorkshopUser t2 WHERE t1.CommissionWorkshopId = t2.CommissionWorkshopId AND t2.Status = 'Toegewezen')

--Get workshops in commissions and all associated data for front page ordered by data and time
SELECT CommissionWorkshopId, WorkshopName, Date, StartTime, EndTime, Requirements, Category, CommissionName, Location, LinkToPicture FROM CommissionWorkshop
INNER JOIN Commission ON CommissionWorkshop.CommissionId = Commission.CommissionId
INNER JOIN Workshop ON CommissionWorkshop.WorkshopId = Workshop.WorkshopId
ORDER BY Date, StartTime