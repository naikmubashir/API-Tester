const express= require('express');
const app= express();
const PORT= process.env.PORT || 4000;

const connectDb = require('./config/connectDb');
const requests=require('./routes/request.route')
const fetch= require('./routes/fetch.route')
const yamlRules= require('./routes/yamlRules.route')
const ruleResults= require('./routes/yamlRules.route')
require('dotenv').config();

connectDb();


app.use(express.json());
app.use('/api/requests',requests)
app.use('/api/fetch',fetch)
app.use('/api/yaml-rules', yamlRules);
app.use('/api/rule-results', ruleResults);
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
app.listen(PORT,()=>console.log('App running on Port:',PORT))