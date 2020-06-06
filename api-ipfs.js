const IpfsHttpClient = require('ipfs-http-client')

async function run () {
  const ipfsHost = process.env.IPFS_HOST | 'http://ipfs:5001'
  console.info({ipfsHost})
  const ipfs = await IpfsHttpClient(ipfsHost)

  const resolve = require('./resolve.js')
  await resolve(ipfs, () => {})
}
run()
