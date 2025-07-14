# LoungeOS

This is a Next.js starter project for LoungeOS, a comprehensive management solution for lounges and restaurants. For more detailed documentation, please check the `docs/` folder.

## Getting Started

First, install the dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

The main application logic is in the `src/` directory.

## Local Deployment & Database Setup

This application is designed to run in a local environment without internet access, using an SQLite database for data persistence. The current state of the code uses mock data providers but is structured to easily integrate with a real database.

### Step 1: Install SQLite Driver

The `better-sqlite3` package is already included in `package.json`. Running `npm install` will set it up.

### Step 2: Create the Database File

Create an empty file named `loungeos.db` in the root directory of the project. This file will store all your application data.

### Step 3: Define the Database Schema

You need to create the necessary tables in your `loungeos.db` file. You can do this by running a SQL client against the database file or by creating a separate script. The full, detailed schema can be found in `docs/database.md`.

### Step 4: Seed the Database with Default Users

To get started quickly, you can populate the database with a default user for each role. This script will create the necessary user accounts for initial setup.

```bash
npm run db:seed
```

This will create the following user accounts with the password `password` for all of them:
- `superadmin@lounge.com` (Super Admin)
- `manager@lounge.com` (Manager)
- `stock@lounge.com` (Stock Manager)
- `chef@lounge.com` (Chef)
- `waiter-main@lounge.com` (Waiter, Main Floor)
- `waiter-vip@lounge.com` (Waiter, VIP Lounge)
- `cashier@lounge.com` (Cashier)
- `bartender@lounge.com` (Bartender)

For more details on roles and permissions, see `docs/authentication.md`.

### Step 5: Implement the Data Layer

The project contains a `src/lib/db` directory with files that abstract data operations. You will need to replace the mock logic in these files with actual database queries using `better-sqlite3`. An example is provided in `docs/database.md`.

## Image Uploads

The application is set up to handle image uploads for staff avatars and meal pictures. The logic assumes that images are not stored in the database. Instead, only the path to the image is stored. For full implementation details, see `docs/features.md`.
