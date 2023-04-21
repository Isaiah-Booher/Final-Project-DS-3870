CREATE TABLE tblFarms (
    Farm_ID INT NOT NULL AUTO_INCREMENT,
    Farm_Name varchar(25),
    Street_Address_1 varchar(30),
    Street_Address_2 varchar(30),
    City varchar(25),
    State varchar(15),
    Zip INT,
    PRIMARY KEY (Farm_ID)
);

CREATE TABLE tblProducts (
    Product_ID INT NOT NULL AUTO_INCREMENT,
    Farm_ID INT,
    Prod_Type varchar(15),
    Fixed_Cost decimal(9,2),
    Date_Planted DATETIME,
    Date_Harvested DATETIME,
    Harvest_Weight_LBS decimal(9,2),
    Quantity INT,
    PRIMARY KEY (Product_ID),
    FOREIGN KEY (Farm_ID) REFERENCES tblFarms(Farm_ID)
);

CREATE TABLE tblUsers (
    User_ID INT NOT NULL AUTO_INCREMENT,
    Farm_ID INT,
    First_Name varchar(25),
    Last_Name varchar(25),
    Email varchar(30),
    UserPassword varchar(30),
    Phone varchar(10),
    Date_Recorded sysdate(),
    PRIMARY KEY (User_ID),
    FOREIGN KEY (Farm_ID) REFERENCES tblFarms(Farm_ID)
);

CREATE TABLE tblEmployees (
    Emp_ID INT NOT NULL AUTO_INCREMENT,
    Farm_ID INT,
    EmpFirstName varchar(25),
    EmpLastName varchar(25),
    Pay_Rate_hr decimal(3,2),
    Position varchar(15),
    PRIMARY KEY (Emp_ID),
    FOREIGN KEY (Farm_ID) REFERENCES tblFarms(Farm_ID)
);

CREATE TABLE tblTasks (
    Task_ID INT NOT NULL AUTO_INCREMENT,
    Prod_ID INT,
    Title varchar(15),
    Description varchar(250),
    Total_Time_Min INT,
    Emp_ID INT,
    PRIMARY KEY (Task_ID),
    FOREIGN KEY (Prod_ID) REFERENCES tblProducts(Product_ID),
    FOREIGN KEY (Emp_ID) REFERENCES tblEmployees(Emp_ID)
);

CREATE TABLE tblInventory (
    Inventory_ID INT NOT NULL AUTO_INCREMENT,
    Farm_ID INT,
    Item varchar(15),
    Item_Description varchar(250),
    Item_Cost decimal(9,2),
    Date_Recorded DATETIME,
    PRIMARY KEY (Inventory_ID),
    FOREIGN KEY (Farm_ID) REFERENCES tblFarms(Farm_ID)
);

CREATE TABLE tblSessions (
    Session_ID INT NOT NULL AUTO_INCREMENT,
    User_ID INT,
    Session_Start DATETIME,
    Session_End DATETIME,
    PRIMARY KEY (Session_ID),
    FOREIGN KEY (User_ID) REFERENCES tblUsers(User_ID)
);

CREATE TABLE tblCosts (
    Cost_ID INT NOT NULL AUTO_INCREMENT,
    Farm_ID INT,
    Cost_Date DATETIME,
    Cost_Type varchar(25),
    Cost_Description varchar(250),
    Cost_Amount decimal(9,2),
    PRIMARY KEY (Cost_ID),
    FOREIGN KEY (Farm_ID) REFERENCES tblFarms(Farm_ID)
);

