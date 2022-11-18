FROM staijn/infraviewer:nx-base AS builder

RUN npx nx build api

FROM node:lts-alpine3.15
WORKDIR /app

COPY --from=builder /app/dist/apps/api /app
COPY --from=builder /app/package*.json /app
RUN npm install --omit=dev --ignore-scripts

CMD ["node", "main.js"]
