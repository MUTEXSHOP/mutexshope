import rateLimit from '../../utils/ratelimit'
import fetch from 'node-fetch'
import Selly from '../../utils/selly'

let r = null;


const cat = {
    "FOOD ACCOUNTS": [
        'BWW Blazin\' Rewards',
        'BurgerFi Gift Cards',
        'CFA Rewards',
        'InsomniaCookies Rewards',
        'Jersey Mike\'s Free Giant Size Sub',
        'Panera Bread Accounts','Points Firehouse',
        'Red Robin',
        'Subways Accounts',
          ],

    "FOOD GIFTCARDS": [
'Abuelos Gift Cards',
'Arbys Gift Cards',
'Back Yard Burgers Gift Cards',
'Blaze Pizza Gift Cards',
'Bob Evans Gift Cards',
'Boston Market Gift Cards',
'Brixx Wood Fired Pizza Gift Card',
'Broken Yolk Cafe GC',
'Captain D\'s Gift Cards',
'Chevy\'s Gift Cards',
'City BBQ Gift Cards',
'Coffee & Bagels Giftcards',
'Coffee Beanery',
'Country Kitchen Gift Cards',
'Cracker Barrel Gift Card',
'Craftworks Gift Cards ',
'Crave American Kitchen Gift Cards',
'Cream Nation Gift Card',
'Dickeys BBQ Gift Card',
'Donatos Gift Cards',
'Dunkin\' Donuts Gift Cards',
'Embers Restaurant & Trio Bistro GCS',
'First Watch Cafe Gift Card ',
'Forever Yogurt GC',
'Frisch\'s Big Boy Gift Cards',
'Fuddruckers Gift Card',
'Gilmore Collection Gift Card',
'Golden Corral Gift Cards',
'Graeters Gift Cards',
'Hello Fresh OFF',
'HelloFresh OFF discount code',
'Hooter\'s Gift Card',
'Jamba Juice Gift Cards',
'Jamba, Auntie Annes, and more',
'Jason\'s Deli Gift Card',
'Jimmy John\'s',
'Johnny Rockets Gift Cards',
'Jollibee Gift Cards',
'La Rosa Pizzeria Gift Cards',
'Lazy Dog Restaurant Gift Cards',
'Macaroni Grill Gift Cards',
'Main Event Gift Card',
'McAlister\'s Deli Gift Cards',
'Melting Pot Gift Cards',
'Mission BBQ Gift Cards',
'Moe\'s Southwest Grill Gift Cards',
'Norms Gift Cards',
'Nothing Bundt Cakes GC',
'Old Country Buffet Gift Cards',
'Pei Wei Gift Cards',
'Penn Station Gift Cards',
'Piada Italian Gift Cards',
'Pinkberry Gift Card',
'Pizza Hut Code',
'Potbelly Gift Cards',
'Pressed Juicery GC Accounts',
'Quiznos Gift Card',
'Robeks Gift Cards',
'Rocky Mountain Chocolate Gift Card',
'Roundtable Pizza Gift Cards',
'Runza Gift Card',
'Salsaritas Gift Cards',
'Shane\'s Rib Shack Gift Card',
'Shoney\'s Gift Cards',
'Souplantation & ST Gift Cards',
'Starbucks Gift Card',
'Tacobell Gift Card',
'Tcby Yogurt Gift Cards',
'TGI Friday\'s Points Account',
'The Counter',
'Tijuana Flats Gift Card',
'Tom Chee Gift Cards',
'Uncle Julio\'s Gift Cards',
'Village Inn Gift Cards',
'Zoe\'s Kitchen Gift Cards',
  ],
 "SHOPPING ACCOUNTS": [
    'Abercrombie Rewards Cash',
    'Adidas OFF Code',
    'Advance Auto',
    'AMC Stubs',
    'AMC Theaters',
    'Amtrak Rewards',
    'AutoZone Rewards',
    'Bath & Body Works Rewards Account',
    'CartersOshKosh Reward',
    'GAP Rewards','Justice Rewards',
    'KmartSears Rewards',
    'Office Depot',
    'Sally Beauty Supply Rewards Free Item',
    'The Body Shop Rewards',
    'The Childrens',
    'Ulta Rewards',
 ],
 "SHOPPING GIFTCARDS": [
    'Art of Shaving Gift Cards',
    'Cobb CinéBistro',
    'Dick\'s Sporting Goods Reward',
    'Nyx Beauty Gift Card',
    'Roadrunner Sports Gift Cards',
    'Shoe Carnival Gift Cards',
    'Shoe Show',
    'Top Golf',
    'UNTUCKit Gift Card',
    'Vera Bradley Gift Cards',
 ],

  "STREAMING / ENTERTAINMENT": [
'AT&T TV NOW Go Big & HBO',
'Cobb / CinéBistro Theaters',
'DirectTv',
'Dish America\'s',
'Dish Flex',
'Dish Welcome',
'iPic Theaters Gift Cards',
'NBA League Pass',
'NBA TV',
'NFL Sunday Ticket MAX',
'Pandora',
  ],

  'OTHERS': [] // leave empty
}

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 300
})

const getRessy = async () => {
  if(r) return r;
  const res = (await (await fetch('http://45.90.109.181/products.json')).json());
  let categories = {};

  for(const key in cat) {
    categories[key] = {};
  }

  for(const product of res) {
    let added = 0;
    let realname = product.title.replace(/(\d+[^a-z0-9](\s)?|\/|\$|^\s|:|\+|\'|’|(^\$\d\.\d\s))/gm, '')
      .replace(/\s{1,}/gm, ' ')
      .split(/\s(-|\d|\[|\$|\()/g)[0]
      .split(' ')

    realname = realname.slice(0, 2
      + (['&', 'of'].includes(realname[1]))
      - (realname[0] === 'Dish')
    ).join(' ');



    for(const key in cat) {
      const c = cat[key].find(_ => _.replace('\'', '').toLowerCase().includes(realname.toLowerCase()))
      if(c) {
        if(!categories[key][realname]) categories[key][realname] = [];
        categories[key][realname].push(product);
        added = 1;
        break;
      }
    }

    if(!added) {
      if(!categories['OTHERS'][realname]) categories['OTHERS'][realname] = [];
      categories['OTHERS'][realname].push(product);
    }
  }

  r = categories;
  return r;
}

export default async (req,res) => {

  if(await limiter.check(res, 40, 'CACHE_TOKEN'))
    return res.status(429).json({error: 'Slow down cowboy.'})

  try {
    const data = await getRessy();
    res.json({data});
  }
  catch(e) {
    console.log(e);
    res.json({error: 'Contact the owner as soon as possible'});
  }
}
