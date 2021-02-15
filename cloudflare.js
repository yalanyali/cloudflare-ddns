const fetch = require('node-fetch')

const API_ADDRESS = 'https://api.cloudflare.com/client/v4'

const ZONE_ID = process.env.ZONE_ID
const headers = {
  'X-Auth-Email': process.env.CLOUDFLARE_EMAIL,
  'X-Auth-Key': process.env.CLOUDFLARE_API_KEY
}

const getRecords = () => {
  const reqOpts = {
    headers,
    method: 'GET'
  }

  return fetch(`${API_ADDRESS}/zones/${ZONE_ID}/dns_records`, reqOpts)
    .then(response => response.json())
    .catch(error => console.log('error', error))
}

module.exports = {
  updateDNS: async (hostname, ip) => {
    const records = await getRecords()

    if (!records.success) {
      console.error('Cannot retrieve records.')
      return
    }

    const foundRecord = records.result.find(r => r.name === hostname)

    if (!foundRecord) {
      console.error(`Record not found: ${hostname}`)
      return
    }

    if (foundRecord.content === ip) {
      // console.debug(`No update needed: ${hostname} - ${ip}`)
      return
    }

    const { name, type, ttl } = foundRecord

    const reqOpts = {
      headers,
      method: 'PUT',
      body: JSON.stringify({
        name: name,
        type: type,
        ttl: ttl,
        content: ip
      })
    }

    return fetch(`${API_ADDRESS}/zones/${ZONE_ID}/dns_records/${foundRecord.id}`, reqOpts)
      .then(res => res.json())
      .then(({ success, errors }) => {
        if (success) {
          console.log(`Updated: ${hostname} - ${ip}`)
        } else {
          console.log(`Error updating ${hostname}:`, ...errors)
        }
      })
  }
}
