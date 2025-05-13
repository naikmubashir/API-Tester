const express= require('express');
const path= require('path')
const app= express();
const PORT= process.env.PORT || 4000;

const connectDb = require('./config/connectDb');
const requests=require('./routes/request.route')
const fetch= require('./routes/fetch.route')
const yamlRules= require('./routes/yamlRules.route')
const processedRequests= require('./routes/processedRequest.route');
const scan=require('./routes/scan.route');
require('dotenv').config();

connectDb();


app.use(express.json());
app.use('/api/requests',requests)
app.use('/api/fetch',fetch)
app.use('/api/yaml-rules', yamlRules);
app.use('/api/processed-requests',processedRequests);
app.use('/api/scans', scan);


// Serve static files from the React frontend app
if (process.env.NODE_ENV === 'production') {
    // Serve frontend static files
    app.use(express.static(path.join(__dirname, 'frontend/build')));

    // Handle React routing, return all requests to React app
    app.get('/*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend/build', 'index.html'));
    });
}



app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: `Route ${req.originalUrl} not found` 
    });
});
app.listen(PORT,()=>console.log('App running on Port:',PORT))