# Demo of Puppeteer (Chromium API)

- obtains a value from 'some API'
- intercepts each requests and adds custom header with value from 'some API'
- loads page
- makes a print screen

```
node index.js http://textlab-app.com a-header-key http://api/post/to/get/some/key http://some-proxy-server
```