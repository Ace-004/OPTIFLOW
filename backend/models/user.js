const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
// const {z}=require('zod');
const userSchema = mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  email: {
    type: String,
    required:true,
    unique:true,
    trim:true,
    lowercase:true
  },
  password: String,
  provider:{
    type:String,
    default: 'local'
  },
  providerId:{
    type:String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
// userSchema.pre('save',async function(next){
//   if(this.isModified('password')){
//     this.password=await bcrypt.hash(this.password,12);
//   }
//   next();
// })

const User= mongoose.model('User',userSchema);

module.exports=User;
