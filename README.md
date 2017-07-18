# HTML to Image Server
## WORK IN PROGRESS
Renders to png any chunk of html using headless chrome.

## Dependencies
* `node`
* `npm`
* `google-chrome-stable`

## Server

### With Docker
Build image
```
docker build --tag gumgum/html2image .
```
Run server from container
```
docker run -p LOCAL_PORT:3000 gumgum/html2image
```
Run server from container with debug messages
```
docker run -p LOCAL_PORT:3000 -e "DEBUG=1" gumgum/html2image
```

### Standalone (requires local dependencies)
Starts express server at port 3000
```
npm install && npm start
```
---
Now browse to http://localhost:3000/ for a half-baked UI (assuming LOCAL_PORT = 3000)

### ENV VARS
* `DEBUG` boolean to show extra logs
* `WEBPORT` server port
* `CHROMEPORT` chrome debugging port

### Endpoints

* `GET /` -> renders the UI from (src/views/index.html)
* `POST /image` -> receives a form-data with structure and returns image/png binary
    ```
    timeout: int
    width: int
    height: int
    html: string
    ```

## CLI
----
`./cli --help`

Run server from container
```
docker run -v gumgum/html2image node cli.js --help
```

Run server from container with debug messages
```
docker run -v -e "DEBUG=1" gumgum/html2image node cli.js --help
```

TODO
----
* When cli is running in container I haven't figured out how to write to volume
* Improve logging
* Improve custom options
