const inquirer = require("inquirer");
const mysql = require("mysql");

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
const PORT = process.env.PORT || 3306;

const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: PORT,

  // Your username
  user: "root",

  // Your password
  password: "password123",
  database: "company_db",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  welcomeMat();
});

let departmentsArr = [];
const deptQuery = connection.query("SELECT name FROM department", function (
  err,
  res
) {
  if (err) throw err;
  res.forEach((department) => {
    departmentsArr.push(department.name);
  });
  departmentsArr.push("Other");
});

let rolesArr = [];
const rolesQuery = connection.query("SELECT title FROM department", function (
  err,
  res
) {
  if (err) throw err;
  res.forEach((role) => {
    rolesArr.push(role.name);
  });
  rolesArr.push("Other");
});

const welcomeMat = () => {
  inquirer
    .prompt([
      {
        type: `confirm`,
        message: `Welcome to the company database editor! Are you a manager?`,
        name: `welcomeCheck`,
      },
    ])
    .then(function (managerCheck) {
      if (!managerCheck.welcomeCheck) {
        console.log(
          "This can only be filled out by a manager or a person of higher rank. Please contact the system administrator for help."
        );
        inquirer
          .prompt([
            {
              type: `confirm`,
              message: `Try again?`,
              name: `secondChance`,
            },
          ])
          .then(function (secondChance) {
            if (!secondChance.secondChance) {
              // doubleCheckExit();
              exitApp();
            } else {
              welcomeMat();
            }
          });
      } else {
        lobby();
      }
    });
};

const lobby = () => {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        choices: [
          "Add something...",
          "View something...",
          "Update something...",
          "Delete something...",
          "Quit",
        ],
        name: "lobbyChoice",
      },
    ])
    .then(function (lobbyAnswer) {
      switch (lobbyAnswer.lobbyChoice) {
        case "Add something...":
          console.log("I want to add something");
          addSomething();
          break;
        case "View something...":
          console.log("I want to view something");
          break;
        case "Update something...":
          console.log("I want to update something");
          break;
        case "Delete something...":
          console.log("I want to delete something");
          break;
        case "Quit":
          exitApp();
          break;
        default:
          exitApp();
          break;
      }
    });
};

const exitApp = () => {
  console.log("Goodbye!");
  connection.end();
};

const addSomething = () => {
  inquirer
    .prompt([
      {
        type: `list`,
        message: `What would you like to add?`,
        choices: [
          `Add a new department`,
          `Add a new role`,
          `Add a new employee`,
          `Go back`,
          `Quit`,
        ],
        name: `addSomething`,
      },
    ])
    .then(function (addAnswer) {
      switch (addAnswer.addSomething) {
        case `Add a new department`:
          addDepartment();
          // console.log("I want to add a new department");
          break;
        case `Add a new role`:
          addRole();
          // console.log("I want to add a new role");
          break;
        case `Add a new employee`:
          addEmployee();
          // console.log("I want to add a new employee");
          break;
        case `Go back`:
          lobby();
          break;
        case `Quit`:
          exitApp();
          break;
        default:
          break;
      }
    });
};

const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: `input`,
        message: `What is the name of the department you wish to add? (required)`,
        name: `deptName`,
      },
      {
        type: `number`,
        message: `What is the department code of the department you wish to add? (required) Hint: Should be a number. If unknown, contact HR or Accounting for more help`,
        name: `deptId`,
      },
    ])
    .then(function (newDept) {
      departmentsArr.push(newDept.deptName);
      console.log(`Creating a new department in database...\n`);
      const query = connection.query(
        "INSERT INTO department SET ?",
        {
          id: newDept.deptId,
          name: newDept.deptName,
        },
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " new department created!");
          addSomething();
        }
      );
    });
};

const addRole = () => {
  inquirer
    .prompt([
      {
        type: `input`,
        message: `What is the title of the role you wish to add? (required)`,
        name: `roleTitle`,
      },
      {
        type: `number`,
        message: `What is the annual salary of this role? (required) Hint: Should be a number without commas. If unknown, contact HR or Accounting for more help`,
        name: `roleSalary`,
      },
      {
        type: `number`,
        message: `What is the internal code (id) of this role? (required) Hint: Should be a number. If unknown, contact HR or Accounting for more help`,
        name: `roleId`,
      },
      {
        type: `list`,
        message: `To which department does this new role belong?`,
        choices: departmentsArr,
        name: `roleDept`,
      },
    ])
    .then(function (newRole) {
      if (newRole.roleDept === "Other") {
        console.log(
          "Error: Please create the department before creating the role."
        );
        inquirer
          .prompt([
            {
              type: `confirm`,
              message: `Do you want to create the department now?`,
              name: `createDeptFirst`,
            },
          ])
          .then(function (createDept) {
            if (createDept.createDeptFirst) {
              addDepartment();
            } else {
              addSomething();
            }
          });
      } else {
        console.log(`Creating a new role in database...\n`);
        rolesArr.push(newRole.roleTItle)
        const query = connection.query(
          "INSERT INTO role SET ?",
          {
            id: newRole.roleId,
            title: newRole.roleTitle,
            salary: newRole.roleSalary,
          },
          function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " new role created!");
            addSomething();
          }
        );
      }
    });
};

/* const addEmployee = () => {
  inquirer
    .prompt([
      {
        type: `input`,
        message: `What is the first name of the employee you wish to add? (required)`,
        name: `firstName`,
      },
      {
        type: `input`,
        message: `What is the last name of the employee you wish to add? (required)`,
        name: `lastName`,
      },
      {
        type: `list`,
        message: `What position (role) is this employee being hired for?(required)`,
        choices: rolesArr,
        name: `empRole`,
      },
      {
        type: `list`,
        message: `Who will be this person's manager?`,
        choices: employeesArr,
        name: `empManager`,
      },
      {
        type: `number`,
        message: `What is the employee's id number? (required) Hint: Should be a number. If unknown, contact HR or Accounting for more help`,
        name: `empId`,
      }
    ])
    .then(function (newEmp) {
      if (newEmp.empRole === "Other") {
        console.log(
          "Error: Please create the role before adding the employee."
        );
        inquirer
          .prompt([
            {
              type: `confirm`,
              message: `Do you want to create the role now?`,
              name: `createRoleFirst`,
            },
          ])
          .then(function (createRole) {
            if (createRole.createRoleFirst) {
              addRole();
            } else {
              addSomething();
            }
          });
      } else {
        console.log(`Creating a new employee in database...\n`);
        const query = connection.query(
          "INSERT INTO employee SET ?",
          {
            id: newEmp.empId,
            first_name: newEmp.firstName,
            last_name: newEmp.lastName,
          },
          function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " new role created!");
            addSomething();
          }
        );
      }
    });
};

function createProduct() {
  console.log("Inserting a new product...\n");
  var query = connection.query(
    "INSERT INTO products SET ?",
    {
      flavor: "Rocky Road",
      price: 3.0,
      quantity: 50,
    },
    function (err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " product inserted!\n");
      // Call updateProduct AFTER the INSERT completes
      updateProduct();
    }
  );

  // logs the actual query being run
  console.log(query.sql);
}

/* inquirer
  .prompt([
    {
      type: `confirm`,
      message: `Are you a manager?`,
      name: `manager`,
    },
  ])
  .then(function (managerCheck) {
    if (!managerCheck.manager) {
      console.log(
        "This can only be filled out by a manager. Please contact the system administrator for help."
      );
    } else {
      inquirer
        .prompt([
          {
            type: `input`,
            message: `What is your name, Manager?`,
            name: `name`,
          },
          {
            type: `input`,
            type: `number`,
            message: `What is your id number?`,
            name: `id`,
          },
          {
            type: `input`,
            message: `What is your email address?`,
            name: `email`,
          },
          {
            type: `input`,
            message: `What is your office number?`,
            name: `office`,
          },
        ])
        .then(function (managerResponse) {
          const manName = managerResponse.name;
          const manId = managerResponse.id;
          const manEmail = managerResponse.email;
          const manOffice = managerResponse.office;
          const manager = new Manager(manName, manId, manEmail, manOffice);
          devTeamArr.push(manager);
          addEmployeeConfirm();
        });
    }
  });
*/

// const doubleCheckExit = () => {
//   inquirer
//     .prompt([
//       {
//         type: "confirm",
//         message: "Are you sure you want to quit?",
//         name: "quitMe",
//       },
//     ])
//     .then(function (quitConfirm) {
//       if (quitConfirm.quitMe) {
//         exitApp();
//       } else {
//         welcomeMat();
//       }
//     });
// };