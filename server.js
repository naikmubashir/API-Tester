const express= require('express');
const app= express();
const PORT= process.env.PORT || 4000;

const connectDb = require('./config/connectDb');
const requests=require('./routes/request.route')
const fetch= require('./routes/fetch.route')
require('dotenv').config();

connectDb();


app.use(express.json());
app.use('/requests',requests)
app.use('/fetch',fetch)
app.listen(PORT,()=>console.log('App running on Port:',PORT))