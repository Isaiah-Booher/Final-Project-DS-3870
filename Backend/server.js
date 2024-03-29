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
    let strFarmID = req.query.farmid || req.body.farmid;
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
        pool.query('INSERT INTO tblUsers (FarmID, FirstName, LastName, Email, Password, MobileNumber) VALUES(?, ?, ?, ?, ?, ?)',
        [strFarmID, strFirstName, strLastName, strEmail, strPassword, strPhone], function(error, results){
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
    console.log(strPassword);
    // bcrypt.hash(strPassword, 10).then(hash => {
    //     strPassword = hash;
    pool.query("SELECT password FROM tblUsers WHERE Email = ?", strEmail, function(error, results){
        console.log(results)
        console.log(error)
        if(!error){
            if(results.length > 0 && bcrypt.compareSync(strPassword, results[0].password)) {
                let strSession = uuidv4();
                let objMessage = new message("SessionID", strSession);
                res.status(200).send(JSON.stringify(objMessage));
            }
            else {
                let objMessage = new message("Error", "Invalid Email or Password");
                res.status(400).send(JSON.stringify(objMessage));
            }
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})
// })

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
    let strFarmID = req.query.farmid || req.body.farmid;
    let strFarmName = req.query.farmname || req.body.farmname;
    let strStreetAddress1 = req.query.streetaddress1 || req.body.streetaddress1;
    let strStreetAddress2 = req.query.streetaddress2 || req.body.streetaddress2;
    let strCity = req.query.city || req.body.city;
    let strState = req.query.state || req.body.state;
    let strZip = req.query.zipcode || req.body.zipcode;
    pool.query('INSERT INTO tblFarms (FarmID, FarmName, StreetAddress1,  StreetAddress2, City, State, Zip) VALUES(?, ?, ?, ?, ?, ?, ?)',
    [strFarmID, strFarmName, strStreetAddress1, strStreetAddress2, strCity, strState, strZip], function(error, results){
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

    if(strDateHarvested.length < 1){
        strDateHarvested += 'Not Harvested/Butchered Yet';
        strHarvestWeight += '-';
        strHarvestQuantity += '0';
    }

    if(strDatePlanted.length < 1){
        strDatePlanted += 'N/A';
    }

    else {
    pool.query('INSERT INTO tblProducts (ProductID, FarmName, ProdType, FixedCost, DatePlanted, DateHarvested, HarvestWeight, Quantity) values (?,?,?,?,?,?,?,?)',
    [strProductID, strProductFarmName, strProductType, strFixedCost, strDatePlanted, strDateHarvested, strHarvestWeight, strHarvestQuantity], function(error, results){
            if(!error){
                let objMessage = new message("Success", "New Product Created");
                res.status(201).send(JSON.stringify(objMessage));
            } else {
                let objMessage = new message("Error", error);
                res.status(400).send(JSON.stringify(objMessage));
            }
        })
    }

})

app.get("/products", (req,res,next) => {
    // let strProductID = req.query.productid || req.body.productid;
    pool.query('SELECT * FROM tblProducts' , function(error, results){
        if(!error){
            if(results.length > 0){
                // let objProduct = new Product("Success","Products Found");
                res.status(200).send(JSON.stringify(results));
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

    if(strDateHarvested.length < 1){
        strDatePlanted += 'N/A';
        strDateHarvested += 'Not Harvested/Butchered Yet';
        strHarvestWeight += '-';
        strHarvestQuantity += '0';
    }

    pool.query('UPDATE tblProducts SET FarmName = ?, ProdType = ?, FixedCost = ?, DatePlanted = ?, DateHarvested = ?, HarvestWeight = ?, Quantity = ? WHERE ProductID = ?',
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
    pool.query('DELETE FROM tblProducts WHERE ProductID = ?', strProductID, function(error, results){
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

    pool.query('INSERT INTO tblEmployees (EmpID, FarmName, FirstName, LastName, PayRateHr, Position) VALUES(?, ?, ?, ?, ?, ?)',
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
    pool.query('SELECT * FROM tblEmployees', function(error, results){
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

    pool.query('UPDATE tblEmployees SET FarmName = ?, FirstName = ?, LastName = ?, PayRateHr = ?, Position = ? WHERE EmpID = ?',
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
    pool.query('DELETE FROM tblEmployees WHERE EmpID = ?', strEmployeeID, function(error, results){
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
    let strFarmName = req.query.farmid || req.body.farmid;
    let strItem = req.query.item || req.body.item;
    let strItemDescription = req.query.itemdescription || req.body.itemdescription;
    let strItemCost = req.query.itemcost || req.body.itemcost;

    // let strDateRecorded = req.query.daterecorded || req.body.daterecorded;
    pool.query("insert into tblinventory (InventoryID, FarmName, ItemName, ItemDescription, ItemCost, DateRecorded) values(?, ?, ?, ?, ?, now())",
    [strInventoryID, strFarmName, strItem, strItemDescription, strItemCost], function(error, results){
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
                // let objInventory = new Inventory(results[0].Inventory_ID, results[0].Farm_ID, results[0].Item, results[0].Item_Description, results[0].Item_Cost, results[0].Date_Recorded);
                res.status(200).send(JSON.stringify(results));
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
    pool.query('update tblinventory set FarmName = ?, ItemName = ?, ItemDescription = ?, ItemCost = ?, DateRecorded = now() where inventoryID = ?',
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
    pool.query('DELETE FROM tblInventory WHERE InventoryID = ?', strInventoryID, function(error, results){
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
    let strFirstName = req.query.firstname || req.body.firstname;
    let strLastName = req.query.lastname || req.body.lastname;

    pool.query('INSERT INTO tblTasks (TaskID, Title, ProdType, Description, FirstName, LastName) VALUES(?, ?, ?, ?, ?, ?)',
    [strTaskID, strTitle, strProductType, strDescription, strFirstName, strLastName], function(error, results){
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
            if(results){
                // let objTasks = new Tasks(results[0].Task_ID, results[0].Title, results[0].Product_Type, results[0].Description, results[0].Duration, results[0].First_Name, results[0].Input_Date);
                res.status(200).send(JSON.stringify(results));
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
        let strTaskID = req.query.taskid || req.body.taskid;
        let strTitle = req.query.title || req.body.title;
        let strProductType = req.query.producttype || req.body.producttype;
        let strDescription = req.query.description || req.body.description;
        let strFirstName = req.query.firstname || req.body.firstname;
        let strLastName = req.query.lastname || req.body.lastname;

        pool.query('UPDATE tblTasks SET Title = ?, ProdType = ?, Description = ?, FirstName = ?, LastName = ? WHERE TaskID = ?',
        [strTitle, strProductType, strDescription, strFirstName, strLastName, strTaskID], function(error, results){
            if(!error){
                let objMessage = new message("Success", "Task Updated");
                res.status(200).send(JSON.stringify(objMessage));
            } else {
                let objMessage = new message("Error", error);
                res.status(400).send(JSON.stringify(objMessage));
            }
        })
    })

app.put('/begintask', (req,res,next) => {
    let strTaskID = req.query.taskid || req.body.taskid;
    pool.query('UPDATE tblTasks SET StartTime = now() WHERE TaskID = ?',
    strTaskID, function(error, results){
        if(!error){
            let objMessage = new message("Success", "Task Updated");
            res.status(200).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})

app.put('/endtask', (req,res,next) => {
    let strTaskID = req.query.taskid || req.body.taskid;
    pool.query('UPDATE tblTasks SET Endtime = now() WHERE TaskID = ?',
    strTaskID, function(error, results){
        if(!error){
            pool.query('UPDATE tblTasks SET TotalMinutes = TIMESTAMPDIFF(MINUTE, StartTime, EndTime) WHERE EndTime IS NOT NULL AND StartTime IS NOT NULL AND TaskID = ?', 
            strTaskID, function(error, results){
                if(!error){
                    let objMessage = new message("Success", "Task Updated");
                    res.status(201).send(JSON.stringify(objMessage));
                } else {
                    let objMessage = new message("Error", error);
                    res.status(400).send(JSON.stringify(objMessage));
                }
            })
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})


app.delete("/tasks", (req,res,next) => {
    let strTaskID = req.query.taskid || req.body.taskid;
    pool.query('DELETE FROM tblTasks WHERE TaskID = ?', strTaskID, function(error, results){
        if(!error){
            let objMessage = new message("Success", "Task Deleted");
            res.status(200).send(JSON.stringify(objMessage));
        } else {
            let objMessage = new message("Error", error);
            res.status(400).send(JSON.stringify(objMessage));
        }
    })
})
//Begin
// Insert into tbltasks (TaskID, Title, Prodtype, Description, Firstname, Lastname, Starttime)
// values ('1','Irrigation','Vegetables','Water the plants','Leroy','Jankins',now())

//Complete
//update tbltasks set endtime = now() where taskID = ?
    
        
// UPDATE tbltasks 
// SET totalminutes = TIMESTAMPDIFF(MINUTE, starttime, endtime) 
// WHERE endtime IS NOT NULL AND starttime IS NOT NULL;