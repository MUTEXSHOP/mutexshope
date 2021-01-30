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

  const trans = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAACvCAQAAACWCnycAAAAEElEQVR42mNkYGAcRaMIjAC2hQCwhGuphQAAAABJRU5ErkJggg==';

  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>ShopCS</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <menu onClick={_ => setOpen(!open)}>{open ? 'CLOSE' : 'MENU'}</menu>

      <header>
       <div className={styles.title}><img src="https://i.imgur.com/Ya8tiTA.png"></div>
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
        <div className={styles.categories}>
          {data ? Object.keys(data).reverse().map((_, i) => {
            const prod = Object.keys(data[_]).sort((a,b)=>a>b)
              .filter(
                  (a) => query
                  ? a.toLowerCase().includes(query)
                  : 1
              )
            return <div key={i}>
              <h1 ref={refs[_]}>{prod.length ? _ : ''}</h1>
              <div className={styles.categories}>
                {prod.map((a, i) => {
                  data[_][a].img = null;
                  for(let e = 0; e < data[_][a].length; e++) {
                    if(data[_][a][e]['img'] !== 'none') {
                      data[_][a]['img'] = data[_][a][e]['img'];
                      break;
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
  try {
    return await (await fetch('https://mutexshope.vercel.app/api/products')).json();
  } catch {
    return { error: 'Contact the shop owner as soon as possible' }
  }
}
