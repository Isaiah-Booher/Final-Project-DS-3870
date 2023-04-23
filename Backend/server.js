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
        pool.query('INSERT INTO tblUsers (First_Name, Last_Name, Email, UserPassword, Phone, Date_Recorded) VALUES(?, ?, ?, ?, ?,GETDATE())',[strEmail, strFirstName, strLastName, strPassword, strPhone], function(error, results){
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

app.get("/users", (req,res,next) => {
    let strEmail = req.query.email || req.body.email;
    let strPassword = req.query.password || req.body.password;
    pool.query('SELECT * FROM tblUsers WHERE Email = ?', strEmail, function(error, results){
        if(!error){
            if(results.length > 0){
                bcrypt.compare(strPassword, results[0].UserPassword).then(match => {
                    if(match){
                        let objUser = new User(results[0].Email, results[0].First_Name, results[0].Last_Name, results[0].Phone, null, false);
                        let strSessionID = uuidv4();
                        pool.query('INSERT INTO tblSessions (Session_ID, Session_Start, Session_End, Email) VALUES(?, getdate(), getdate(), ?)',
                        [strSessionID, objUser.Email], function(error, results){
                                if(!error){
                                    let objSession = new Session(strSessionID, objUser, null, null);
                                    res.status(200).send(JSON.stringify(objSession));
                                } else {
                                    let objMessage = new message("Error", error);
                                    res.status(400).send(JSON.stringify(objMessage));
                                }
                            })
                    } else {
                        let objMessage = new message("Error", "Invalid Password");
                        res.status(400).send(JSON.stringify(objMessage));
                    }
                })
            } else {
                let objMessage = new message("Error", "Invalid Email");
                res.status(400).send(JSON.stringify(objMessage));
            }
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
    let strProductName = req.query.productname || req.body.productname;
    let strProductType = req.query.producttype || req.body.producttype;
    let strProductPrice = req.query.productprice || req.body.productprice;
    let strProductQuantity = req.query.productquantity || req.body.productquantity;
    pool.query('INSERT INTO tblProducts (Product_Name, Product_Type, Product_Price, Product_Quantity, Date_Recorded) VALUES(?, ?, ?, ?, SYSDATE())',
    [strProductName, strProductType, strProductPrice, strProductQuantity], function(error, results){
            if(!error){
                let objMessage = new message("Success", "New Product Created");
                res.status(201).send(JSON.stringify(objMessage));
            } else {
                let objMessage = new message("Error", error);
                res.status(400).send(JSON.stringify(objMessage));
            }
        })
        } )

app.get("/products", (req,res,next) => {
    let strProductID = req.query.productid || req.body.productid;
    pool.query('SELECT * FROM tblProducts WHERE Product_ID = ?', strProductID, function(error, results){
        if(!error){
            if(results.length > 0){
                let objProduct = new Product(results[0].Product_ID, results[0].Product_Name, results[0].Product_Type, results[0].Product_Price, results[0].Product_Quantity, results[0].Date_Recorded);
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
    let strProductName = req.query.productname || req.body.productname;
    let strProductType = req.query.producttype || req.body.producttype;
    let strProductPrice = req.query.productprice || req.body.productprice;
    let strProductQuantity = req.query.productquantity || req.body.productquantity;
    pool.query('UPDATE tblProducts SET Product_Name = ?, Product_Type = ?, Product_Price = ?, Product_Quantity = ? WHERE Product_ID = ?', 
    [strProductName, strProductType, strProductPrice, strProductQuantity, strProductID], function(error, results){
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
            
app/post('/employees', (req,res,next) => {
    let strEmployeeName = req.query.employeename || req.body.employeename;
    let strEmployeeAddress = req.query.employeeaddress || req.body.employeeaddress;
    let strEmployeePhone = req.query.employeephone || req.body.employeephone;
    let strEmployeeEmail = req.query.employeeemail || req.body.employeeemail;
    let strEmployeePosition = req.query.employeeposition || req.body.employeeposition;
    let strEmployeeSalary = req.query.employeesalary || req.body.employeesalary;
    let strEmployeeStartDate = req.query.employeestartdate || req.body.employeestartdate;
    let strEmployeeEndDate = req.query.employeeenddate || req.body.employeeenddate;
    pool.query('INSERT INTO tblEmployees (Employee_Name, Employee_Address, Employee_Phone, Employee_Email, Employee_Position, Employee_Salary, Employee_Start_Date, Employee_End_Date, Date_Recorded) VALUES(?, ?, ?, ?, ?, ?, ?, ?, SYSDATE())',
    [strEmployeeName, strEmployeeAddress, strEmployeePhone, strEmployeeEmail, strEmployeePosition, strEmployeeSalary, strEmployeeStartDate, strEmployeeEndDate], function(error, results){
            if(!error){
                let objMessage = new message("Success", "New Employee Created");
                res.status(201).send(JSON.stringify(objMessage));
            } else {
                let objMessage = new message("Error", error);
                res.status(400).send(JSON.stringify(objMessage));
            }
        })
        } )

app.get("/employees", (req,res,next) => {
    let strEmployeeID = req.query.employeeid || req.body.employeeid;
    pool.query('SELECT * FROM tblEmployees WHERE Employee_ID = ?', strEmployeeID, function(error, results){
        if(!error){
            if(results.length > 0){
                let objEmployee = new Employee(results[0].Employee_ID, results[0].Employee_Name, results[0].Employee_Address, results[0].Employee_Phone, results[0].Employee_Email, results[0].Employee_Position, results[0].Employee_Salary, results[0].Employee_Start_Date, results[0].Employee_End_Date, results[0].Date_Recorded);
                res.status(200).send(JSON.stringify(objEmployee));
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
    let strEmployeeName = req.query.employeename || req.body.employeename;
    let strEmployeeAddress = req.query.employeeaddress || req.body.employeeaddress;
    let strEmployeePhone = req.query.employeephone || req.body.employeephone;
    let strEmployeeEmail = req.query.employeeemail || req.body.employeeemail;
    let strEmployeePosition = req.query.employeeposition || req.body.employeeposition;
    let strEmployeeSalary = req.query.employeesalary || req.body.employeesalary;
    let strEmployeeStartDate = req.query.employeestartdate || req.body.employeestartdate;
    let strEmployeeEndDate = req.query.employeeenddate || req.body.employeeenddate;
    pool.query('UPDATE tblEmployees SET Employee_Name = ?, Employee_Address = ?, Employee_Phone = ?, Employee_Email = ?, Employee_Position = ?, Employee_Salary = ?, Employee_Start_Date = ?, Employee_End_Date = ? WHERE Employee_ID = ?', 
    [strEmployeeName, strEmployeeAddress, strEmployeePhone, strEmployeeEmail, strEmployeePosition, strEmployeeSalary, strEmployeeStartDate, strEmployeeEndDate, strEmployeeID], function(error, results){
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

app.get("/inventory", (req,res,next) => {
    let strItemID = req.query.itemid || req.body.itemid;
    pool.query('SELECT * FROM tblInventory WHERE Inventory_ID = ?', strItemID, function(error, results){
        if(!error){
            if(results.length > 0){
                let objInventory = new Inventory(results[0].Item_ID, results[0].Item, results[0].Item_Description, results[0].Item_Cost, results[0].Date_Recorded);
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
    let strItemID = req.query.itemid || req.body.itemid;
    let strItem = req.query.item || req.body.item;
    let strItemDescription = req.query.itemdescription || req.body.itemdescription;
    let strItemCost = req.query.itemcost || req.body.itemcost;
    pool.query('UPDATE tblInventory SET Item = ?, Item_Description = ?, Item_Cost = ? WHERE Inventory_ID = ?', 
    [strItem, strItemDescription, strItemCost, strItemID], function(error, results){
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
    let strItemID = req.query.itemid || req.body.itemid;
    pool.query('DELETE FROM tblInventory WHERE Inventory_ID = ?', strItemID, function(error, results){
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
    let strTitle = req.query.title || req.body.title;
    let strDescription = req.query.description || req.body.description;
    let strTotalTimeMin = req.query.totaltimemin || req.body.totaltimemin;

    pool.query('INSERT INTO tblTasks (Title, Description, Total_Time_Min, Input_Date) VALUES(?, ?, ?, GetDate())',
    [strTitle, strDescription, strTotalTimeMin], function(error, results){
            if(!error){
                let objMessage = new message("Success", "New Task Created");
                res.status(201).send(JSON.stringify(objMessage));
            } else {
                let objMessage = new message("Error", error);
                        res.status(400).send(JSON.stringify(objMessage));
                    }
                })
                } )


app.get("/tasks", (req,res,next) => {
    let strTaskID = req.query.taskid || req.body.taskid;
    pool.query('SELECT * FROM tblTasks WHERE Task_ID = ?', strTaskID, function(error, results){
        if(!error){
            if(results.length > 0){
                let objTasks = new Tasks(results[0].Task_ID, results[0].Title, results[0].Description, results[0].Total_Time_Min, results[0].Input_Date);
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

    // function getSessionDetails(strSessionID, callback){
    //     pool.query('SELECT * FROM tblSessions WHERE SessionID = ?',[strSessionID], function(error, results){ //Modify Sql statement to pull session ID from everywhere
    //         if(!error){
    //             if(results.length > 0){ 
    //                 let objUser = new User(results[0].Email, results[0].FirstName, results[0].LastName, results[0].MobileNumber);
    //                 let objSession = new Session(results[0].SessionID, results[0].User, results[0].StartDateTime, results[0].LastUsedDateTime);
    //                 callback(objSession);
    //             } else {
    //                 callback(null);
    //             }
    //         } else {
    //             callback(null);
    //         }
    //     }
    // )};


    
        
