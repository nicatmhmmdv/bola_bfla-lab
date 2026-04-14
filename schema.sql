drop table if exists resources;
drop table if exists users;

create table users
(
    id serial primary key,
    username varchar(50) unique not null,
    password varchar(255) not null,
    role varchar(20) default 'user'
);

create table resources
(
    id serial primary key,
    owner_id integer references users(id) not null,
    content TEXT not null
);

insert into users (username, password,role) values ('nicat','pass1234','user'), ('victim','1234pass','user'),('admin','password','admin');
insert into resources (owner_id,content) values (1, 'BOLA'),(2, 'password="idorbola"');

