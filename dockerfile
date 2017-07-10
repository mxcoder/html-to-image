FROM node:boron
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
RUN apt-get -qqy --no-install-recommends install wget
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update -qqy \
    && apt-get -qqy --no-install-recommends install ${CHROME_VERSION:-google-chrome-stable} \
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
