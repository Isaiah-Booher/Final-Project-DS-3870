create table tblFarms (
	Farm_ID INT,
    Farm_Name varchar(25),
    Street_Address_1 varchar(30),
    Street_Address_2 varchar(30),
    City varchar(25),
    State varchar(15),
    Zip INT,
    Primary Key (Farm_ID)
);
create table tblProducts (
	Product_ID INT,
    Farm_Name varchar(25),
    Prod_Type varchar(15),
    Fixed_Cost decimal(9,2),
    Date_Planted DATETIME,
    Date_Harvested DATETIME,
    Harvest_Weight_LBS decimal(9,2),
    Quantity INT,
    Primary Key (Product_ID)
);
create table tblUsers (
	User_ID INT,
    Farm_ID INT,
    First_Name varchar(25),
    Last_Name varchar(25),
    Email varchar(30),
    UserPassword varchar(30),
    Phone varchar(10),
    Primary Key (User_ID)
);
create table tblEmployees (
	Emp_ID INT,
    Farm_Name varchar(20),
    EmpFirstName varchar(25),
    EmpLastName varchar(25),
    Pay_Rate_hr decimal(3,2),
    Position varchar(15),
    Primary Key (Emp_ID)
);

create table tblTasks (
	Task_ID INT,
    Title varchar(15),
    Prod_Type varchar(15),
    Description varchar(250),
    Total_Time_Min INT,
    Emp_FirstName varchar(15),
    Emp_LastName varchar(15),
    Primary Key (Task_ID)
);

create table tblInventory (
	Inventory_ID int,
    Farm_ID int,
    Item varchar(15),
    Item_Description varchar(250),
    Item_Cost decimal(9,2),
    Date_Recorded DATETIME,
    Primary Key (Inventory_ID)
);