const logger = (req, res, next) => {
  const start = Date.now()

  res.on("finish", () => {
    const duration = Date.now() - start
    const log = [
      `[${new Date().toISOString()}]`,
      req.method,
      req.originalUrl,
      `-`,
      res.statusCode,
      `-`,
      `${duration}ms`,
      req.user ? `| User: ${req.user._id}` : "",
    ].join(" ")

    if (res.statusCode >= 500) console.error(`❌ ${log}`)
    else if (res.statusCode >= 400) console.warn(`⚠️  ${log}`)
    else console.log(`✅ ${log}`)
  })

  next()
}

module.exports = logger