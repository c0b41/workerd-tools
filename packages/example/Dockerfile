# Config build stage
FROM node:16.15.0-buster as build

ARG NODE_ENV
ARG WORKERD_ENV
ENV NODE_ENV $NODE_ENV
ENV WORKERD_ENV $WORKERD_ENV

WORKDIR /usr/src	

COPY package.json .
COPY yarn.lock .
COPY workerd.config.js  .

COPY src/ ./src

RUN yarn install --production=false --ignore-engines
RUN yarn build:config

# Compile to workerd binary
FROM ubuntu:22.04 AS comp

ARG WORKERD_VERSION=1.20230228.0

WORKDIR /usr/src
COPY --from=build /usr/src/ /usr/src/
COPY --from=build ./config.bin ./

RUN apt-get update
RUN apt-get install -y libc++-dev libc++abi-dev libc++1 tar

ADD https://registry.npmjs.org/@cloudflare/workerd-linux-64/-/workerd-linux-64-${WORKERD_VERSION}.tgz /tmp
RUN tar -xvzf /tmp/workerd-linux-64-${WORKERD_VERSION}.tgz -C /tmp
RUN mv /tmp/package/bin/workerd /usr/local/bin/workerd

RUN workerd compile -b ./config.bin > myapp

# Running stage with S6 overlay
FROM ubuntu:22.04 AS base
ARG S6_OVERLAY_VERSION=3.1.2.1

RUN apt-get update
RUN apt-get install -y libc++-dev libc++abi-dev libc++1 xz-utils

ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /usr/local/bin/tini
RUN chmod +x /usr/local/bin/tini

WORKDIR /usr/src
COPY --from=comp /usr/src/myapp /usr/local/bin/myapp
RUN chmod +x /usr/local/bin/myapp

ENTRYPOINT ["tini", "--"]

CMD ["myapp", "--verbose"]
