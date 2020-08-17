FROM node:12-alpine AS dev

# 2. Set the working directory
WORKDIR /usr/src/app

# 3. Copy the package.json and lock
COPY package.json yarn.lock ./

# 5. Install deps
RUN yarn install --pure-lockfile

# 6. Copy the app
COPY . .

# 7. Expose the port
EXPOSE 3000

# 8. Run the app
#CMD [ "yarn", "start" ]


FROM dev AS build

ARG REACT_APP_API_URL

RUN yarn build


FROM nginx:stable-alpine AS release

COPY --from=build /usr/src/app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
