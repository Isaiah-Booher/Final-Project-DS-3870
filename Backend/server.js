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
    port: 3306,
    user:'root',
    password:'Jesussaves3:16',
    database:'swollencoffee'
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
    // let strDateRecorded = req.query.daterecorded || req.body.daterecorded;
    // let strSession = uuidv4();
    
    console.log(strPassword);
    bcrypt.hash(strPassword, 10).then(hash => {
        strPassword = hash;
        pool.query('INSERT INTO tblUsers (FirstName, LastName, Email, MobileNumber) VALUES(?, ?, ?, ?)',[strEmail, strFirstName, strLastName, strPhone], function(error, results){
            if(!error){
                let strSession = uuidv4();
                let objMessage = new message("SessionID", strSession);

                res.status(201).send(JSON.stringify(objMessage));
            } else {
                let objMessage = new message("Error", error);
                res.status(400).send(JSON.stringify(objMessage));
            }       
        })
     } )
    })

app.get("/users", (req,res,next) => {
    let strEmail = req.query.email || req.body.email;
    let strPassword = req.query.password || req.body.password;
    pool.query('SELECT Email FROM tblUsers WHERE Email = ?', strEmail, function(error, results){
        if(!error){
            let strSession = uuidv4();
            let objMessage = new message("SessionID", strSession);
            res.status(200).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})

app.put("/users", (req,res,next) => {
    let strFirstName = req.query.firstname || req.body.firstname;
    let strLastName = req.query.lastname || req.body.lastname;
    let strEmail = req.query.email || req.body.email;
    let strPassword = req.query.password || req.body.password;
    let strPhone = req.query.mobilenumber || req.body.mobilenumber;
    bcrypt.hash(strPassword, 10).then(hash => {
        strPassword = hash;
        pool.query('UPDATE tblUsers SET First_Name = ?, Last_Name = ?, Email = ?, UserPassword = ?, Phone = ? WHERE Email = ?',
        [strFirstName, strLastName, strEmail, strPassword, strPhone, strEmail], function(error, results){
            if(!error){
                let objMessage = new message("Success", "User Updated");
                res.status(200).send(JSON.stringify(objMessage));
            } else {
                let objMessage = new message("Error", error);
                res.status(400).send(JSON.stringify(objMessage));
            }
        })
     } )
})

app.delete("/users", (req,res,next) => {
    let strEmail = req.query.email || req.body.email;
    pool.query('DELETE FROM tblUsers WHERE Email = ?', strEmail, function(error, results){
        if(!error){
            let objMessage = new message("Success", "User Deleted");
            res.status(200).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})


app.post("/sessions", (req,res,next) => {
    let strSessionID = uuidv4();
    pool.query('INSERT INTO tblSessions (Session_ID, Session_Start, Session_End) VALUES(?, getdate(), getdate())',
    strSessionID, function(error, results){
            if(!error){
                let objMessage = new message("Success", "New Session Created");
                res.status(201).send(JSON.stringify(objMessage));
            } else {
                let objMessage = new message("Error", error);
                res.status(400).send(JSON.stringify(objMessage));
            }
        })
        } )
        
app.get("/sessions", (req,res,next) => {
    let strSessionID = req.query.sessionid || req.body.sessionid;
    pool.query('SELECT * FROM tblSessions WHERE Session_ID = ?', strSessionID, function(error, results){
        if(!error){
            if(results.length > 0){
                let objSession = new Session(results[0].Session_ID, null, results[0].Session_Start, results[0].Session_End);
                res.status(200).send(JSON.stringify(objSession));
            } else {
                let objMessage = new message("Error", "Invalid Session ID");
                res.status(400).send(JSON.stringify(objMessage));
            }
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})

app.put("/sessions", (req,res,next) => {
    let strSessionID = req.query.sessionid || req.body.sessionid;
    pool.query('UPDATE tblSessions SET Session_End = getdate() WHERE Session_ID = ?',
    strSessionID, function(error, results){
        if(!error){
            let objMessage = new message("Success", "Session Ended");
            res.status(200).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})

app.delete("/sessions", (req,res,next) => {
    let strSessionID = req.query.sessionid || req.body.sessionid;
    pool.query('DELETE FROM tblSessions WHERE Session_ID = ?', strSessionID, function(error, results){
        if(!error){
            let objMessage = new message("Success", "Session Deleted");
            res.status(200).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})
        

app.post("/farms", (req,res,next) => {
    let strFarmName = req.query.farmname || req.body.farmname;
    let strStreetAddress1 = req.query.streetaddress1 || req.body.streetaddress1;
    let strStreetAddress2 = req.query.streetaddress2 || req.body.streetddress2;
    let strCity = req.query.city || req.body.city;
    let strState = req.query.state || req.body.state;
    let strZip = req.query.zip || req.body.zip;
    pool.query('INSERT INTO tblFarms (FarmID, FarmName, StreetAddress1,  StreetAddress2, City, State, Zip) VALUES("1", ?, ?, ?, ?, ?, ?)',
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

app.get("/farms", (req,res,next) => {
    let strFarmID = req.query.farmid || req.body.farmid;
    pool.query('SELECT * FROM tblFarms WHERE Farm_ID = ?', strFarmID, function(error, results){
        if(!error){
            if(results.length > 0){
                let objFarm = new Farm(results[0].Farm_ID, results[0].Farm_Name, results[0].Street_Address_1, results[0].Street_Address_2, results[0].City, results[0].State, results[0].Zip, results[0].Date_Recorded);
                res.status(200).send(JSON.stringify(objFarm));
            } else {
                let objMessage = new message("Error", "Invalid Farm ID");
                res.status(400).send(JSON.stringify(objMessage));
            }
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})

app.put("/farms", (req,res,next) => {
    let strFarmID = req.query.farmid || req.body.farmid;
    let strFarmName = req.query.farmname || req.body.farmname;
    let strStreetAddress1 = req.query.StreetAddress1 || req.body.StreetAddress1;
    let strStreetAddress2 = req.query.StreetAddress2 || req.body.StreetAddress2;
    let strCity = req.query.city || req.body.city;
    let strState = req.query.state || req.body.state;
    let strZip = req.query.zip || req.body.zip;
    pool.query('UPDATE tblFarms SET Farm_Name = ?, Street_Address_1 = ?, Street_Address_2 = ?, City = ?, State = ?, Zip = ? WHERE Farm_ID = ?', 
    [strFarmName, strStreetAddress1, strStreetAddress2, strCity, strState, strZip, strFarmID], function(error, results){
        if(!error){
            let objMessage = new message("Success", "Farm Updated");
            res.status(200).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    }) 
});

app.delete("/farms", (req,res,next) => {
    let strFarmID = req.query.farmid || req.body.farmid;
    pool.query('DELETE FROM tblFarms WHERE Farm_ID = ?', strFarmID, function(error, results){
        if(!error){
            let objMessage = new message("Success", "Farm Deleted");
            res.status(200).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})

app.post("/products", (req,res,next) => {
    let strProductID = req.query.productid || req.body.productid;
    let strProductFarmName = req.query.productfarmname || req.body.productfarmname;
    let strProductType = req.query.producttype || req.body.producttype;
    let strFixedCost = req.query.fixedcost || req.body.fixedcost;
    let strDatePlanted = req.query.dateplanted || req.body.dateplanted;
    let strDateHarvested = req.query.dateharvested || req.body.dateharvested;
    let strHarvestWeight = req.query.harvestweight || req.body.harvestweight;
    let strHarvestQuantity = req.query.harvestquantity || req.body.harvestquantity;

    pool.query('INSERT INTO tblProducts (Product_ID, Product_Farm_Name, Product_Type, Fixed_Cost, Date_Planted, Date_Harvested, Harvest_Weight, Harvest_Quantity, Date_Recorded) VALUES(?, ?, ?, ?, ?, ?, ?, ?, SYSDATE())',
    [strProductID, strProductFarmName, strProductType, strFixedCost, strDatePlanted, strDateHarvested, strHarvestWeight, strHarvestQuantity], function(error, results){
            if(!error){
                let objMessage = new message("Success", "New Product Created");
                res.status(201).send(JSON.stringify(objMessage));
            } else {
                let objMessage = new message("Error", error);
                res.status(400).send(JSON.stringify(objMessage));
            }
        })

})

app.get("/products", (req,res,next) => {
    // let strProductID = req.query.productid || req.body.productid;
    pool.query('SELECT * FROM tblProducts' , function(error, results){
        if(!error){
            if(results.length > 0){
                let objProduct = new Product(results[0].Product_ID, results[0].Product_Farm_Name, results[0].Product_Type, results[0].Fixed_Cost, results[0].Date_Planted, results[0].Date_Harvested, results[0].Harvest_Weight, results[0].Harvest_Quantity, results[0].Date_Recorded);
                res.status(200).send(JSON.stringify(objProduct));
            } else {
                let objMessage = new message("Error", "Invalid Product ID");
                res.status(400).send(JSON.stringify(objMessage));
            }
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})

app.put("/products", (req,res,next) => {
    let strProductID = req.query.productid || req.body.productid;
    let strProductFarmName = req.query.productfarmname || req.body.productfarmname;
    let strProductType = req.query.producttype || req.body.producttype;
    let strFixedCost = req.query.fixedcost || req.body.fixedcost;
    let strDatePlanted = req.query.dateplanted || req.body.dateplanted;
    let strDateHarvested = req.query.dateharvested || req.body.dateharvested;
    let strHarvestWeight = req.query.harvestweight || req.body.harvestweight;
    let strHarvestQuantity = req.query.harvestquantity || req.body.harvestquantity;

    pool.query('UPDATE tblProducts SET Product_Farm_Name = ?, Product_Type = ?, Fixed_Cost = ?, Date_Planted = ?, Date_Harvested = ?, Harvest_Weight = ?, Harvest_Quantity = ? WHERE Product_ID = ?',
    [strProductFarmName, strProductType, strFixedCost, strDatePlanted, strDateHarvested, strHarvestWeight, strHarvestQuantity, strProductID], function(error, results){
        if(!error){
            let objMessage = new message("Success", "Product Updated");
            res.status(200).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})

app.delete("/products", (req,res,next) => {
    let strProductID = req.query.productid || req.body.productid;
    pool.query('DELETE FROM tblProducts WHERE Product_ID = ?', strProductID, function(error, results){
        if(!error){
            let objMessage = new message("Success", "Product Deleted");
            res.status(200).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})
            
app.post('/employees', (req,res,next) => {
    let strEmployeeID = req.query.employeeid || req.body.employeeid;
    let strFarmName = req.query.farmname || req.body.farmname;
    let strEmployeeFirstName = req.query.employeefirstname || req.body.employeefirstname;
    let strEmployeeLastName = req.query.employeelastname || req.body.employeelastname;
    let strPayRate = req.query.payrate || req.body.payrate;
    let strPosition = req.query.position || req.body.position;

    pool.query('INSERT INTO tblEmployees (EmpID, FarmName, FirstName, LastName, PayRateHr, Position) VALUES(?, ?, ?, ?, ?, ?) order by FirstName DESC',
    [strEmployeeID, strFarmName, strEmployeeFirstName, strEmployeeLastName, strPayRate, strPosition], function(error, results){
        if(!error){
            let objMessage = new message("Success", "New Employee Created");
            res.status(201).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })

})

app.get("/employees", (req,res,next) => {
    pool.query('SELECT * FROM tblEmployees order by FirstName asc', function(error, results){
        if(!error){
            if(results.length > 0){
                // let objEmployee = new Employee(results[0].Employee_ID, results[0].Farm_Name, results[0].Employee_First_Name, results[0].Employee_Last_Name, results[0].Pay_Rate, results[0].Position);
                res.status(200).send(JSON.stringify(results));
            } else {
                let objMessage = new message("Error", "Invalid Employee ID");
                res.status(400).send(JSON.stringify(objMessage));
            }
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})

app.put('/employees', (req,res,next) => {
    let strEmployeeID = req.query.employeeid || req.body.employeeid;
    let strFarmName = req.query.farmname || req.body.farmname;
    let strEmployeeFirstName = req.query.employeefirstname || req.body.employeefirstname;
    let strEmployeeLastName = req.query.employeelastname || req.body.employeelastname;
    let strPayRate = req.query.payrate || req.body.payrate;
    let strPosition = req.query.position || req.body.position;

    pool.query('UPDATE tblEmployees SET Farm_Name = ?, Employee_First_Name = ?, Employee_Last_Name = ?, Pay_Rate = ?, Position = ? WHERE Employee_ID = ?',
    [strFarmName, strEmployeeFirstName, strEmployeeLastName, strPayRate, strPosition, strEmployeeID], function(error, results){
        if(!error){
            let objMessage = new message("Success", "Employee Updated");
            res.status(200).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
    
})

app.delete("/employees", (req,res,next) => {
    let strEmployeeID = req.query.employeeid || req.body.employeeid;
    pool.query('DELETE FROM tblEmployees WHERE Employee_ID = ?', strEmployeeID, function(error, results){
        if(!error){
            let objMessage = new message("Success", "Employee Deleted");
            res.status(200).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})

app.post("/inventory", (req,res,next) => {
    let strInventoryID = req.query.inventoryid || req.body.inventoryid;
    let strFarmID = req.query.farmid || req.body.farmid;
    let strItem = req.query.item || req.body.item;
    let strItemDescription = req.query.itemdescription || req.body.itemdescription;
    let strItemCost = req.query.itemcost || req.body.itemcost;
    // let strDateRecorded = req.query.daterecorded || req.body.daterecorded;
    pool.query('INSERT INTO tblInventory (Inventory_ID, Farm_ID, Item, Item_Description, Item_Cost, Date_Recorded) VALUES(?, ?, ?, ?, ?, SYSDATE())',
    [strInventoryID, strFarmID, strItem, strItemDescription, strItemCost], function(error, results){
        if(!error){
            let objMessage = new message("Success", "New Item Created");
            res.status(201).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})

app.get("/inventory", (req,res,next) => {
    // let strItemID = req.query.itemid || req.body.itemid;
    pool.query('SELECT * FROM tblInventory', function(error, results){
        if(!error){
            if(results.length > 0){
                let objInventory = new Inventory(results[0].Inventory_ID, results[0].Farm_ID, results[0].Item, results[0].Item_Description, results[0].Item_Cost, results[0].Date_Recorded);
                res.status(200).send(JSON.stringify(objInventory));
            } else {
                let objMessage = new message("Error", "Invalid Item ID");
                res.status(400).send(JSON.stringify(objMessage));
            }
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})

app.put('/inventory', (req,res,next) => {
    let strInventoryID = req.query.inventoryid || req.body.inventoryid;
    let strFarmID = req.query.farmid || req.body.farmid;
    let strItem = req.query.item || req.body.item;
    let strItemDescription = req.query.itemdescription || req.body.itemdescription;
    let strItemCost = req.query.itemcost || req.body.itemcost;
    pool.query('UPDATE tblInventory SET Farm_ID = ?, Item = ?, Item_Description = ?, Item_Cost = ? WHERE Inventory_ID = ?',
    [strFarmID, strItem, strItemDescription, strItemCost, strInventoryID], function(error, results){
        if(!error){
            let objMessage = new message("Success", "Item Updated");
            res.status(200).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})

app.delete("/inventory", (req,res,next) => {
    let strInventoryID = req.query.inventoryid || req.body.inventoryid;
    pool.query('DELETE FROM tblInventory WHERE Inventory_ID = ?', strInventoryID, function(error, results){
        if(!error){
            let objMessage = new message("Success", "Item Deleted");
            res.status(200).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})

app.post("/tasks", (req,res,next) => {
    let strTaskID = req.query.taskid || req.body.taskid;
    let strTitle = req.query.title || req.body.title;
    let strProductType = req.query.producttype || req.body.producttype;
    let strDescription = req.query.description || req.body.description;
    let strDuration = req.query.duration || req.body.duration;
    let strFirstName = req.query.firstname || req.body.firstname;

    pool.query('INSERT INTO tblTasks (Task_ID, Title, Product_Type, Description, Duration, First_Name, Input_Date) VALUES(?, ?, ?, ?, ?, ?, SYSDATE())',
    [strTaskID, strTitle, strProductType, strDescription, strDuration, strFirstName], function(error, results){
        if(!error){
            let objMessage = new message("Success", "New Task Created");
            res.status(201).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})

app.get("/tasks", (req,res,next) => {
    pool.query('SELECT * FROM tblTasks', function(error, results){
        if(!error){
            if(results.length > 0){
                let objTasks = new Tasks(results[0].Task_ID, results[0].Title, results[0].Product_Type, results[0].Description, results[0].Duration, results[0].First_Name, results[0].Input_Date);
                res.status(200).send(JSON.stringify(objTasks));
            } else {
                let objMessage = new message("Error", "Invalid Task ID");
                res.status(400).send(JSON.stringify(objMessage));
            }
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
        
    })
})

app.put('/tasks', (req,res,next) => {
    app.post("/employees", (req,res,next) => {
        let strTaskID = req.query.taskid || req.body.taskid;
        let strTitle = req.query.title || req.body.title;
        let strProductType = req.query.producttype || req.body.producttype;
        let strDescription = req.query.description || req.body.description;
        let strDuration = req.query.duration || req.body.duration;
        let strFirstName = req.query.firstname || req.body.firstname;

        pool.query('UPDATE tblTasks SET Title = ?, Product_Type = ?, Description = ?, Duration = ?, First_Name = ? WHERE Task_ID = ?',
        [strTitle, strProductType, strDescription, strDuration, strFirstName, strTaskID], function(error, results){
            if(!error){
                let objMessage = new message("Success", "Task Updated");
                res.status(200).send(JSON.stringify(objMessage));
            } else {
                let objMessage = new message("Error", error);
                res.status(400).send(JSON.stringify(objMessage));
            }
        })
    })
})

app.delete("/tasks", (req,res,next) => {
    let strTaskID = req.query.taskid || req.body.taskid;
    pool.query('DELETE FROM tblTasks WHERE Task_ID = ?', strTaskID, function(error, results){
        if(!error){
            let objMessage = new message("Success", "Task Deleted");
            res.status(200).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})



    
        
