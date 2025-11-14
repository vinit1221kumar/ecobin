# 1️⃣ Use Node base image
FROM node:20-alpine

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy package files first
COPY package*.json ./

# 4️⃣ Install dependencies
RUN npm install --production

# 5️⃣ Copy source code
COPY . .

# 6️⃣ Expose backend port
EXPOSE 5000

# 7️⃣ Start command
CMD ["npm", "start"]
