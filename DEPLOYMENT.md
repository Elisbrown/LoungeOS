# LoungeOS Local Network Deployment Guide

This guide explains how to deploy LoungeOS on a local network so that multiple devices (POS terminals, kitchen displays, tablets) can access it.

## Option 1: Docker (Recommended)

This is the most robust way to run the application. It creates a self-contained environment.

### Prerequisites

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Mac/Windows) or Docker Engine (Linux).

### Setup & Run

1. **Prepare Data Folder**:
   Create a folder named `lounge_data` in the project root.

   ```bash
   mkdir lounge_data
   ```

   If you have existing data (users, menu items), copy your `loungeos.db` file into this folder.

   ```bash
   cp loungeos.db lounge_data/
   ```

2. **Start the Server**:
   Open a terminal in the project directory and run:

   ```bash
   docker-compose up -d --build
   ```

   This command builds the application and starts it in the background.

3. **Verify**:
   The app should be running at `http://localhost:9002`.

4. **Access from Local Network**:
   - Find your computer's local IP address:
     - **Mac**: Check System Settings > Wi-Fi (click Details) or run `ipconfig getifaddr en0` in terminal.
     - **Windows**: Run `ipconfig` in Command Prompt.
   - On other devices (iPad, Phone), open a browser and enter: `http://<YOUR_IP_ADDRESS>:9002`.

### Managing the App

- **Stop**: `docker-compose down`
- **View Logs**: `docker-compose logs -f`
- **Update**: `git pull` then `docker-compose up -d --build`

---

## Option 2: PM2 (Node.js Process Manager)

If you prefer running directly on your machine without Docker.

### Prerequisites

- Node.js installed (v18 or later).
- PM2 installed globally: `npm install -g pm2`.

### Setup & Run

1. **Build**:

   ```bash
   npm install
   npm run build
   ```

2. **Start with PM2**:

   ```bash
   pm2 start npm --name "loungeos" -- start
   ```

3. **Save (Auto-start on boot)**:
   ```bash
   pm2 save
   pm2 startup
   ```

### Access

Access uses the same method as Docker (using your local IP address on port 9002).

## Important: Firewalls

Ensure your computer's Firewall allows incoming connections on **Port 9002**.

- **Windows**: Allow "Node.js JavaScript Runtime" or the specific port in Windows Defender Firewall.
- **Mac**: Go to System Settings > Network > Firewall > Options, and ensure incoming connections are allowed (or add `node`).
