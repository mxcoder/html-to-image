FROM node:boron-slim
ENV NODE_ENV production
LABEL authors=ricardo@gumgum.com
EXPOSE 3000

#============================================
# Install Google Chrome (copied from https://hub.docker.com/r/selenium/node-chrome/~/dockerfile/)
#============================================
# can specify versions by CHROME_VERSION;
#  e.g. google-chrome-stable=53.0.2785.101-1
#       google-chrome-beta=53.0.2785.92-1
#       google-chrome-unstable=54.0.2840.14-1
#       latest (equivalent to google-chrome-stable)
#       google-chrome-beta  (pull latest beta)
#============================================
USER root
ARG CHROME_VERSION="google-chrome-stable"
RUN apt-get update && apt-get install -qy  --no-install-recommends apt-transport-https ca-certificates gnupg
RUN curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get -qy update \
    && apt-get -qy --no-install-recommends install ${CHROME_VERSION:-google-chrome-stable} \
    && rm /etc/apt/sources.list.d/google-chrome.list \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

#============================================
# Run node application
#============================================
USER node
RUN mkdir -p /home/node/app
COPY . /home/node/app
WORKDIR /home/node/app
RUN npm --silent install
CMD ["node", "server.js"]
