async function resolve (ipfs, stopIpfs) {
  const hash = process.env.DAG_HASH
  const fetchTimeout = process.env.TIMEOUT || 300 * 1000

  console.info({ hash, fetchTimeout })

  let exiting = false

  const shutdown = async () => {
    exiting = true
    console.info('Stopping...')
    try {
      await stopIpfs()
    } catch (err) {
      console.error(err)
    }
    console.info('Done')
    process.exit()
  }

  process.on('SIGINT', shutdown)
  process.on('beforeExit', shutdown)

  if (!hash) {
    console.info('DAG_HASH not set')
    shutdown()
  }

  const queue = new Set()
  const complete = new Set()
  const failed = new Set()

  queue.add(hash)

  async function resolveItem (itemHash) {
    console.info(`Resolving ${itemHash}`)
    try {
      const contents = await ipfs.dag.get(itemHash, { timeout: fetchTimeout })
      // console.dir(contents)
      const cids = [...contents.value.next, ...contents.value.refs].map(c => c.toString())
      const filtered = cids.filter(h => !(complete.has(h) || failed.has(h) || queue.has(h)))
      filtered.forEach(h => queue.add(h))
      complete.add(itemHash)
      queue.delete(itemHash)
    } catch (err) {
      console.error(err)
      failed.add(itemHash)
      queue.delete(itemHash)
    }
  }

  while ((!exiting) && Array.from(queue.keys()).length > 0) {
    const itemHash = Array.from(queue.keys())[0]
    if (itemHash) {
      await resolveItem(Array.from(queue.keys())[0])
    } else {
      console.dir([{ itemHash }, Array.from(queue.keys())])
      await shutdown()
    }
  }

  console.info('Finished')
  console.info(`Completed: ${Array.from(complete.keys()).length}`)
  console.info(`Failed: ${JSON.stringify(Array.from(failed.keys()), null, 2)}`)

  await shutdown()
}

module.exports = resolve
