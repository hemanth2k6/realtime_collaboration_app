FROM node:20-alpine

WORKDIR /app

# Enable workspaces
COPY package.json package-lock.json ./
COPY apps/frontend/package.json apps/frontend/
COPY packages/shared/package.json packages/shared/

RUN npm install

COPY apps/frontend apps/frontend
COPY packages/shared packages/shared

WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app/apps/frontend

CMD ["npm", "run", "dev"]
