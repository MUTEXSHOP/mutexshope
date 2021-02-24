import Selly from '../../utils/selly'
import rateLimit from '../../utils/ratelimit'
import param from '../../utils/param'

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 10
})


export default async (req, res) => {
  if(await limiter.check(res, 10, 'CACHE_TOKEN'))
    return res.status(429).json({error: 'Slow down cowboy.'})

  param(req.body, res, ['email', 'product_id', 'quantity', 'type']);

  try {
    const repl = await Selly.createPayment(req.body.type, {
      email: req.body.email,
      product_id: req.body.product_id,
      quantity: req.body.quantity,
      coupon_id: req.body.coupon_id || null
    })

    res.json(repl);
  } catch(e) {
    console.log(e)
    res.status(500).json({error: 'Unknown server error. Please contact the server owner.'})
  }
}
