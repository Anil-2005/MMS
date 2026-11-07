-- Create Database
CREATE DATABASE MMS;
GO

USE MMS;
GO

-- Create Farmers Table
CREATE TABLE Farmers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FarmerCode NVARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    PhoneNumber NVARCHAR(15),
    Address NVARCHAR(500),
    RegistrationDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    IsActive BIT NOT NULL DEFAULT 1,
    AccountBalance DECIMAL(18,2) NOT NULL DEFAULT 0
);

-- Create MilkCollections Table
CREATE TABLE MilkCollections (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FarmerId INT NOT NULL,
    CollectionDate DATE NOT NULL,
    CollectionTime TIME NOT NULL,
    Quantity DECIMAL(8,2) NOT NULL,
    FatPercentage DECIMAL(5,2) NOT NULL,
    SnfPercentage DECIMAL(5,2) NOT NULL,
    RatePerLiter DECIMAL(8,2) NOT NULL,
    TotalAmount DECIMAL(10,2) NOT NULL,
    Remarks NVARCHAR(MAX),
    FOREIGN KEY (FarmerId) REFERENCES Farmers(Id)
);

-- Create Payments Table
CREATE TABLE Payments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FarmerId INT NOT NULL,
    PaymentDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    Amount DECIMAL(10,2) NOT NULL,
    PaymentMethod INT NOT NULL, -- 1=Cash, 2=BankTransfer, 3=Cheque, 4=UPI
    ReferenceNumber NVARCHAR(50),
    Remarks NVARCHAR(500),
    FOREIGN KEY (FarmerId) REFERENCES Farmers(Id)
);

-- Create LedgerEntries Table
CREATE TABLE LedgerEntries (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FarmerId INT NOT NULL,
    TransactionDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    Description NVARCHAR(200) NOT NULL,
    DebitAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    CreditAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    Balance DECIMAL(10,2) NOT NULL,
    EntryType INT NOT NULL, -- 1=MilkCollection, 2=Payment, 3=Adjustment, 4=Deduction
    ReferenceId INT,
    FOREIGN KEY (FarmerId) REFERENCES Farmers(Id)
);

-- Create RateCharts Table
CREATE TABLE RateCharts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    MinFatPercentage DECIMAL(5,2) NOT NULL,
    MaxFatPercentage DECIMAL(5,2) NOT NULL,
    MinSnfPercentage DECIMAL(5,2) NOT NULL,
    MaxSnfPercentage DECIMAL(5,2) NOT NULL,
    RatePerLiter DECIMAL(8,2) NOT NULL,
    EffectiveFrom DATETIME2 NOT NULL,
    EffectiveTo DATETIME2,
    IsActive BIT NOT NULL DEFAULT 1
);

-- Create Users Table
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'Farmer',
    FarmerId INT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    IsActive BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (FarmerId) REFERENCES Farmers(Id)
);

-- Create Indexes
CREATE INDEX IX_MilkCollections_FarmerId ON MilkCollections(FarmerId);
CREATE INDEX IX_MilkCollections_CollectionDate ON MilkCollections(CollectionDate);
CREATE INDEX IX_Payments_FarmerId ON Payments(FarmerId);
CREATE INDEX IX_LedgerEntries_FarmerId ON LedgerEntries(FarmerId);
CREATE INDEX IX_LedgerEntries_TransactionDate ON LedgerEntries(TransactionDate);
CREATE INDEX IX_Users_FarmerId ON Users(FarmerId);