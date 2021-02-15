FROM node:slim as build
WORKDIR /app
COPY . .
RUN npm install --production

FROM gcr.io/distroless/nodejs
COPY --from=build /app /
CMD ["index.js"]
