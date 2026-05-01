const jwt=require('jsonwebtoken');
const { success } = require('zod');

const protect=async(req,res,next)=>{
  const token = req.cookies.token;
  if(!token)return res.status(401).json({success:false,message:"not authorized"});
  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
    req.user=decoded.id;
    next();
  } catch (error) {
    console.error(error);
    res.status(403).json({success:false,message:"forbidden"
    });
  }
};

module.exports=protect;

