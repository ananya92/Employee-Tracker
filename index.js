const cTable = require(`console.table`);
const mysql = require(`mysql`);
const inquirer = require(`inquirer`);

const selectQuery = `SELECT e1.id AS Employee_ID, e1.first_name AS First_Name, e1.last_name AS Last_Name, r.title AS Role, d.name AS Department, r.salary as Salary, concat(e2.first_name,' ', e2.last_name) AS Manager FROM employee e1 INNER JOIN role r ON e1.role_id = r.id INNER JOIN department d ON r.department_id = d.id LEFT JOIN employee e2 ON e1.manager_id = e2.id`;

require('events').EventEmitter.defaultMaxListeners = 25;
//Creating MYSQL connection
var connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "123glowiris",
    database: "employee_db"
});

//Connecting to database
connection.connect(function(err) {
    if(err) throw err;
    start();
});

function start() {
    //Home page menu
    return inquirer.prompt([
        {
            type: "list",
            message: "What do you want to do?",
            name: "choice",
            choices: ["View all Employees",
                    "View all Employees by Department",
                    "View all Employees by Manager",
                    "Add new Employee, Role or department",
                    "Remove Employee, Role or department",
                    "Update Employee Role",
                    "Update Employee Manager",
                    "View all Roles",
                    "View all Departments",
                    "View department budget",
                    "Exit"
                    ]
        }
    ]).then(function(data) {
        switch(data.choice) {
            case "View all Employees":
                viewAllEmployees();
                break;
            case "View all Employees by Department":
                viewEmployeesByDepartment();
                break;
            case "View all Employees by Manager":
                viewEmployeesByManager();
                break;
            case "Add new Employee, Role or department":
                break;
            case "Remove Employee, Role or department":
                break;
            case "Update Employee Role":
                break;
            case "Update Employee Manager":
                break;
            case "View all Roles":
                break;
            case "View all Departments":
                break;
            case "View department budget":
                break;
            case "Exit":
            default: 
                connection.end();
                break;
        }
    });
}

 //Function to view information about all employees
function viewAllEmployees() {
    connection.query(selectQuery, function(err, result) {
        if(err) throw err;
        console.table("\nPrinting all employees:", result);
        //Calling the Exit Menu
        return start();
    });
}

//Function to view information about employees in a given department
function viewEmployeesByDepartment() {
    //SQL query to select all department names
    connection.query("SELECT name FROM department", function(err, result) {
        if(err) throw err;
        //Give choice to user to select a department
        return inquirer.prompt([
            {
                type: "list",
                name: "choice",
                message: "Choose department:",
                choices: result
            }
        ]).then(function(data) {
            //SQL query to list all employees in the chosen department
            connection.query(`${selectQuery} WHERE d.name = ?`,[data.choice], function(err, res) {
                if(err) throw err;
                if(res.length === 0) {
                    console.log("\nNo records available!\n");
                }
                else {
                    console.table(`\nPrinting all employees in ${data.choice} department:`, res);
                }
                return start();
            });
        });
    });
}

//Function to view information about employees under a given manager
function viewEmployeesByManager() {
    //SQL query to select all manager names
    connection.query("SELECT concat(e2.first_name,' ', e2.last_name) as manager FROM employee e1 JOIN employee e2 ON e1.manager_id = e2.id", function(err, result) {
        if(err) throw err;
        var res=[];
        result.forEach(element => {
            console.log(element.manager);
            res.push(element.manager);
        });
        //Give choice to user to select the manager
        return inquirer.prompt([
            {
                type: "list",
                name: "choice",
                message: "Choose manager:",
                choices: res
            }
        ]).then(function(data) {
            //SQL query to get all employees under the chosen manager
            connection.query(`${selectQuery} WHERE concat(e2.first_name,' ', e2.last_name) = ?`,[data.choice], function(err, res) {
                if(err) throw err;
                if(res.length === 0) {
                    console.log("\nNo records available!\n");
                }
                else {
                    console.table(`\nPrinting all employees under ${data.choice}:`, res);
                }
                return start();
            });
        });
    });
}