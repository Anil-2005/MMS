# Milk Collection Management System

A comprehensive system for managing dairy farmer operations, milk collection, and payments.

## Architecture
- **Frontend**: Angular (latest version)
- **Backend**: ASP.NET Core Web API (.NET 10)
- **Database**: SQL Server with EF Core 10
- **Authentication**: Simple authentication (no JWT)

## Modules
- Farmer Management
- Milk Collection
- Rate Calculation
- Payments
- Ledger
- Reports
- Notifications

## Structure
```
├── Backend/                 # ASP.NET Core Web API
│   ├── MilkCollection.API/
│   ├── MilkCollection.Core/
│   ├── MilkCollection.Infrastructure/
│   └── MilkCollection.Tests/
├── Frontend/                # Angular Application
└── Database/               # SQL Scripts
```

## Getting Started

### Backend Setup
1. Navigate to `Backend/`
2. Run `dotnet restore`
3. Update connection string in `appsettings.json`
4. Run `dotnet ef database update`
5. Run `dotnet run`

### Frontend Setup
1. Navigate to `Frontend/`
2. Run `npm install`
3. Run `ng serve`