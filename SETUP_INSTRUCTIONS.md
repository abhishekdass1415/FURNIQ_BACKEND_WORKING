# FurniQ Admin Panel - Setup Instructions

This guide will help you set up and run the FurniQ Admin Panel locally with both frontend and backend servers.

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas)
- Git

## Project Structure

```
FurniQ-Admin_Panel-main/
├── FurniQ-Admin_Panel-front/     # Next.js Frontend
├── FurniQ-Panel-Backend/         # Express.js Backend
├── start-dev.js                  # Development startup script
└── SETUP_INSTRUCTIONS.md         # This file
```

## Quick Start (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   cd FurniQ-Admin_Panel-main
   ```

2. **Install dependencies for both frontend and backend:**
   ```bash
   # Install backend dependencies
   cd FurniQ-Panel-Backend
   npm install
   
   # Install frontend dependencies
   cd ../FurniQ-Admin_Panel-front
   npm install
   ```

3. **Set up environment variables:**
   
   **Backend (.env file in FurniQ-Panel-Backend):**
   ```bash
   # Copy the example file
   cp env.example .env
   ```
   
   **Frontend (.env.local file in FurniQ-Admin_Panel-front):**
   ```bash
   # Copy the example file
   cp env.example .env.local
   ```

4. **Set up MongoDB:**
   - Install MongoDB locally, or
   - Use MongoDB Atlas (cloud service)
   - Update the `DATABASE_URL` in your backend `.env` file

5. **Run the development servers:**
   ```bash
   # From the root directory
   node start-dev.js
   ```

   This will start both servers automatically:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

## Manual Setup (Alternative)

If you prefer to run servers separately:

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd FurniQ-Panel-Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd FurniQ-Admin_Panel-front
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the frontend server:**
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (.env)
```env
# Database Configuration
DATABASE_URL="mongodb://localhost:27017/furniq_admin"

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Supabase Configuration (for image uploads)
SUPABASE_URL=https://cekaxlsuemkcqgzgiigw.supabase.co
SUPABASE_ANON_KEY=your_supabase_key_here
```

### Frontend (.env.local)
```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cekaxlsuemkcqgzgiigw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key_here
```

## Testing the Setup

1. **Check Backend API:**
   - Visit: http://localhost:5000
   - Should see: `{"message":"Welcome to FurniQ API server!","status":"running"}`
   - API Status: http://localhost:5000/api/status

2. **Check Frontend:**
   - Visit: http://localhost:3000
   - Should see the FurniQ Admin Panel login page

3. **Test API Connection:**
   - Try logging in (you'll need to create a user first)
   - Check browser console for any connection errors

## API Endpoints

The backend provides the following API endpoints:

- **Auth:** `/api/auth/login`, `/api/auth/register`
- **Products:** `/api/products` (GET, POST, PUT, DELETE)
- **Categories:** `/api/categories` (GET, POST, PUT, DELETE)
- **Customers:** `/api/customers` (GET, POST, PUT, DELETE)
- **Inventory:** `/api/inventories` (GET, POST)
- **Users:** `/api/users` (GET, PUT)

## Troubleshooting

### Common Issues

1. **Backend server not starting:**
   - Check if MongoDB is running
   - Verify environment variables in `.env`
   - Check if port 5000 is available

2. **Frontend can't connect to backend:**
   - Ensure backend is running on port 5000
   - Check CORS configuration
   - Verify `NEXT_PUBLIC_API_BASE_URL` in frontend `.env.local`

3. **Database connection issues:**
   - Verify MongoDB is running
   - Check `DATABASE_URL` in backend `.env`
   - Run `npx prisma db push` to sync schema

4. **Port already in use:**
   - Change port in `.env` files
   - Kill processes using the ports: `npx kill-port 3000 5000`

### Useful Commands

```bash
# Check if ports are in use
npx kill-port 3000 5000

# Reset database
npx prisma db push --force-reset

# Generate Prisma client
npx prisma generate

# View database
npx prisma studio
```

## Development Workflow

1. **Start development servers:** `node start-dev.js`
2. **Make changes to code**
3. **Test changes in browser**
4. **Stop servers:** `Ctrl+C`

## Production Deployment

For production deployment:

1. **Backend:**
   - Set `NODE_ENV=production`
   - Use a production MongoDB instance
   - Set secure JWT secret
   - Configure proper CORS origins

2. **Frontend:**
   - Build: `npm run build`
   - Set production API URL
   - Deploy to Vercel, Netlify, or similar

## Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check if all dependencies are installed

## Features

- ✅ User authentication and authorization
- ✅ Product management (CRUD operations)
- ✅ Category management
- ✅ Customer management
- ✅ Inventory tracking
- ✅ Image upload via Supabase
- ✅ Responsive admin panel UI
- ✅ Real-time API integration
- ✅ Error handling and loading states
