import Selly from '../../utils/selly'
import rateLimit from '../../utils/ratelimit'
import param from '../../utils/param'

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500
})

export default async (req, res) => {
  if(await limiter.check(res, 10, 'CACHE_TOKEN'))
    return res.status(429).json({error: 'Chill out bitch boy.'})

  param(req.query, res, ['id']);

  try {
    const order = await Selly.getOrder(req.query.id);
    res.json({status: order.status, delivered: order.delivered});
  } catch(e) {
    res.status(500).json({error: 'Unknown server error. Please contact the server owner.'})
  }
}
