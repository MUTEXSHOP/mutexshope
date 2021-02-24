import { useState, useRef } from 'react'
import styles from '../styles/Popup.module.css'

export default function PopUp ({ info, update }) {
  const box = useRef(null);
  const email = useRef(null);
  const coupon = useRef(null);
  const type = useRef(null);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState(1);
  const [txinfo, setTX] = useState({});


  let interval;
  
  const statuses = {
    "0":	"Not paid",
    "51":	"Chargeback/Reversed",
    "52":	"High risk",
    "53":	"Partially paid",
    "54":	"Awaiting Cryptocurrency confirmations",
    "55":	"Pending - PayPal",
    "56":	"Refunded",
    "100":	"Successful and completed"
  }

  const create_payment = async () => {
    try {
      const res = await (await fetch('/api/pay', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          product_id: info.product.id,
          type: type.current.value,
          coupon_id: coupon.current.value,
          email: email.current.value,
          quantity: amount
        })
      })).json()


      if(res.message || res.error) return setError(res.message || res.error);
      update({transaction: res, interval: do_interval(res.id)})

    } catch(e) { console.log(e) }
  }

  const do_interval = (id) => {
    clearInterval(interval);
    return setInterval(async () => {
      const _res = await (await fetch('/api/check?id='+id)).json();
      setTX(_res);
    }, 10000);
    
  }

  const shouldclose = (ev, force) => {
    if(ev.target === box.current || force) {
      clearInterval(info.interval);
      update({visible: 0});
    }
  }

  const use_proper_component = () => {
    switch(info.transaction.gateway) {
      case 'CashApp': 
        return (
          <div className={styles.inner}>
            <div className={styles.customer_info}>
              <img className={styles.cashapp_qr_code} src={info.transaction.cashapp_qr_code} />
              <ol>
                <li>
                  <span>Initiate CashApp payment to $olave1234 by manually inputting CashApp tag or scanning the CashApp Tag QR code above</span>
                </li>
                <li>
                  <span>Set payment amount exactly to {info.transaction.cashapp_value} USD</span>
                </li>
                <li>
                  <span>Set CashApp payment note:</span>
                  <input onClick={_ => {
                    _.target.select();
                    _.target.setSelectionRange(0,99999);
                    document.execCommand('copy');
                  }} value={info.transaction.id} readOnly={true} />
                </li>
              </ol>
            </div>
          </div> 
        )

      case 'PayPal':
        return (
          <div className={styles.inner}>
            <div className={styles.customer_info}>
              <button onClick={_ => open(info.transaction.url)}>Click to pay</button>
            </div>
          </div> 
        )

      case 'Bitcoin':
      case 'Litecoin':
      case 'Bitcoin Cash':
      case 'Ethereum':
        return (
          <div className={styles.inner}>
            <div className={styles.customer_info}>
              <h2>Click to copy</h2>
              <span>Send exactly</span><input onClick={_ => {
                _.target.select();
                _.target.setSelectionRange(0,99999);
                document.execCommand('copy');
              }} value={(info.transaction.crypto_value * 1E-8).toFixed(8)} readOnly={true} />
              <span>to the following address</span><input onClick={_ => {
                _.target.select();
                _.target.setSelectionRange(0,99999);
                document.execCommand('copy');
              }} value={info.transaction.crypto_address} readOnly={true} />
            </div>
          </div> 
        )
    }
  }

  if(txinfo.delivered) {
    clearInterval(info.interval);
    return (
      <div className={styles.popup} ref={box} onClick={shouldclose}>   
        <div className={styles.box}>
          <h3>Here's your order</h3>
            <div className={styles.inner}>
              <div className={styles.customer_info2}>
                <pre>{txinfo.delivered}</pre>
              </div>
            </div>
          </div>
      </div>
    )
  }

  else if(Object.keys(info.transaction).length) return (
    <div className={styles.popup} ref={box} onClick={shouldclose}>   
      <div className={styles.box}>
        <h3>Awaiting payment</h3> 
        { use_proper_component() }
        <h3>Status: {info.recheck.status 
          ? statuses[info.recheck.status]
          : statuses[info.transaction.status]}</h3>
      </div>
    </div> 
  )
  else if(Object.keys(info.product).length) return (
     <div className={styles.popup} ref={box} onClick={shouldclose}>   
      <div className={styles.box}>
        <h3>{info.product.title}</h3>
        <div className={styles.inner}>
          <div className={styles.customer_info}>
            <pre>{info.product.description}</pre>

            {error ? <h4>{error}</h4> : ''}

            <div className={styles.amount}>
              <span className={styles.ic} onClick={_ => amount > 1 && setAmount(amount-1)}>-</span>
              <span>{amount}</span>
              <span className={styles.ic} onClick={_ => amount < info.product.stock && setAmount(amount+1)}>+</span>
              <span className={styles.icprice}>${+info.product.price * amount}</span>
            </div>

            <input type="email" placeholder="Email" ref={email} />
            <input placeholder="Coupon" ref={coupon} />
            <h4>Payment method</h4>
            
            <select ref={type}>
              <option value="cashapp">CashApp</option>
              <option value="bitcoin">Bitcoin</option>
              <option value="bitcoin_cash">Bitcoin Cash</option>
              <option value="litecoin">Litecoin</option>
              <option value="ethereum">Ethereum</option>
            </select>
             
            <button onClick={create_payment}>PROCEED</button>
          </div>
        </div>
      </div>
    </div>
  )
  else if(Object.keys(info.category).length) return (
    <div className={styles.popup} ref={box} onClick={shouldclose}>   
      <div className={styles.box}>
        <h3>Pick a product</h3>
        <div className={styles.inner_prd}>
          {info.category.map((a, i) => (
            <div className={styles.product} key={i}>
              <h4>{a.title}</h4>
              <div className={styles.product_info}>
                <div className={styles.pleft}>
                  <span>${a.price}</span>
                  <span>{a.stock} in stock</span>
                </div> 
                <button onClick={_ => a.stock && update({product: a})}>BUY</button>
              </div>
            </div>
          ))}
        </div> 
      </div>
    </div>
  )
}








