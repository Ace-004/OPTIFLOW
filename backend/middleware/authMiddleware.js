const jwt=require('jsonwebtoken');

const protect=async(req,res,next)=>{
  const reqHeader=req.headers.authorization;
  if(reqHeader && reqHeader.startsWith('Bearer')){
    const token=reqHeader.split(' ')[1];
    try {
      const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);
      req.user=decoded.id;
      next();
    } catch (error) {
      return res.status(401).json({message:'unauthorized access'});
    }
  }else{
    console.log(reqHeader);
    
    return res.status(401).json({message:'no token'});
  }
};

module.exports=protect;

