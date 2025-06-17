# Voting System

A secure and flexible electronic voting system built with Electron, React, and Node.js. The system supports multiple types of ballots including single choice, multiple choice, ranked choice, linear choice, yes/no, and text input voting options.

## Features

- 🔐 Secure authentication and session management
- 👥 User role management
- 📊 Multiple ballot types:
  - Single Choice
  - Multiple Choice
  - Ranked Choice
  - Linear Choice
  - Yes/No
  - Text Input
- 🗂️ Category-based organization
- 🎨 Modern and intuitive user interface
- 🖥️ Cross-platform desktop application

## Project Structure

The project is organized into three main directories:

- `client/` - Electron/React frontend application
- `server/` - Node.js backend server
- `shared/` - Shared configurations and types

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A SQL database (MySQL/PostgreSQL)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd voting-system
```

2. Install dependencies for both client and server:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Configure your environment variables:
   - Create `.env` files in both client and server directories
   - Set up your database connection string and other required variables

## Development

1. Start the server in development mode:
```bash
cd server
npm run dev
```

2. Start the client in development mode:
```bash
cd client
npm start
```

## Building

To build the desktop application:

```bash
cd client
npm run build
```

This will create platform-specific builds in the `client/dist` directory.

## Project Structure Details

### Client
- `src/` - Source code
  - `api/` - API client configuration
  - `auth/` - Authentication context and protected routes
  - `components/` - Reusable React components
  - `pages/` - Application pages and forms
  - `types/` - TypeScript type definitions

### Server
- `src/` - Source code
  - `controllers/` - Request handlers
  - `models/` - Database models and entities
  - `routes/` - API route definitions
  - `middleware/` - Custom middleware
  - `migrations/` - Database migrations

## License

[Your chosen license]

## Contributing

[Your contribution guidelines]
