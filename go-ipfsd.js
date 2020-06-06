const Ctl = require('ipfsd-ctl')

async function run () {
  const ipfsd = await Ctl.createController({
    ipfsHttpModule: require('ipfs-http-client'),
    ipfsBin: require('go-ipfs-dep').path(),
    args: ['--enable-pubsub-experiment']
  })
  const ipfs = ipfsd.api
  await ipfs.config.profiles.apply('server')
  await ipfs.ready

  const resolve = require('./resolve.js')
  await resolve(ipfs, () => ipfsd.stop())
}
run()
