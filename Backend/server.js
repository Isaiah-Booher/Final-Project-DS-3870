// Step One
const mysql = require('mysql');
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const pool = mysql.createPool({
    host: 'localhost',
    user:'root',
    password:'password',
    database:'swollencoffeewebsiteproject'
});
const HTTP_PORT = 8000;
// End Step One

//Step Two
var app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.text());
// End Step Two

// Step Three
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
app.listen(HTTP_PORT, () => {
    console.log("Server is listening on port " + HTTP_PORT);
});


app.post("/users", (req,res,next) => {
    let strFirstName = req.query.firstname || req.body.firstname;
    let strLastName = req.query.lastname || req.body.lastname;
    let strEmail = req.query.email || req.body.email;
    let strPassword = req.query.password || req.body.password;
    let strPhone = req.query.mobilenumber || req.body.mobilenumber;
    bcrypt.hash(strPassword, 10).then(hash => {
        strPassword = hash;
        pool.query('INSERT INTO tblUsers (First_Name, Last_Name, Email, UserPassword, Phone, Date_Recorded) VALUES(?, ?, ?, ?, ?,SYSDATE())',[strEmail, strFirstName, strLastName, strPassword, strPhone], function(error, results){
            if(!error){
                res.status(200).send(JSON.stringify({Outcome:'New User Created'}));
            } else {
                res.status(400).send(JSON.stringify({Error:error}));
            }
        })
    })
})