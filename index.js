require('dotenv').config()
const app = require('express')()
const basicAuth = require('express-basic-auth')

const { updateDNS } = require('./cloudflare')

app.use(basicAuth({
  users: {
    [process.env.USERNAME]: process.env.PASSWORD
  }
}))

app.get('/nic/update', async (req, res) => {
  const { hostname, myip } = req.query
  if (!hostname || !myip) { return res.send('Hi.') }
  try {
    await updateDNS(hostname, myip)
  } catch (err) {
    console.error('Connection error:', err.message)
    return res.status(424)
  }
  res.status(200)
})

app.listen(process.env.PORT, () => {
  console.log(`Server started at port ${process.env.PORT}`)
})
