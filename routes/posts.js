var express = require('express');
    router = express.Router(),
    multer = require('multer'),
    upload = multer({ dest: 'uploads/' }),
    fs = require('fs'),
    bcrypt = require('bcrypt-nodejs'),
    mongoose = require('mongoose'),
    mongoXlsx = require('mongo-xlsx');

var userList = require('../db/User'),
    profileList = require('../db/profile');

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
            }
        });

var loggedin = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}



router.post("/index", upload.any(), function(req, res){

    
    var inputString = req.body.inputString;
    var newData = req.body;
    
    var spawn = require("child_process").spawn;
    var process = spawn('python',["./CliNER-master/cliner predict --txt ./CliNER-master/data/examples/ex_doc.txt --out ./CliNER-master/data/predictions --model ./CliNER-master/models/silver.crf --format i2b2"]);

     process.stdout.on('data', function(data) {
        
        var output = [{answer: data.toString()}];
        res.render("query", {output: output, type : req.user.type});
    });
});

router.post("/fileSend", upload.any(), function(req, res){

    
    var filename = req.files[0].filename;
    var patient = req.body.patient;
    var doctor = req.user.username;

    profileList.find({username: patient}, function(err, patientProfile){
        var consent = patientProfile[0].consent;
        if (consent.find(function(name){return name == doctor})){
            profileList.findOneAndUpdate({username: patient},
                {
                    $push: {records : filename}
                }
                , {upsert: true}, function(err, newCreate){
                if(err){
                    console.log(err);
                }
                else{
                    res.redirect('/sendFiles');
                }
            });
        }else {
            res.redirect("/sendFiles");
        }
    });
});


router.post('/viewRecords',loggedin,  function (req, res, next) {
    var username = req.user.username;
    var patient = req.body.patient;
    
	profileList.find({username: patient}, function(err, patientProfile){
        userList.find({type: "patient"}, function(err, listOfPatients){
            res.render("viewFiles", {type: req.user.type, username: req.user.username, listOfPatients: listOfPatients, patientProfile: patientProfile});
        });
    });
});





module.exports = router;