# GearGuard Backend

This is the backend server for the GearGuard maintenance tracking system. It provides a REST API for managing equipment, maintenance requests, teams, users, and other related data using MongoDB as the database.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following content:
   ```env
   MONGODB_URI=mongodb+srv://lovelyblinks2007_db_user:oddo_adani@cluster0.xfpgxlr.mongodb.net/gearguard?retryWrites=true&w=majority
   PORT=5000
   ```

3. **Important MongoDB Setup Note**: 
   If you're getting a connection error, it's likely because your IP address needs to be whitelisted in MongoDB Atlas. You have two options:
   
   **Option A: Whitelist your IP in MongoDB Atlas**
   - Go to MongoDB Atlas dashboard
   - Navigate to Network Access
   - Add your current IP address to the whitelist
   - Or add 0.0.0.0/0 to allow access from any IP (not recommended for production)
   
   **Option B: Use a local MongoDB instance for development**
   - Install MongoDB locally
   - Change the MONGODB_URI to: `mongodb://localhost:27017/gearguard`
   - Make sure MongoDB service is running locally

4. Start the server:
   ```bash
   # For development
   npm run dev
   
   # For production
   npm start
   ```

## API Endpoints

- `GET /api/equipment` - Get all equipment
- `GET /api/equipment?id={id}` - Get specific equipment by ID
- `POST /api/equipment` - Create new equipment
- `PUT /api/equipment` - Update equipment
- `DELETE /api/equipment?id={id}` - Delete equipment

- `GET /api/requests` - Get all maintenance requests
- `GET /api/requests?id={id}` - Get specific request by ID
- `POST /api/requests` - Create new request
- `PUT /api/requests` - Update request
- `DELETE /api/requests?id={id}` - Delete request

- `GET /api/users` - Get all users
- `GET /api/users?id={id}` - Get specific user by ID
- `POST /api/users` - Create new user
- `PUT /api/users` - Update user
- `DELETE /api/users?id={id}` - Delete user

- `GET /api/teams` - Get all teams
- `GET /api/teams?id={id}` - Get specific team by ID
- `POST /api/teams` - Create new team
- `PUT /api/teams` - Update team
- `DELETE /api/teams?id={id}` - Delete team

- `GET /api/categories` - Get all categories
- `GET /api/categories?id={id}` - Get specific category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories` - Update category
- `DELETE /api/categories?id={id}` - Delete category

- `GET /api/notifications` - Get all notifications
- `GET /api/notifications?id={id}` - Get specific notification by ID
- `POST /api/notifications` - Create new notification
- `PUT /api/notifications` - Update notification
- `DELETE /api/notifications?id={id}` - Delete notification

- `GET /api/tracking-logs` - Get all tracking logs
- `GET /api/tracking-logs?id={id}` - Get specific tracking log by ID
- `POST /api/tracking-logs` - Create new tracking log
- `PUT /api/tracking-logs` - Update tracking log
- `DELETE /api/tracking-logs?id={id}` - Delete tracking log

- `GET /api/requirements` - Get all requirements
- `GET /api/requirements?id={id}` - Get specific requirement by ID
- `POST /api/requirements` - Create new requirement
- `PUT /api/requirements` - Update requirement
- `DELETE /api/requirements?id={id}` - Delete requirement

- `GET /api/workcenters` - Get all work centers
- `GET /api/workcenters?id={id}` - Get specific work center by ID
- `POST /api/workcenters` - Create new work center
- `PUT /api/workcenters` - Update work center
- `DELETE /api/workcenters?id={id}` - Delete work center

## Database

The application uses MongoDB for data storage. The MongoDB URI is configured in the `.env` file.

## Authentication

Authentication is not implemented in this version. All endpoints are currently public.

## Models

The backend includes the following models:
- User
- Team
- Equipment
- MaintenanceRequest
- EquipmentCategory
- Notification
- TrackingLog
- Requirement
- WorkCenter