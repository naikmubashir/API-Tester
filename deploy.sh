#!/bin/bash

echo "---- Deploy run at $(date) ----" >> /root/API-Tester/deploy.log
# Navigate to the project directory
cd /root/API-Tester

# Pull the latest changes from the GitHub repository
git pull origin main
#git pull

# Install dependencies
#npm install

# Build the project
npm run build

# Restart the application using PM2
pm2 restart server
