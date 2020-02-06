const cTable = require(`console.table`);
const mysql = require(`mysql`);
const inquirer = require(`inquirer`);

const selectQuery = `SELECT e1.id AS Employee_ID, e1.first_name AS First_Name, e1.last_name AS Last_Name, r.title AS Role, d.name AS Department, r.salary as Salary, concat(e2.first_name,' ', e2.last_name) AS Manager FROM employee e1 INNER JOIN role r ON e1.role_id = r.id INNER JOIN department d ON r.department_id = d.id LEFT JOIN employee e2 ON e1.manager_id = e2.id `;
const selManagersQuery = `SELECT concat(e2.first_name,' ', e2.last_name) as manager FROM employee e1 JOIN employee e2 ON e1.manager_id = e2.id group by manager`;
const selectRolesQuery = `SELECT r.id AS Role_ID, r.title as Title, r.salary as CTC, d.name AS Department FROM role r INNER JOIN department d ON r.department_id = d.id ORDER BY r.id`;
const selectDepQuery = `SELECT id AS Department_ID, name AS Department_Name FROM department`;

const insertEmpQuery1 = `INSERT into employee(first_name, last_name, role_id) values(?,?,(SELECT id FROM role WHERE title = ?))`;
const insertEmpQuery2 = `INSERT into employee(first_name, last_name, role_id, manager_id) values(?,?,(SELECT id FROM role WHERE title = ?),?)`;
const insertRoleQuery = `INSERT INTO role(title, salary, department_id) VALUES(?, ?, (SELECT id FROM department WHERE name = ?))`;

const updateRoleQuery = `UPDATE employee SET role_id = (SELECT id FROM role WHERE title = ?) WHERE concat(first_name,' ', last_name) = ?`;
const updateManagerQuery1 = `UPDATE employee SET manager_id = NULL WHERE concat(first_name,' ', last_name) = ?`;
const updateManagerQuery2 = `UPDATE employee SET manager_id = (SELECT * FROM (SELECT e.id FROM employee e WHERE concat(e.first_name,' ', e.last_name) = ?) AS x) WHERE concat(first_name,' ', last_name) = ?`;

const budgetQuery = `SELECT d.name AS Department_Name, sum(r.salary) AS Budget FROM employee e INNER JOIN role r ON e.role_id = r.id right join department d on d.id = r.department_id group by d.name`

//increasing the maximum warning limit for number of event listeners
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
                    "Update Employee's Role",
                    "Update Employee's Manager",
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
                add();
                break;
            case "Remove Employee, Role or department":
                remove()
                break;
            case "Update Employee's Role":
                updateEmpRole();
                break;
            case "Update Employee's Manager":
                updateEmpManager();
                break;
            case "View all Roles":
                viewAllRoles();
                break;
            case "View all Departments":
                viewAllDepartments();
                break;
            case "View department budget":
                viewDepartmentBudget();
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
    connection.query(`${selectQuery} order by e1.id`, function(err, result) {
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
        if(result.length === 0) {
            console.log("\nNo records available!\n");
            return start();
        }
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
    connection.query(selManagersQuery, function(err, result) {
        if(err) throw err;
        var res=[];
        if(result.length === 0) {
            console.log("\nNo Manager records available!\n");
            return start();
        }
        result.forEach(element => {
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

//Function to add new Employee, Role or Department
function add() {
    return inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "What do you want to add?:",
            choices: ["Employee", "Role", "Department"]
        }
    ]).then(function(data) {
        switch(data.choice) {
            case "Employee":
                addEmployee();
                break;
            case "Role":
                addRole();
                break;
            case "Department":
                addDepartment();
                break;
        }
    });
}

//Function to add new employee
function addEmployee() {
    //SQL query to fetch all employee roles
    connection.query("SELECT title FROM role", function(err, result1) {
        if(err) throw err;
        if(result1.length === 0) {
            console.log("\nNo roles available! Please add a role first.\n");
            return start();
        }
        //SQL query to fetch all employee names
        connection.query(`SELECT concat(first_name,' ', last_name) as manager FROM employee`, function(err, result2) {
            if(err) throw err;
            var managers=[], roles=[];
            result1.forEach(element => {
                roles.push(element.title);
            });
            roles.push("Go Back to Main Menu");
            //Give option to not set Manager by providing option "None"
            managers.push("None");
            result2.forEach(element => {
                managers.push(element.manager);
            });
            //Reading new employee's details
            return inquirer.prompt([
                {
                    type: "input",
                    message: "Enter first name:",
                    name: "first_name"
                },
                {
                    type: "input",
                    message: "Enter last name:",
                    name: "last_name"
                },
                {
                    type: "list",
                    message: "Choose role:",
                    name: "role",
                    choices: roles
                },
                {
                    type: "list",
                    message: "Choose manager:",
                    name: "manager",
                    choices: managers
                },
            ]).then(function(data) {
                var params = [];
                var query = "";
                if(data.role === "Go Back to Main Menu") {
                    return start();
                }
                //Creating the INSERT SQL query based on whether manager has been selected
                if(data.manager == "None") {
                    params = [data.first_name, data.last_name, data.role];
                    query = insertEmpQuery1;
                    //SQL INSERT query to add new employee
                    connection.query(query,params, function(err, result) {
                        if(err) throw err;
                        console.log(`\n ${result.affectedRows} Employee added successfully!\n`);
                        start();
                    });
                }
                else {
                connection.query("SELECT id FROM employee WHERE concat(first_name,' ', last_name) = ?", data.manager, function(err, res) {
                        if(err) throw err;
                        params = [data.first_name, data.last_name, data.role, res[0].id];
                        query = insertEmpQuery2;
                        //SQL INSERT query to add new employee
                        connection.query(query,params, function(err, result) {
                            if(err) throw err;
                            console.log(`\n ${result.affectedRows} Employee added successfully!\n`);
                            start();
                        });
                    });
                }
            });
        });
    });
}

//Function to add new role
function addRole() {
    //SQL query to fetch all department names
    connection.query("SELECT name FROM department", function(err, result) {
        if(err) throw err;
        if(result.length === 0) {
            console.log("\nNo department records available! Please add a department first.\n");
            return start();
        }
        result.push("Go Back to Main Menu");
        //Reading new role's details
        return inquirer.prompt([
            {
                type: "input",
                message: "Enter role title:",
                name: "title"
            },
            {
                type: "input",
                message: "Enter salary:",
                name: "salary",
                validate: function( value ) {
                    //Validating with regex to allow the entered salary to contain digits only
                    var pass = value.match(/^[0-9]+\.?[0-9]*$/i);
                    if (pass) {
                      return true;
                    } else {
                      return "Please enter valid number.";
                    }
                  }
            },
            {
                type: "list",
                message: "Choose department:",
                name: "department",
                choices: result
            }
        ]).then(function(data) {
            if(data.department === "Go Back to Main Menu") {
                return start();
            }
            //SQL INSERT query to add new role
            connection.query(insertRoleQuery, [data.title, data.salary, data.department], function(err, result) {
                if(err) throw err;
                console.log(`\n ${result.affectedRows} Role added successfully!\n`);
                start();
            });
        });
    });
}

//Function to add new department
function addDepartment() {
    //Reading new department's details
    return inquirer.prompt([
        {
            type: "input",
            message: "Enter department name:",
            name: "name"
        }
    ]).then(function(data) {
        //SQL INSERT query to add new department
        connection.query("INSERT INTO department(name) VALUES(?)", [data.name], function(err, result) {
            if(err) throw err;
            console.log(`\n ${result.affectedRows} Department added successfully!\n`);
            start();
        });
    });
}

//Function to remove Employee, Role or Department
function remove() {
    return inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "What do you want to remove?:",
            choices: ["Employee", "Role", "Department"]
        }
    ]).then(function(data) {
        switch(data.choice) {
            case "Employee":
                removeEmployee();
                break;
            case "Role":
                removeRole();
                break;
            case "Department":
                removeDepartment();
                break;
            default: break;
        }
    });
}

//Function to remove employee
function removeEmployee() {
    //SQL query to fetch all employee names
    connection.query("SELECT concat(first_name,' ', last_name) as name FROM employee", function(err, result) {
        if(err) throw err;
        if(result.length === 0) {
            console.log("\nNo records available!\n");
            return start();
        }
        var employees = [];
        result.forEach(element => {
            employees.push(element.name);
        });
        employees.push("Go Back to Main Menu");
        //Giving choice to user to select employee to delete
        return inquirer.prompt([
            {
                type: "list",
                message: "Select employee to remove:",
                name: "choice",
                choices: employees
            }
        ]).then(function(data) {
            if(data.choice === "Go Back to Main Menu") {
                return start();
            }
            //SQL DELETE query to delete selected employee
            var nameArr = data.choice.split(" ");
            connection.query("DELETE FROM employee WHERE first_name = ? && last_name = ?" ,[nameArr[0], nameArr[1]], function(err, result) {
                if(err) throw err;
                console.log(`\n ${result.affectedRows} Employee deleted successfully!\n`);
                start();
            });
        });
    });
}

//Function to remove role
function removeRole() {
    //SQL query to fetch all roles
    connection.query("SELECT title FROM role", function(err, result) {
        if(err) throw err;
        if(result.length === 0) {
            console.log("\nNo roles available!\n");
            return start();
        }
        var roles = [];
        result.forEach(element => {
            roles.push(element.title);
        });
        roles.push("Go Back to Main Menu");
        //Giving choice to user to select role to delete
        return inquirer.prompt([
            {
                type: "list",
                message: "Select role to remove:",
                name: "choice",
                choices: roles
            }
        ]).then(function(data) { 
            if(data.choice === "Go Back to Main Menu") {
                return start();
            }
            inquirer.prompt([
                {//Confirming deletion of role as it would delete all employees of that role as well
                    type: "confirm",
                    message: `Deleting role will also remove all employees in this role. Do you want to proceed?`,
                    name: "confirm"
                }
            ]).then(function(data1) {
                if(data1.confirm) {
                    //SQL DELETE query to delete the selected role from role table
                    connection.query("DELETE FROM role WHERE title = ?" ,[data.choice], function(err, result) {
                        if(err) throw err;
                        console.log(`\n ${result.affectedRows} Role deleted successfully!\n`);
                        start();
                    });
                }
                else {
                    //Loading the main menu again if user doesn't want to delete role
                    start();
                }
            });
        });
    });
}

//Function to remove department
function removeDepartment() {
    //SQL query to fetch all departments
    connection.query("SELECT name FROM department", function(err, result) {
        if(err) throw err;
        if(result.length === 0) {
            console.log("\nNo department records available!\n");
            return start();
        }
        result.push("Go Back to Main Menu");
        //Giving choice to user to select department to delete
        return inquirer.prompt([
            {
                type: "list",
                message: "Select department to remove:",
                name: "choice",
                choices: result
            }
        ]).then(function(data) {
            if(data.choice === "Go Back to Main Menu") {
                return start();
            }
            inquirer.prompt([
                {//Confirming deletion of department as it would delete all roles and employees of that department as well
                    type: "confirm",
                    message: `Deleting department will also remove all roles and employees in this department. Do you want to proceed?`,
                    name: "confirm"
                }
            ]).then(function(data1) {
                if(data1.confirm) {
                    //SQL DELETE query to delete the department from department table
                    connection.query("DELETE FROM department WHERE name = ?" ,[data.choice], function(err, result) {
                        if(err) throw err;
                        console.log(`\n ${result.affectedRows} department deleted successfully.\n`);
                        start();
                    });
                }
                else {
                    //Loading the main menu again if user doesn't want to delete department
                    start();
                }
            })
        });
    });
}

//Function to update the role of an employee
function updateEmpRole() {
    //SQL query to fetch all employee roles
    connection.query("SELECT title FROM role", function(err, result1) {
        if(err) throw err;
        if(result1.length === 0) {
            console.log("\nNo role records available!\n");
            return start();
        }
        //SQL query to fetch all employee names
        connection.query(`SELECT concat(first_name,' ', last_name) as name FROM employee`, function(err, result2) {
            if(err) throw err;
            if(result2.length === 0) {
                console.log("\nNo employee records available!\n");
                return start();
            }
            var names=[], roles=[];
            result1.forEach(element => {
                roles.push(element.title);
            });
            roles.push("Go Back to Main Menu");
            result2.forEach(element => {
                names.push(element.name);
            });
            //Giving choice to user to select employee who's role they want to update
            inquirer.prompt([
                {
                    type: "list",
                    message: "Select employee who's role you want to update:",
                    name: "emp",
                    choices: names
                },
                {
                    type: "list",
                    message: "Select new role:",
                    name: "role",
                    choices: roles
                }
            ]).then(function(data) {
                if(data.role === "Go Back to Main Menu") {
                    return start();
                }
                //SQL UPDATE query to update role of selected employee
                connection.query(updateRoleQuery ,[data.role, data.emp], function(err, result) {
                    if(err) throw err;
                    console.log(`\n ${result.affectedRows} Employee updated successfully!\n`);
                    start();
                });
            });
        });
    });
}

//Function to update the manager of an employee
function updateEmpManager() {
    //SQL query to fetch all employee names
    connection.query(`SELECT concat(first_name,' ', last_name) as name FROM employee`, function(err, result) {
        if(err) throw err;
        if(result.length === 0) {
            console.log("\nNo employee records available!\n");
            return start();
        }
        var names=[];
        result.forEach(element => {
            names.push(element.name);
        });
        names.push("Go Back to Main Menu");
        //Giving choice to user to select employee who's role they want to update
        inquirer.prompt([
            {
                type: "list",
                message: "Select employee:",
                name: "emp",
                choices: names
            }
        ]).then(function(data) {
            if(data.emp === "Go Back to Main Menu") {
                return start();
            }
            names.push("None");
            for(var i=0; i< names.length; i++) {
                if(names[i] === data.emp) {
                    names.splice(i,1);
                    break;
                }
            }
            inquirer.prompt([
                {
                    type: "list",
                    message: "Select new manager:",
                    name: "manager",
                    choices: names
                }
            ]).then(function(data1) {
                if(data1.manager === "Go Back to Main Menu") {
                    return start();
                }
                else if(data1.manager === "None") {
                    //User opted to remove the manager of the selected employee
                    connection.query(updateManagerQuery1 ,[data.emp], function(err, result) {
                        if(err) throw err;
                        console.log(`\n ${result.affectedRows} Employee updated successfully!\n`);
                        start();
                    });
                }
                else {
                    //User selected new manager for the selected employee
                    connection.query(updateManagerQuery2 ,[data1.manager, data.emp], function(err, result) {
                        if(err) throw err;
                        console.log(`\n ${result.affectedRows} Employee updated successfully!\n`);
                        start();
                    });
                }
            });
        });
    });
}

 //Function to view information about all roles
 function viewAllRoles() {
    connection.query(selectRolesQuery, function(err, result) {
        if(err) throw err;
        console.table("\nPrinting all roles:", result);
        //Calling the Exit Menu
        return start();
    });
}

 //Function to view information about all departments
 function viewAllDepartments() {
    connection.query(selectDepQuery, function(err, result) {
        if(err) throw err;
        console.table("\nPrinting all departments:", result);
        //Calling the Exit Menu
        return start();
    });
}

//View the total utilized budget of a department -- ie the combined salaries of all employees in that department
function viewDepartmentBudget() {
    connection.query(budgetQuery, function(err, result) {
        if(err) throw err;
        console.table("\nPrinting the budget utilized by each departments:", result);
        //Calling the Exit Menu
        return start();
    });
}