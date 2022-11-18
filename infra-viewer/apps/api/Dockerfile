FROM staijn/infraviewer:nx-base AS builder

RUN set NX_DAEMON=false && npx nx build api --verbose

CMD ["node", "dist/apps/api/main.js"]
