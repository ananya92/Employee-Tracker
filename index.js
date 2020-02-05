const cTable = require(`console.table`);
const mysql = require(`mysql`);
const inquirer = require(`inquirer`);

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
    inquirer.prompt([
        {
            type: "list",
            message: "What do you want to do?",
            name: "choice",
            choices: ["View all Employees",
                    "View all Employees by Department",
                    "View all Employees by Manager",
                    "Add Employee",
                    "Remove Employee",
                    "Update Employee Role",
                    "Update Employee Manager",
                    "View all Roles",
                    "Add Role",
                    "Remove Role",
                    "View all Departments",
                    "Add Department",
                    "Remove Department",
                    "View department budget"
                    ]
        }
    ]).then(function(data) {
        //Passing the selected choice to the selectedPrompt()
        selectedPrompt(data.choice);
    });
}
function selectedPrompt(choice) {
    switch(choice) {
        case "View all Employees":
            viewAllEmployees();
            break;
        case "View all Employees by Department":
            break;
        case "View all Employees by Manager":
            break;
        case "Add Employee":
            break;
        case "Remove Employee":
            break;
        case "Update Employee Role":
            break;
        case "Update Employee Manager":
            break;
        case "View all Roles":
            break;
        case "Add Role":
            break;
        case "Remove Role":
            break;  
        case "View all Departments":
            break;
        case "Add Department":
            break;
        case "Remove Department":
            break;
        case "View department budget":
            break;
        default: break;
    }
}

function viewAllEmployees() {
    connection.query("SELECT e1.id AS ID, e1.first_name AS First_Name, e1.last_name AS Last_Name, r.title AS Role, d.name AS Department, r.salary as Salary, concat(e2.first_name,' ', e2.last_name) AS Manager FROM employee e1 INNER JOIN role r ON e1.role_id = r.id INNER JOIN department d ON r.department_id = d.id LEFT JOIN employee e2 ON e1.manager_id = e2.id", function(err, result) {
        if(err) throw err;
        console.table("\nPrinting all employees:", result);
    });
}