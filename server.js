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
          addSomething();
          break;
        case "View something...":
          viewSomething();
          break;
        case "Update something...":
          console.log("I want to update something");
          updateSomething();
          break;
        case "Delete something...":
          deleteSomething();
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
          // addChoice("departments")
          addDepartment();
          break;
        case `Add a new role`:
          addRole();
          break;
        case `Add a new employee`:
          addEmployee();
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

// const addChoice = (tableName) => {
//   inquirer
//     .prompt([
//       {
//         type: `input`,
//         message: `What is the name of the department you wish to add? (required)`,
//         name: `deptName`,
//       },
//       {
//         type: `number`,
//         message: `What is the department code of the department you wish to add? (required) Hint: Should be a number. If unknown, contact HR or Accounting for more help`,
//         name: `deptId`,
//       },
//     ])
//     .then(function (newDept) {
//       departmentsArr.push(newDept.deptName);
//       console.log(`Creating a new department in database...\n`);
//       const query = connection.query(
//         "INSERT INTO department SET ?",
//         {
//           id: newDept.deptId,
//           name: newDept.deptName,
//         },
//         function (err, res) {
//           if (err) throw err;
//           console.log(res.affectedRows + " new department created!");
//           addSomething();
//         }
//       );
//     });
// }

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
      // departmentsArr.push(newDept.deptName);
      console.log(`Creating a new department in database...\n`);
      connection.query(
        "INSERT INTO departments SET ?",
        {
          id: newDept.deptId,
          name: newDept.deptName,
        },
        function (err, data) {
          if (err) throw err;
          console.log(data.affectedRows + " new department created!");
          connection.query("SELECT * FROM departments", function (err, data) {
            if (err) throw err;
            console.table(data);
            addSomething();
          });
        }
      );
    });
};

const addRole = () => {
  let departmentsArr = [];
  connection.query("SELECT * FROM departments", function (err, data) {
    if (err) throw err;
    data.forEach((department) => {
      departmentsArr.push(department.name);
    });
    departmentsArr.push("Other");
  });
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
        connection.query(
          "SELECT id FROM departments WHERE ?",
          {
            name: newRole.roleDept,
          },
          function (err, data) {
            if (err) throw err;
            let deptCode = data[0].id;
            connection.query(
              "INSERT INTO roles SET ?",
              {
                id: newRole.roleId,
                title: newRole.roleTitle,
                salary: newRole.roleSalary,
                department_id: deptCode,
              },
              function (err, res) {
                if (err) throw err;
                console.log(res.affectedRows + " new role created!");
                addSomething();
              }
            );
          }
        );
      }
    });
};

const addEmployee = () => {
  let rolesArr = [];
  connection.query("SELECT title FROM roles", function (err, data) {
    if (err) throw err;
    data.forEach((role) => {
      rolesArr.push(role.title);
    });
    rolesArr.push("Other");
  });
  let employeesArr = [];
  connection.query("SELECT first_name, last_name FROM employees", function (
    err,
    data
  ) {
    if (err) throw err;
    data.forEach((name) => {
      let fullName = `${name.first_name} ${name.last_name}`;
      employeesArr.push(fullName);
    });
    employeesArr.push("Other", "None");
  });
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
      },
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
      } else if (newEmp.empManager === "Other") {
        console.log(
          "Error: Please create the manager as a new employee before adding the employee under them."
        );
        inquirer
          .prompt([
            {
              type: `confirm`,
              message: ` Did you mean to say 'None' for this employee's manager?`,
              name: `createManagerFirst`,
            },
          ])
          .then(function (createRole) {
            if (createRole.createManagerFirst) {
              addRole();
            } else {
              addSomething();
            }
          });
      } else {
        console.log(`Creating a new employee in database...\n`);
        connection.query(
          "SELECT id FROM roles WHERE?",
          {
            title: newEmp.empRole,
          },
          function (err, data) {
            if (err) throw err;
            let roleId = data[0].id;
            connection.query(
              "INSERT INTO employees SET ?",
              {
                id: newEmp.empId,
                first_name: newEmp.firstName,
                last_name: newEmp.lastName,
                role_id: roleId,
              },
              function (err, res) {
                if (err) throw err;
                console.log(res.affectedRows + " new role created!");
                addSomething();
              }
            );
          }
        );
      }
    });
};

const viewSomething = () => {
  inquirer
    .prompt([
      {
        type: `list`,
        message: `What would you like to view?`,
        choices: [
          `View departments`,
          `View roles`,
          `View employees`,
          `Go back`,
          `Quit`,
        ],
        name: `viewSomething`,
      },
    ])
    .then(function (viewAnswer) {
      switch (viewAnswer.viewSomething) {
        case `View departments`:
          viewResults("departments", lobby);
          break;
        case `View roles`:
          viewResults("roles", lobby);
          break;
        case `View employees`:
          viewResults("employees", lobby);
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

const viewResults = (tableName, nextStep) => {
  connection.query("SELECT * FROM ??", [tableName], function (err, data) {
    if (err) {
      console.log(err);
    }
    console.table(data);
    nextStep(tableName);
  });
};

const deleteSomething = () => {
  inquirer
    .prompt([
      {
        type: `list`,
        message: `What would you like to delete?`,
        choices: [
          `Delete a department`,
          `Delete a role`,
          `Delete an employee`,
          `Go back`,
          `Quit`,
        ],
        name: `deleteSomething`,
      },
    ])
    .then(function (deleteAnswer) {
      switch (deleteAnswer.deleteSomething) {
        case `Delete a department`:
          viewResults("departments", deleteChoice);
          break;
        case `Delete a role`:
          viewResults("roles", deleteChoice);
          break;
        case `Delete an employee`:
          viewResults("employees", deleteChoice);
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

const deleteChoice = (tableName) => {
  inquirer
    .prompt([
      {
        type: "number",
        message: `Enter the id of the ${tableName} you wish to delete`,
        name: "idDelete",
      },
    ])
    .then(function (deleteItem) {
      connection.query(
        "DELETE FROM ?? WHERE id = ?",
        [tableName, deleteItem.idDelete],
        function (err, data) {
          if (err) {
            console.log(err);
          }
          console.log(`${tableName} deleted`);
          lobby();
        }
      );
    });
};

const updateSomething = () => {
  inquirer
    .prompt([
      {
        type: `list`,
        message: `What would you like to update?`,
        choices: [
          `Update a department`,
          `Update a role`,
          `Update an employee`,
          `Go back`,
          `Quit`,
        ],
        name: `updateSomething`,
      },
    ])
    .then(function (updateAnswer) {
      switch (updateAnswer.updateSomething) {
        case `Update a department`:
          updateDepartment();
          break;
        case `Update a role`:
          updateRole();
          break;
        case `Update an employee`:
          updateEmployee();
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

const updateDepartment = () => {
  let departmentsArr = [];
  connection.query("SELECT * FROM departments", function (err, data) {
    if (err) throw err;
    data.forEach((department) => {
      departmentsArr.push(department.name);
    });
    inquirer
      .prompt([
        {
          type: `list`,
          message: `Which department do you wish to update?`,
          choices: departmentsArr,
          name: `updateDept`,
        },
        {
          type: `list`,
          message: `Would you like to update the name or the department code?`,
          choices: ["Name", "Department code (ID)"],
          name: `updateChoice`,
        },
        {
          type: `input`,
          message: `Enter the new department name (required).`,
          name: `updateName`,
          when: function (answer) {
            return answer.updateChoice === "Name";
          },
        },
        {
          type: `number`,
          message: `Enter the new department code (required). Hint: Should be a number. If unknown, contact HR or Accounting for more help`,
          name: `updateId`,
          when: function (answer) {
            return answer.updateChoice === "Department code (ID)";
          },
        },
      ])
      .then(function (updateItem) {
        console.log("Updating department...");
        switch (updateItem.updateChoice) {
          case "Name":
            connection.query(
              "UPDATE departments SET ?? WHERE ?",
              [updateItem.updateDept, { name: updateItem.updateName }],
              function (err, data) {
                if (err) throw err;
                console.log(data.affectedRows + " department updated!");
                connection.query("SELECT * FROM departments", function (
                  err,
                  data
                ) {
                  if (err) throw err;
                  console.table(data);
                });
              }
            );
            updateSomething();
            break;
          case "Department code (ID)":
            connection.query(
              "UPDATE departments SET ?? WHERE ?",
              [updateItem.updateDept, { name: updateItem.updateId }],
              function (err, data) {
                if (err) throw err;
                console.log(data.affectedRows + " department updated!");
                connection.query("SELECT * FROM departments", function (
                  err,
                  data
                ) {
                  if (err) throw err;
                  console.table(data);
                });
              }
            );
            updateSomething();
            break;
          default:
            updateSomething();
            break;
        }
      });
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
