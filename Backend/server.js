// Step One
const mysql = require('mysql');
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const { error } = require('console');
const pool = mysql.createPool({
    host: 'localhost',
    user:'root',
    password:'Mickey2023!',
    database:'swollencoffeewebsiteproject'
});
const HTTP_PORT = 8000;
// End Step One

class Session {
    constructor(strSessionID, objUser, datStartDateTime, datLastUsedDateTime){
        this.SessionID = strSessionID;
        this.User = objUser;
        this.StartDateTime = datStartDateTime;
        this.LastUsedDateTime = datLastUsedDateTime;
}}

class User {
    constructor(strEmail, strFirstName, strLastName, strMobileNumber, objFarm, blnOwner){
        this.Email = strEmail;
        this.FirstName = strFirstName;
        this.LastName = strLastName;
        this.MobileNumber = strMobileNumber;
        this.Farm = objFarm;
        this.Owner = blnOwner;
    }
}

class Farm {
    constructor(strFarmID, strFarmName, strStreetAddress1, strStreetAddress2, strCity, strState, strZip) {
        this.FarmID = strFarmID;
        this.FarmName = strFarmName;
        this.StreetAddress1 = strStreetAddress1;
        this.StreetAddress2 = strStreetAddress2;
        this.City = strCity;
        this.State = strState;
        this.Zip = strZip;
    }
}

class Product {
    constructor(strProductID, strShortName, strLongName, strDescription, strStatus, objFarm){
        this.ProductID = strProductID;
        this.ShortName = strShortName;
        this.LongName = strLongName;
        this.Description = strDescription;
        this.Status = strStatus;
        this.Farm = objFarm;
    }
}

class message {
    constructor(strType, strMessage){
        this.Type = strType;
        this.Message = strMessage;
    }
}

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
                let objMessage = new message("Success", "New User Created");
                res.status(201).send(JSON.stringify(objMessage));
            } else {
                let objMessage = new message("Error", error);
                res.status(400).send(JSON.stringify(objMessage));
            }
        })
     } )
    })

    app.post("/farm", (req,res,next) => {
        let strFarmName = req.query.farmname || req.body.farmname;
        let strStreetAddress1 = req.query.StreetAddress1 || req.body.StreetAddress1;
        let strStreetAddress2 = req.query.StreetAddress2 || req.body.StreetAddress2;
        let strCity = req.query.city || req.body.city;
        let strState = req.query.state || req.body.state;
        let strZip = req.query.zip || req.body.zip;
        pool.query('INSERT INTO tblFarms (Farm_Name, Street_Address_1,  Street_Address_2, City, State, Zip, Date_Recorded) VALUES(?, ?, ?, ?, ?, ?, SYSDATE())',
        [strFarmName, strStreetAddress1, strStreetAddress2, strCity, strState, strZip], function(error, results){
                if(!error){
                    let objMessage = new message("Success", "New Farm Created");
                    res.status(201).send(JSON.stringify(objMessage));
                } else {
                    let objMessage = new message("Error", error);
                    res.status(400).send(JSON.stringify(objMessage));
                }
            })
         } )

    app.post("/products", (req,res,next) => {
        // let strSessionID = req.query.sessionid || req.body.sessionid;
        let strProductType = req.query.producttype || req.body.producttype;
        let strfixedcost = req.query.fixedcost || req.body.fixedcost;
        let strDatePlanted = req.query.dateplanted || req.body.dateplanted;
        let strDateHarvested = req.query.dateharvested || req.body.dateharvested;
        let strHarvestWeight = req.query.harvestweight || req.body.harvestweight;
        let strQuantity = req.query.quantity || req.body.quantity;

        pool.query('INSERT INTO tblProducts (Prod_Type, Fixed_Costs, Date_Planted, Date_Harvested, Harvest_Weight_LBS, Quantity, Date) VALUES(?, ?, ?, ?, ?, ?, SYSDATE())',
        [strProductType, strfixedcost, strDatePlanted, strDateHarvested, strHarvestWeight, strQuantity], function(error, results){
                if(!error){
                    let objMessage = new message("Success", "New Product Created");
                    res.status(201).send(JSON.stringify(objMessage));
                } else {
                    let objMessage = new message("Error", error);
                    res.status(400).send(JSON.stringify(objMessage));
                }
            })
            } )
            
    app.post("/employees", (req,res,next) => {
        // let strSessionID = req.query.sessionid || req.body.sessionid;
        let strEmpFirstName = req.query.empfirstname || req.body.empfirstname;
        let strEmpLastName = req.query.emplastname || req.body.emplastname;
        let strPayRate = req.query.payrate || req.body.payrate;
        let strPosition = req.query.position || req.body.position;

        pool.query('INSERT INTO tblEmployees (EmpFirstName, EmpLastName, Pay_Rate_hr, Position, DateLogged) VALUES(?, ?, ?, ?, SYSDATE())',
        [strEmpFirstName, strEmpLastName, strPayRate, strPosition], function(error, results){
                if(!error){
                    let objMessage = new message("Success", "New Employee Created");
                    res.status(201).send(JSON.stringify(objMessage));
                } else {
                    let objMessage = new message("Error", error);
                            res.status(400).send(JSON.stringify(objMessage));
                        }
                    })
                    } )

    app.post("/inventory", (req,res,next) => {
        let strItem = req.query.item || req.body.item;
        let strItemDescription = req.query.itemdescription || req.body.itemdescription;
        let strItemCost = req.query.itemcost || req.body.itemcost;

        pool.query('INSERT INTO tblInventory (Item, Item_Description, Item_Cost, Date_Recorded) VALUES(?, ?, ?, SYSDATE())',
        [strItem, strItemDescription, strItemCost], function(error, results){
                if(!error){
                    let objMessage = new message("Success", "New Item Created");
                    res.status(201).send(JSON.stringify(objMessage));
                } else {
                    let objMessage = new message("Error", error);
                            res.status(400).send(JSON.stringify(objMessage));
                        }
                    })
                    } )

    function getSessionDetails(strSessionID, callback){
        pool.query('SELECT * FROM tblSessions WHERE SessionID = ?',[strSessionID], function(error, results){ //Modify Sql statement to pull session ID from everywhere
            if(!error){
                if(results.length > 0){ 
                    let objUser = new User(results[0].Email, results[0].FirstName, results[0].LastName, results[0].MobileNumber);
                    let objSession = new Session(results[0].SessionID, results[0].User, results[0].StartDateTime, results[0].LastUsedDateTime);
                    callback(objSession);
                } else {
                    callback(null);
                }
            } else {
                callback(null);
            }
        }
    )};


    
        
