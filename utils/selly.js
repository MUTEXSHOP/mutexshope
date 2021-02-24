import { apikey, apimail } from '../config.json'
import fetch from 'node-fetch'

const token = Buffer.from(`${apimail}:${apikey}`, 'utf8').toString('base64');
const sleep = (t) => new Promise((_,__) => setTimeout(_, t))


export default class Selly {
  static async getOrder(id) {
    return await (await fetch(`https://selly.io/api/v2/orders/${id}`, {
      headers: {
        'authorization': `Basic ${token}`
      }
    })).json()
  }

  static async createPayment(type, {coupon_id = null, email, product_id, quantity = 1}) {
    if(!['paypal', 'bitcoin', 'cashapp', 'bitcoin_cash', 'ethereum', 'litecoin']
      .includes(type)) return { error: 'Invalid payment type' }

    if(!product_id) return { error: 'Invalid product ID' }
    if(!email) return { error: 'Invalid email' }
    if(quantity < 1) return { error: 'Invalid quantity' }


    return await (await fetch(`https://selly.io/payments/${type}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        checkout: { coupon_id, email, product_id, quantity }
      })
    })).json();
  }
}
