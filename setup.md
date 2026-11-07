# Milk Collection System Setup Guide

## Prerequisites
- .NET 10 SDK
- Node.js (18 or later)
- Angular CLI (`npm install -g @angular/cli`)
- SQL Server (LocalDB or full version)

## Backend Setup

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Restore packages:
```bash
dotnet restore
```

3. Update the connection string in `MilkCollection.API/appsettings.json` if needed.

4. Create and run migrations:
```bash
cd MilkCollection.API
dotnet ef migrations add InitialCreate
dotnet ef database update
```

5. Run the API:
```bash
dotnet run
```

The API will be available at `https://localhost:7000`

## Frontend Setup

1. Navigate to the Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

The frontend will be available at `http://localhost:4200`

## Database Setup

1. Run the SQL scripts in the Database folder:
   - First run `CreateDatabase.sql` to create the database and tables
   - Then run `SampleData.sql` to insert sample data

## Features Implemented

### Backend
- Clean Architecture with Core, Infrastructure, and API layers
- Entity Framework Core with SQL Server
- Repository pattern
- RESTful API endpoints
- CORS configuration for Angular frontend

### Frontend
- Angular 18 with standalone components
- Bootstrap for styling
- Lazy loading routes
- Reactive forms
- HTTP client for API communication

### Modules
- ✅ Farmer Management (Complete CRUD)
- ✅ Milk Collection (Create, Read, Delete)
- ✅ Dashboard with statistics
- 🚧 Payments (UI ready, backend to be extended)
- 🚧 Reports (UI ready, logic to be implemented)
- 🚧 Ledger (Backend ready, UI to be implemented)

## Next Steps

1. Complete Payment management functionality
2. Implement Reports with actual data
3. Add Ledger UI components
4. Implement Rate Chart management
5. Add data validation and error handling
6. Add unit tests
7. Implement notifications system