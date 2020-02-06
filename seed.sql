insert into department(name) values("Finance");
insert into department(name) values("HR");
insert into department(name) values("IT");
insert into department(name) values("Marketing");

insert into role(title, salary, department_id) values("Software Developer", 90000, 
(select id from department where name = "IT"));
insert into role(title, salary, department_id) values("Engineering Manager", 120000, 
(select id from department where name = "IT"));
insert into role(title, salary, department_id) values("QA Engineer", 75000, 
(select id from department where name = "IT"));
insert into role(title, salary, department_id) values("Accountant", 110000,
(select id from department where name = "Finance"));
insert into role(title, salary, department_id) values("Finance Manager", 180000,
(select id from department where name = "Finance"));
insert into role(title, salary, department_id) values("Financial Analyst", 100000,
(select id from department where name = "Finance"));
insert into role(title, salary, department_id) values("Recuiter", 60000,
(select id from department where name = "HR"));
insert into role(title, salary, department_id) values("HR Manager", 90000, 
(select id from department where name = "HR"));
insert into role(title, salary, department_id) values("Marketing Technologist", 75000, 
(select id from department where name = "Marketing"));

insert into employee(first_name, last_name, role_id) values("Ananya", "Pramanik",
(select id from role where title="Software Developer"));
insert into employee(first_name, last_name, role_id) values("Piyush", "Gupta",
(select id from role where title="Accountant"));
insert into employee(first_name, last_name, role_id) values("Vinitha", "Suraj",
(select id from role where title="Engineering Manager"));
insert into employee(first_name, last_name, role_id) values("Prachi", "Shroff",
(select id from role where title="HR Manager"));
insert into employee(first_name, last_name, role_id) values("Aditya", "Veer",
(select id from role where title="Financial Analyst"));
