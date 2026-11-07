USE MMS;
GO

-- Insert Sample Farmers
INSERT INTO Farmers (FarmerCode, Name, PhoneNumber, Address, RegistrationDate, IsActive, AccountBalance) VALUES
('F001', 'Rajesh Kumar', '9876543210', '123 Main St, Village ABC', GETDATE(), 1, 1500.00),
('F002', 'Priya Sharma', '9876543211', '456 Oak Ave, Village DEF', GETDATE(), 1, 2300.50),
('F003', 'Amit Singh', '9876543212', '789 Pine Rd, Village GHI', GETDATE(), 1, 800.75),
('F004', 'Sunita Devi', '9876543213', '321 Elm St, Village JKL', GETDATE(), 1, 1200.25),
('F005', 'Ramesh Patel', '9876543214', '654 Maple Dr, Village MNO', GETDATE(), 1, 950.00);

-- Insert Sample Rate Chart
INSERT INTO RateCharts (MinFatPercentage, MaxFatPercentage, MinSnfPercentage, MaxSnfPercentage, RatePerLiter, EffectiveFrom, IsActive) VALUES
(3.0, 4.0, 8.0, 9.0, 28.00, '2024-01-01', 1),
(4.0, 5.0, 8.0, 9.0, 32.00, '2024-01-01', 1),
(3.0, 4.0, 9.0, 10.0, 30.00, '2024-01-01', 1),
(4.0, 5.0, 9.0, 10.0, 35.00, '2024-01-01', 1);

-- Insert Sample Milk Collections
INSERT INTO MilkCollections (FarmerId, CollectionDate, CollectionTime, Quantity, FatPercentage, SnfPercentage, RatePerLiter, TotalAmount) VALUES
(1, '2024-01-15', '06:00:00', 15.5, 4.2, 8.8, 32.50, 503.75),
(2, '2024-01-15', '06:15:00', 12.0, 3.8, 8.5, 29.00, 348.00),
(3, '2024-01-15', '06:30:00', 8.5, 4.5, 9.2, 35.50, 301.75),
(1, '2024-01-15', '18:00:00', 14.0, 4.1, 8.9, 31.50, 441.00),
(2, '2024-01-15', '18:15:00', 11.5, 3.9, 8.6, 30.00, 345.00),
(4, '2024-01-16', '06:00:00', 18.0, 4.3, 9.1, 33.00, 594.00),
(5, '2024-01-16', '06:45:00', 10.2, 3.7, 8.4, 28.50, 290.70);

-- Insert Sample Payments
INSERT INTO Payments (FarmerId, PaymentDate, Amount, PaymentMethod, ReferenceNumber) VALUES
(1, '2024-01-10', 800.00, 2, 'TXN123456789'),
(2, '2024-01-10', 1200.00, 1, NULL),
(3, '2024-01-12', 500.00, 4, 'UPI987654321');

-- Insert Sample Ledger Entries
INSERT INTO LedgerEntries (FarmerId, TransactionDate, Description, DebitAmount, CreditAmount, Balance, EntryType, ReferenceId) VALUES
(1, '2024-01-15', 'Milk Collection - Morning', 503.75, 0, 503.75, 1, 1),
(1, '2024-01-15', 'Milk Collection - Evening', 441.00, 0, 944.75, 1, 4),
(2, '2024-01-15', 'Milk Collection - Morning', 348.00, 0, 348.00, 1, 2),
(2, '2024-01-15', 'Milk Collection - Evening', 345.00, 0, 693.00, 1, 5),
(3, '2024-01-15', 'Milk Collection - Morning', 301.75, 0, 301.75, 1, 3);

GO