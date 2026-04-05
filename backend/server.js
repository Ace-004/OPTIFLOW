const express = require('express');
const connectDB=require('./config/db');
const dotenv = require('dotenv');
dotenv.config();
const cors=require('cors');
const authRoutes=require('./routes/auth');
const taskRoutes=require('./routes/task');
const protect=require('./middleware/authMiddleware')

const app= express();
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Hello World');
})
app.use('/api/auth',authRoutes)
app.use('/api',protect, taskRoutes);

app.get('/me',protect,(req,res,next)=>{
  res.json({userId:req.user})
})

connectDB()
.then(()=>{
  console.log('Connected to MongoDB');
  app.listen(5000,()=>{
  console.log(`http://localhost:5000`);
}) 
}).catch((err)=>{
  console.error('Failed to connect to MongoDB', err);
});

