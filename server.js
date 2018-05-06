
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var register = require('./models/authschema.js');
var jwt = require('jsonwebtoken');
var request = require('request');
var app = express();
var router = express.Router();

var config = require('./config.js');
app.set('superSecret',config.secretKey);

mongoose.connect('mongodb://chirag123:chirag2838#@ds123556.mlab.com:23556/bloodgroup');

var port = Number(process.env.PORT || 8080);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('./public'));

router.post('/registration',function(req,res){
    //console.log(req.body);
	if(req.body.pass1 === req.body.pass2)
	{
        register.findOne({$or:[{'email':req.body.email},{'phone':req.body.phone}]},function(err,user){
            if(!user)
                {
                    var user = new register({
			            'firstname': req.body.firstname,
	                    'lastname': req.body.lastname,
                        'email': req.body.email,
            	        'bloodgroup': req.body.bloodgroup,
	                    'phone': req.body.phone,
	                    'address': req.body.address,
	                    'state': req.body.state,
	                    'password':req.body.pass1 
		            })
		            user.save(function(err,data){
                        console.log(data);
			             if(err)
				            console.log(err);
			             else
                             {
                                 var token = jwt.sign(data,app.get('superSecret'),{
                                 expiresIn : 86400
                                });
                                  register.findOneAndUpdate({'email':data.email},{$set:{'token':token}},{new:true},function(err,doc){
                                     
                            if(err)
                                console.log('something went wrong');
                             })
                                 res.json({success : true, message : 'Registration successfull', token : token , name:data.firstname});
                             }
				            
		            })
                }
            else
                {
                    res.json({ success: false, message: 'Registration failed. Account already exists.' });
                }
        })
		
	}
	else
	{
		res.json({success : false, message : 'Password did not match. Try again'});
	}
})

router.post('/login',function(req,res){
    register.findOne({'email':req.body.email},function(err,user){
        if(err)
            console.log(err);
        if(!user)
            res.json({success: false, message: 'Authentication failed. User not found.'});
        else
            {
                if(user.password != req.body.password)
                    res.json({success: false, message: 'Authentication failed. Wrong password.'});
                else
                    {
                        var token = jwt.sign(user,app.get('superSecret'),{
                            expiresIn : 86400
                        });
                        
                        register.findOneAndUpdate({'email':req.body.email},{$set:{'token':token}},{new:true},function(err,doc){
                            if(err)
                                console.log('something went wrong');
                        })
                        
                        res.json({
                            success : true,
                            message : 'enjoy your token',
                            token : token,
                            name : user.firstname
                        })
                    }
            }
    })
})

app.post('/hospital',function(req,res){
//    var request = require("request");

var options = { method: 'GET',
  url: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
  qs: 
   { key: 'AIzaSyBWcUqKSG6hdO2Tx8tYwBAEB3z4RZmK11A',
     location: req.body.lat+','+req.body.lng,
     radius: '1000',
     type: 'hospital' },
   };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  res.send(body);
});
})

router.use(function(req,res,next){
    var token = req.param('token');
//console.log(token);
    
    if(token)
        {
            jwt.verify(token,app.get('superSecret'),function(err1,decoded){
                
               
                register.findOne({'email':decoded._doc.email},function(err2,user){
                    
                    if((err1||err2)||(user.token != token))
                        {
                            res.json({success: false , message : 'Authentication failed'});
                        }
                    else
                    {
//                        console.log(decoded);
                        req.decoded = decoded;
                        next();
                    }
                })
                
            })
        }
    else
        {
           return res.status(503).send({
               success: false, 
			message: 'No token provided.'
           })
        }
})

router.get('/logout',function(req,res){
    register.findOneAndUpdate({'email':req.decoded._doc.email},{$unset:{'token':1}},{new:true},function(err,doc){
        if(err)
            console.log(err);
    })
    res.json({success : true , message : 'Successfully Logged Out'})
})

router.post('/find',function(req,res){    
    register.find({'bloodgroup':req.body.bloodgroup , 'state':req.body.state},function(err,data){
        console.log(data);
        res.json({info: data, name:req.decoded._doc.firstname});
    })
})

app.use('/api',router);

app.listen(port,function(err){
    err||console.log('server running at 8080')
})
