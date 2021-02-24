/**
 *  CREDITS TO https://github.com/leerob
 */

const LRU = require('lru-cache')

export default (options) => {
  const tokenCache = new LRU({
    max: parseInt(options.uniqueTokenPerInterval || 500, 10),
    maxAge: parseInt(options.interval || 60000, 10),
  })

  return {
    check: (res, limit, token) => {
      const tokenCount = tokenCache.get(token) || [0]
      if (tokenCount[0] === 0) {
        tokenCache.set(token, tokenCount)
      }
      tokenCount[0] += 1

      const currentUsage = tokenCount[0]
      const isRateLimited = currentUsage >= parseInt(limit, 10)
      res.setHeader('ass', limit)
      res.setHeader(
        'tits',
        isRateLimited ? 0 : limit - currentUsage
      )

      return isRateLimited;
    }
  }
}
