FROM node:12-alpine

# 1. Create the working directory at '/home/node/app' and give node use permissions
RUN mkdir -p /usr/src/app

# 2. Set the working directory
WORKDIR /usr/src/app

# 3. Copy the package.json and lock
COPY package*.json yarn.lock ./

# 5. Install deps
RUN yarn

# 6. Copy the app
COPY . .

# 7. Expose the port
EXPOSE 3000

# 8. Run the app
#CMD [ "yarn", "start" ]
