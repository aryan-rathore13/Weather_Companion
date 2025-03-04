const express=require('express');
const app=express();
const axios=require('axios');
const NodeCache=require('node-cache');
const PORT=3000;
const ratelimit=require('express-rate-limit');
const API_KEY='bd8d35d03c0c450f9c464119250403';
const BASE_URL='http://api.weatherapi.com/v1';
const cache=new NodeCache({stdTTL:600});
const limiter=ratelimit({
    windowMs:60*60*1000,
    max:100,
    message:'Too many requests please try again later'

})
app.use(express.static('public'));
app.use(limiter);
function ValidateCity(req,res,next){
    const { city } = req.params;
  if (!city || city.trim().length === 0 || !/^[a-zA-Z\s]+$/.test(city)) {
    return res.status(400).json({ error: 'Invalid city name. Use letters and spaces only.' });
  }
  next();
}
app.get('/weather/:city',ValidateCity,async (req,res)=>{
    const city=req.params.city;
    const cachekey=`weather_${city}`;
    const cachedata=cache.get(cachekey);
    if(cachedata){
        res.json(cachedata);
    }
    try {
        const response=await axios.get(`${BASE_URL}/current.json?key=${API_KEY}&q=${city}`);
        cache.set(cachekey,response.data);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({error:'Internal server error'});
    }

})
app.get('/forecast/:city',ValidateCity,async (req,res)=>{
    const city=req.params.city;
    const cachekey=`forecast_${city}`;
    const cachedata=cache.get(cachekey);
    if(cachedata){
        res.json(cachedata);
    }
    try {
        const response=await axios.get(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}`);
        cache.set(cachekey,response.data);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({error:"Internal server error"});
    }
})

app.listen(process.env.PORT||3000,async ()=>{
    console.log("Weather app is running on : ",process.env.PORT||3000);
});
