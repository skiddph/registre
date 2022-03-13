const returnObject = (r) => {
  return typeof r === 'object' ? r : {}
}

const createOptions = (serverOpts, opts) => {
  // if server opts is not an object, or null, create an empty object
  serverOpts = serverOpts && typeof serverOpts === 'object' ? serverOpts : {}
  opts = opts && typeof opts === 'object' ? opts : {}

  serverOpts = {...serverOpts, ...(opts?.options || {})}
  opts.options = {}

  opts.recursiveCall = opts.recursiveCall || true

  if (opts.recursiveCall === true) {
    opts.recursiveCall == false
    if (String(process.env.NODE_ENV).toLowerCase() == 'development' && opts.dev) {
      serverOpts = {
        ...serverOpts,
        ...(
          typeof opts.dev === 'object' ?
            createOptions(serverOpts, opts.dev) :
            typeof opts.dev === 'function' ?
              returnObject(opts.dev(serverOpts, opts)) :
              {}
        )
      }
    } else if (String(process.env.NODE_ENV).toLowerCase() == 'production' && opts.prod) {
      serverOpts = {
        ...serverOpts,
        ...(
          typeof opts.prod === 'object' ?
            createOptions(serverOpts, opts.prod) :
            typeof opts.prod === 'function' ?
              returnObject(opts.prod(serverOpts, opts)) :
              {}
        )
      }
    }
  }
  return serverOpts
}

module.exports = {
  createOptions
}