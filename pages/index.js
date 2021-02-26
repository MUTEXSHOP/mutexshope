import Head from 'next/head'
import PopUp from '../components/popup';
import { useState, useRef, useEffect } from 'react';
import AOS from 'aos'

import styles from '../styles/Home.module.css'
import "aos/dist/aos.css"

export default function Home({ data }) {

  const [query, setQuery] = useState("");
  const [aha, setAha] = useState(1);
  const [open, setOpen] = useState(0);

  let refs = {};

  for(const key in data) {
    refs[key] = useRef();
  }

  const [popup, setPopup] = useState({
    visible: 0,
    interval: 0,
    transaction: {},
    category: [],
    product: {},
    recheck: {},
 });

  const setLazyPopup = ({visible, transaction, category, product, interval, recheck}) => {
    setPopup({
      visible: isNaN(visible) ? popup.visible : visible,
      transaction: transaction || popup.transaction,
      category: category || popup.category,
      product: product || popup.product,
      recheck: recheck || popup.recheck,
      interval: interval || popup.interval
    });
  }
  
  /*if(typeof window !== 'undefined') {
    if(data) window.localStorage.setItem('data', JSON.stringify(data))
    else data = JSON.parse(window.localStorage.getItem('data') || "{}")
  }*/

  const trans = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAACvCAQAAACWCnycAAAAEElEQVR42mNkYGAcRaMIjAC2hQCwhGuphQAAAABJRU5ErkJggg==';

  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, [])

  return (
    <div className={styles.container}>
      <head>
        <title>CornerStore | Find all you need</title>
        <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
    <link rel="stylesheet" href="/scroll.css" />
    </head>
      <menu onClick={_ => setOpen(!open)}>{open ? 'CLOSE' : 'MENU'}</menu>
<header>
        <img className={styles.title} src="https://i.imgur.com/Ya8tiTA.png"></img>
<div className={styles.navg}>
          <a href="https://t.me/CornerStoreSupport" target="_blank"><i class="fa fa-question-circle"></i> Support</a>   
          <a href="https://t.me/cornerstoreshop" target="_blank"><i class="fa fa-plus-circle"></i> Updates</a>
        </div>
</header>

      <nav style={open ? {height: '100vh', position: 'fixed'} : {}}>
        {Object.keys(refs).map((_, i) => {
          return <h3 key={i} onClick={e => {scrollTo({top: refs[_].current.offsetTop, behavior: 'smooth'}); open && setOpen(0)}}>{_}</h3>
        })}
      </nav>

      <div className={styles.search}>
        <div className={styles.innersearch}>
          <input onChange={_ => setQuery(_.target.value.toLowerCase())} placeholder="SEARCH"></input>
          <i className={styles.sicon} />
        </div>
      </div>


      <main className={styles.main}>
        <div>
          {data ? Object.keys(data).map((_, i) => {
            const prod = Object.keys(data[_]).sort((a,b)=>a>b?1:-1)
              .filter(
                  (a) => query
                  ? a.toLowerCase().includes(query)
                  : 1
              )
            return <div key={i} className={styles.catmap}>
             <div className={styles.ctitle}>  <h1 ref={refs[_]}>{prod.length ? _ : ''}</h1></div>
              <div className={styles.categories}>
                {prod.map((a, i) => {
                  var stock = 0;
                  data[_][a].img = null;
                 
                 
                  for(let e = 0; e < data[_][a].length; e++) {
                    stock += data[_][a][e]['stock'];
                    if(data[_][a][e]['img'] !== 'none' && !data[_][a]['img']) {
                      data[_][a]['img'] = data[_][a][e]['img'];
                    }
                  }

                  return (
                    <div key={a} data-aos="fade-up" className={styles.category} onClick={
                      () => setPopup({
                        category: data[_][a],
                        visible: 1,
                        transaction: popup.transaction,
                        product: {},
                        recheck: popup.recheck
                      })
                    }>
                  
                    <div className={styles.img} style={{'backgroundImage': `url(${data[_][a]['img']})`}} />
                      <h4>{a}</h4>
                       <p>{stock} in stock</p>
                      <button className={styles.slide}>PURCHASE</button>
                    </div>
                  )
                })}
              </div>
            </div>  
          }): ''}
        </div>


        {popup.visible ? <PopUp update={setLazyPopup} info={popup} /> : ''}
      </main>
    </div>
  )
}

Home.getInitialProps = async ctx => {
  if (ctx.req) console.log(ctx.req.headers['cf-connecting-ip']) // log ips to function logs

  try {
    return await (await fetch('https://mutexshope.vercel.app/api/products')).json();
  } catch {
    return { error: 'Contact the shop owner as soon as possible' }
  }
}
