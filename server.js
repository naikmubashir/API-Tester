require('dotenv').config();
const express= require('express');
const path= require('path')
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const app= express();
app.use(cors());
const PORT= process.env.PORT || 4000;

const connectDb = require('./config/connectDb');
const requests=require('./routes/request.route')
const fetch= require('./routes/fetch.route')
const yamlRules= require('./routes/yamlRules.route')
const processedRequests= require('./routes/processedRequest.route');
const scan=require('./routes/scan.route');
const rules=require('./routes/rules.route')
// const authRoutes=require('./routes/auth.route')
app.use(passport.initialize()); 
// Health Check endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Check MongoDB connection
        const dbState = mongoose.connection.readyState;
        const dbStatus = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        res.json({
            status: 'healthy',
            timestamp: new Date(),
            uptime: process.uptime(),
            database: {
                state: dbStatus[dbState],
                healthy: dbState === 1
            },
            memory: {
                heapUsed: process.memoryUsage().heapUsed / 1024 / 1024,
                heapTotal: process.memoryUsage().heapTotal / 1024 / 1024
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

connectDb();


app.use(express.json());
app.use('/api/requests',requests)
app.use('/api/fetch',fetch)
app.use('/api/yaml-rules', yamlRules);
app.use('/api/processed-requests',processedRequests);
app.use('/api/scans', scan);
app.use('/api/rules', rules);
// app.use('/api/auth', authRoutes);


// Serve static files from the React frontend app
if (process.env.NODE_ENV === 'production') {
    // Serve frontend static files
    const buildPath = path.join(__dirname, 'frontend', 'build');
    app.use(express.static(buildPath));
    
    app.use( (req, res) => {// app.get('*',(req, res)=>{} doesn't work
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
    });
});

app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: `Route ${req.originalUrl} not found` 
    });
});
app.listen(PORT,()=>console.log('App running on Port:',PORT))