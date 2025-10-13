FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Enable Corepack (ships with Node 20)
RUN corepack enable

# Install dependencies
RUN pnpm install

COPY . .

EXPOSE 5173
CMD ["pnpm", "dev", "--host"]
