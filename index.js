const axios = require('axios')
const puppeteer = require('puppeteer')

const url = process.argv[2]
const apiKey = process.argv[3]
const apiUrl = process.argv[4]
const proxy = process.argv[5]

console.log(`Trying to make print screen from:   ${url}`)
console.log(`Key to be intercepted into headers: ${apiKey}`)
console.log(`API URL to get value for apiKey:    ${apiUrl}`)
console.log(`Proxy server to be used:            ${proxy}`)

const getOptions = () => {
  const args = ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors', 'about:blank']
  if (proxy) {
    args.push(`--proxy-server=${proxy}`)
  }
  return {
    headless: false,
    devtools: true,
    ignoreHTTPSErrors: true,
    args: args
  }
}

const getHeaderValue = async () => {
  const response = await axios.post(apiUrl)
  const headerValue = response.data.sessionId
  return headerValue
}

const loadPage = async (defaultOptions, headerValue) => {
  const browser = await puppeteer.launch(defaultOptions)
  try {
    const page = await browser.newPage()
    page.setViewport({ width: 1280, height: 1024 })

    page.on('console', function(ev) {
      console.log({ type: ev.type }, `Console: ${ev.text()}`)
    })
    page.on('error', function(err) {
      console.log({ err }, 'Error')
    })
    page.on('pageerror', function(err) {
      console.log({ err }, 'PageError')
    })

    page.setRequestInterception(true)
    page.on('request', request => {
      const headers = request.headers()
      console.log(request.url())
      headers[apiKey] = headerValue
      request.continue({ headers })
    })

    await page.goto(url, {
      timeout: 60000
    })
    await page.screenshot({ path: 'image.png' })
  } catch (e) {
    console.log(e)
  } finally {
    await browser.close()
  }
}

const main = async () => {
  const start = Date.now()
  let defaultOptions = getOptions()
  const headerValue = await getHeaderValue()
  await loadPage(defaultOptions, headerValue)
  console.log(Date.now() - start)
}

main()
