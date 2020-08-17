FROM node:12-alpine AS dev

# 2. Set the working directory
WORKDIR /usr/src/app

# 3. Copy the package.json and lock
COPY package*.json yarn.lock ./

# 5. Install deps
RUN yarn

# 6. Copy the app
COPY . .

# 7. Expose the port
EXPOSE 8888

# 8. Run the app
CMD [ "yarn", "run", "dev" ]

# Production image
FROM node:12-alpine AS release

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile

COPY . .

CMD ["yarn", "start"]
