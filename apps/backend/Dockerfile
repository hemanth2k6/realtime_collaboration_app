FROM node:20-alpine

WORKDIR /app

# Enable workspaces
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY packages/shared/package.json packages/shared/

RUN npm install

COPY apps/backend apps/backend
COPY packages/shared packages/shared

WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app/apps/backend

CMD ["npm", "run", "dev"]
