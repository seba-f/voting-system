# Voting System

A secure and flexible electronic voting system built with Electron, React, and Node.js. This application provides a comprehensive solution for creating, managing, and participating in various types of voting activities within an organization or community.

![Voting System Logo](client/src/assets/logo_full.svg)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Development](#development)
- [Building](#building)
- [Usage](#usage)
- [Ballot Types](#ballot-types)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Analytics and Reporting](#analytics-and-reporting)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Voting System is a desktop application designed to facilitate voting processes in organizations. It provides an intuitive interface for administrators to create different types of ballots, manage users and categories, and analyze voting results. Regular users can easily participate in votes and view results once ballots have ended.

## Features

- **🔐 Secure Authentication & Session Management**
  - JWT-based authentication
  - Session expiration alerts
  - Role-based access control

- **👥 User Management**
  - Add and manage user accounts
  - Role assignment
  - Activity tracking

- **📊 Multiple Ballot Types**
  - Single Choice
  - Multiple Choice
  - Ranked Choice
  - Linear Choice (Scale-based)
  - Yes/No
  - Text Input

- **🗂️ Category-based Organization**
  - Group ballots by categories
  - Category-specific permissions

- **📈 Advanced Analytics**
  - Real-time participation tracking
  - Vote distribution visualization
  - Time-based analytics

- **🎨 Modern UI/UX**
  - Responsive design
  - Dark/light theme switching
  - Intuitive navigation

- **🔔 Status Management**
  - Active, suspended, and ended ballot states
  - Time-based status transitions
  - Manual status control

## Project Structure

The application is organized into three main directories:

### `client/`
Contains the Electron/React frontend application with the following structure:
```
client/
├── forge.config.ts          # Electron Forge configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── webpack.*.config.ts      # Webpack configuration files
└── src/                     # Source code
    ├── app.tsx              # Main React application
    ├── constants.ts         # Application constants
    ├── main.ts              # Electron main process
    ├── preload.ts           # Electron preload script
    ├── renderer.ts          # Electron renderer process
    ├── theme.ts             # UI theming
    ├── api/                 # API integration
    ├── assets/              # Images and icons
    ├── auth/                # Authentication components
    ├── components/          # Reusable UI components
    ├── constants/           # Application constants
    ├── pages/               # Application pages
    │   ├── admin/           # Admin-specific pages
    │   └── voteForms/       # Vote form components
    ├── styles/              # Global styles
    ├── types/               # TypeScript type definitions
    └── utils/               # Utility functions
```

### `server/`
Contains the Node.js backend server with the following structure:
```
server/
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── src/                     # Source code
    ├── app.ts               # Express application setup
    ├── config/              # Server configuration
    ├── controllers/         # API controllers
    │   ├── authController.ts
    │   └── ballot/          # Ballot-related controllers
    ├── models/              # Database models
    │   ├── db.ts            # Database connection
    │   └── entities/        # Entity definitions
    └── routes/              # API routes
```

### `shared/`
Contains shared configurations and types used by both client and server:
```
shared/
└── sessionConfig.ts         # Session configuration
```

## Technology Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Electron** - Desktop application framework
- **Material UI** - Component library
- **React Router** - Navigation
- **Formik & Yup** - Form handling and validation
- **Chart.js** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Sequelize** - ORM for database operations
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **MySQL2** - Database driver
- **TypeScript** - Type-safe JavaScript

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd voting-system
   ```

2. **Install dependencies**:
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Configure the environment**:
   
   Create `.env` files in both client and server directories with appropriate configurations.

   Server `.env` example:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=voting_system
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```

4. **Initialize the database**:
   
   Create a MySQL database and configure the connection in the server's `.env` file.

## Development

1. **Start the backend server**:
   ```bash
   cd server
   npm run dev
   ```
   This starts the server in development mode with hot-reloading using nodemon.

2. **Start the frontend application**:
   ```bash
   cd client
   npm start
   ```
   This launches the Electron application in development mode.

## Building

To create a distributable package of the desktop application:

```bash
cd client
npm run make
```

This will create platform-specific builds in the `client/out` directory.

For specific platforms:
- Windows: `npm run make -- --platform=win32`
- macOS: `npm run make -- --platform=darwin`
- Linux: `npm run make -- --platform=linux`

## Usage

### Administrator Functions

1. **User Management**
   - Create new users and assign roles
   - Manage existing users
   - Reset passwords

2. **Category Management**
   - Create and edit categories
   - Assign roles to categories

3. **Ballot Management**
   - Create ballots with various voting types
   - Suspend or end ballots early
   - View detailed ballot analytics

### User Functions

1. **Voting**
   - View active ballots
   - Cast votes
   - View past votes

2. **Results**
   - View results for ended ballots
   - See voting analytics and statistics

## Ballot Types

The system supports various ballot types to accommodate different voting scenarios:

### Single Choice
Allows users to select exactly one option from a list of choices.

### Multiple Choice
Allows users to select one or more options from a list of choices.

### Ranked Choice
Users rank the available options according to their preference. Results are calculated using the Borda Count method.

### Linear Choice
Presents a linear scale (e.g., 1-10) for users to provide a rating or score.

### Yes/No
Simple binary choice for straightforward decisions.

### Text Input
Allows users to submit free-text responses for open-ended feedback.

## User Roles and Permissions

The system implements role-based access control:

- **Admin**: Full system access, can create and manage all aspects
- **User**: Can vote on ballots assigned to their categories
- **Custom Roles**: Can be created with specific permissions for categories

## Analytics and Reporting

The system provides comprehensive analytics for ballot results:

- **Participation Statistics**
  - Total eligible voters
  - Actual participation counts and rates
  - Comparison to past ballots

- **Vote Distribution**
  - Distribution of votes across options
  - Percentage breakdowns
  - Rankings for ranked-choice ballots

- **Temporal Analysis**
  - Voting patterns over time
  - Peak voting times
  - Day-by-day comparisons

## API Documentation

### Authentication Endpoints

- `POST /api/login` - Authenticate user
- `GET /api/sessions` - Validate session
- `DELETE /api/sessions` - Logout

### User Management Endpoints

- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Category Management Endpoints

- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Ballot Management Endpoints

- `GET /api/ballots` - List all ballots
- `GET /api/ballots/active` - List active ballots
- `GET /api/ballots/past` - List past ballots
- `GET /api/ballots/suspended` - List suspended ballots
- `GET /api/ballots/:id` - Get ballot details
- `POST /api/ballots` - Create ballot
- `POST /api/ballots/:id/vote` - Submit vote
- `GET /api/ballots/:id/vote` - Get user's vote
- `GET /api/ballots/:id/analytics` - Get ballot analytics
- `POST /api/ballots/:id/suspend` - Suspend ballot
- `POST /api/ballots/:id/unsuspend` - Unsuspend ballot
- `POST /api/ballots/:id/end` - End ballot early

## Security

The Voting System implements several security measures:

1. **Authentication**
   - JWT token-based authentication
   - Secure password hashing with bcrypt
   - Session expiration handling

2. **Authorization**
   - Role-based access control
   - Category-based permissions

3. **Data Protection**
   - Input validation
   - Parameterized queries to prevent SQL injection
   - CORS protection

4. **Session Management**
   - Automatic session cleanup
   - Session expiry warnings
   - Secure token storage

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

© 2025 Voting System - Created as part of a Licenta (Thesis) Project
