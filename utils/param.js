export default (list, res, opt) => {
  if(!list) return res.status(400).json({error: 'Wrong usage'});
  for(const o of opt) {
    if(!list[o] && isNaN(list[o]))
      return res.status(400).json({error: `Missing ${o}`});
  }
}
