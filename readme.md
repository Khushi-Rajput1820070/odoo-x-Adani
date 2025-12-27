# GearGuard - Equipment Maintenance Tracking System

GearGuard is a comprehensive system to track company machines and fix them properly without confusion. It connects equipment, maintenance teams, and maintenance requests in one place.

## Project Structure

This project consists of two main parts:
- **Frontend**: A Next.js application in the `next_app` directory
- **Backend**: A Node.js/Express API with MongoDB in the `backend` directory

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory with the following content:
   ```env
   MONGODB_URI=mongodb+srv://lovelyblinks2007_db_user:oddo_adani@cluster0.xfpgxlr.mongodb.net/gearguard?retryWrites=true&w=majority
   PORT=5000
   ```

4. **Important MongoDB Setup Note**: 
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

5. Start the backend server:
   ```bash
   # For development
   npm run dev
   
   # For production
   npm start
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd next_app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the `next_app` directory with the following content:
   ```env
   BACKEND_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to http://localhost:3000

## How It Works

GearGuard connects three main components:

1. **Equipment** - All machines/assets in your company (CNC Machine, Printer, Laptop, Vehicle, etc.)
2. **Maintenance Teams** - Groups of technicians (Mechanics, Electricians, IT Support, etc.)
3. **Maintenance Requests** - Issues and tasks (Corrective: something broke, Preventive: planned checkups)

### Key Features

- **Equipment Tracking**: Store details about each machine including name, serial number, location, department, and maintenance team
- **Request Management**: Create and track maintenance requests with different types (Corrective vs Preventive)
- **Team Management**: Organize technicians into teams and assign them to equipment
- **Kanban Board**: Visual board to track requests in different stages (New, In Progress, Repaired, Scrap)
- **Calendar Integration**: Schedule preventive maintenance and track deadlines
- **Notifications**: Get notified about new requests and updates

### Workflow

1. **Equipment Registration**: Add all company equipment to the system
2. **Team Assignment**: Assign maintenance teams to each piece of equipment
3. **Request Creation**: When something breaks or needs maintenance, create a request
4. **Task Assignment**: Assign requests to appropriate team members
5. **Progress Tracking**: Move requests through the workflow (New → In Progress → Repaired)
6. **Reporting**: Generate reports on maintenance activities

## Technologies Used

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Icons**: Lucide React

## API Endpoints

The backend provides the following REST API endpoints:

- `/api/equipment` - Manage equipment
- `/api/requests` - Manage maintenance requests
- `/api/users` - Manage users
- `/api/teams` - Manage maintenance teams
- `/api/categories` - Manage equipment categories
- `/api/notifications` - Manage notifications
- `/api/tracking-logs` - Manage tracking logs
- `/api/requirements` - Manage requirements
- `/api/workcenters` - Manage work centers

## Data Models

The system includes the following core data models:

- **User**: System users with different roles (admin, technician, user)
- **Team**: Groups of technicians responsible for maintenance
- **Equipment**: Company machines and assets
- **MaintenanceRequest**: Maintenance tasks and issues
- **EquipmentCategory**: Categories for organizing equipment
- **Notification**: System notifications
- **TrackingLog**: Progress tracking for requests
- **Requirement**: Resource requirements for maintenance
- **WorkCenter**: Work centers for maintenance operations

## Authentication

Authentication is not implemented in this version. All endpoints are currently public. This will be implemented in future versions.

## License

This project is licensed under the MIT License.