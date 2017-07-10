HTML to Image
====
Renders any chunk of html using headless chrome.

Docker
----
Build image
```
docker build --tag gumgum/html2image .
```

Server
----
`npm install && npm start`

Starts a small express server at port 3000

Run server from container
```
docker run -p LOCAL_PORT:3000 gumgum/html2image
```

Run server from container with debug messages
```
docker run -p LOCAL_PORT:3000 -e "DEBUG=1" gumgum/html2image
```

CLI
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
When cli is running in container I haven't figured out how to write to volume
