Za pokretenje projekta je potrebno sledece:

*Docker deo:
docker i redis
docker i postgres
docker i neo4j

docker run -p7474:7474 -p:7687:7687 -d --env NEO4J_AUTH=neo4j/mysecretpassword neo4j

docker run --name redis -dp 6379:6379 redis

docker run --name postgres -e POSTGRES_PASSWORD=mysecretpassword -dp 5432:5432 postgres

pokrenuti te containere u docker desktop-u

*Postgres deo:
potrebno je da se konektujemo na postgres bazu na primer koriscenjem beekeper-a i izvrsiti sledece komande

create database nbp

create table chat (chatid varchar primary key, user1id varchar, user2id varchar, user1name varchar, user2name varchar, user1photo varchar, user2photo varchar);

create table message(idmessage varchar primary key, textmessage varchar, datemessage varchar, chatid varchar,FOREIGN KEY (chatid) REFERENCES chat(chatid), senderid varchar);

*API deo:
potrebno je iz glavnog foldera prebaciti se u api komandom cd express

npm i

npm run watch

Front deo:
potrebno je iz glavnog foldera prebaciti se u api komandom cd front

npm i

npm run start

*Admin deo:
potrebno je iz glavnog foldera prebaciti se u api komandom cd admin

npm i 

npm run start

--ukoliko se pokrecu i admin i front odjednom potrebno je izabrati drugi port koji ce ponuditi vs code npr 3002