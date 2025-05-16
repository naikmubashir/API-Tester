# --- Base image ---
FROM node:22-alpine

# --- Set working directory inside container ---
WORKDIR /app

# --- Copy backend package files and install dependencies ---
COPY package*.json ./
RUN npm install

# --- Copy the rest of the backend and frontend code ---
COPY . .

# --- Build the React frontend ---
WORKDIR /app/frontend
RUN npm install
RUN npm run build

WORKDIR /app

ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "server.js"]
