FROM denoland/deno:1.43.5

ARG GIT_REVISION
ARG DATABASE_HOST=${DATABASE_HOST}
ARG DATABASE_PORT=${DATABASE_PORT}
ARG DATABASE_NAME=${DATABASE_NAME}
ARG DATABASE_USER=${DATABASE_USER}
ARG DATABASE_PASSWORD=${DATABASE_PASSWORD}

ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

WORKDIR /app

COPY . .
RUN deno cache main.ts

EXPOSE 8000

CMD ["run", "-A", "main.ts"]