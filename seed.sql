insert into department(name) values("Finance");
insert into department(name) values("HR");
insert into department(name) values("IT");

insert into role(title, salary, department_id) values("Software Developer", 1000000, 
(select id from department where name = "IT"));
insert into role(title, salary, department_id) values("Engineering Manager", 1800000, 
(select id from department where name = "IT"));
insert into role(title, salary, department_id) values("HR Manager", 1500000, 
(select id from department where name = "HR"));
insert into role(title, salary, department_id) values("Accountant", 1700000,
(select id from department where name = "Finance"));
insert into role(title, salary, department_id) values("System Admin", 1800000,
(select id from department where name = "IT"));
insert into role(title, salary, department_id) values("Financial Analyst", 1000000,
(select id from department where name = "Finance"));
insert into role(title, salary, department_id) values("Recuiter", 1000000,
(select id from department where name = "HR"));

insert into employee(first_name, last_name, role_id) values("Ananya", "Pramanik",
(select id from role where title="Software Developer"));
insert into employee(first_name, last_name, role_id) values("Piyush", "Gupta",
(select id from role where title="Accountant"));
insert into employee(first_name, last_name, role_id) values("Ankit", "Sharma",
(select id from role where title="Accountant"));

