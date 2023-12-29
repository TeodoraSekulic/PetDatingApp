import express from "express";
import neo4j from "neo4j-driver";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json" assert { type: "json" };
import logger from "morgan";
import bodyParser from "body-parser";
import pg from "pg";
// import io from "socket.io"
import redis from "socket.io-redis";
import Redis from "redis";
// import { Server } from "socket.io";
import { Server } from "socket.io";
// import { createServer } from "http";
// import socketio from 'socket.io';
//postgres connect
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "nbp",
  password: "mysecretpassword",
  port: 5432,
});

//redis pub/sub
const redisClient = Redis.createClient({ url: "redis://localhost:6379" });

//neo connect
const neoPort = 7687;
const driver = neo4j.driver(
  "bolt://localhost:" + neoPort,
  neo4j.auth.basic("neo4j", "mysecretpassword"),
  { disableLosslessIntegers: true }
);
const session = driver.session();

const app = express();
const port = 3001;
const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
// const server = createServer(app);
// // const socketio = new Server(server);
// const io = socketio(server);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.adapter(redis({ host: "localhost", port: 6379 }));
app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// //support parsing of application/json type post data
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );

  // intercepts OPTIONS method
  if ("OPTIONS" === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

//Reddis part
let connectedUsers = {};

io.on("connection", (socket) => {
  socket.on("subscribe", (data) => {
    let userId = data.userId;
    connectedUsers[userId] = socket;
  });
  socket.on("message", (data) => {
    console.log(data);
    let userId = data.userId;
    let message = data.message;
    console.log(userId);
    console.log(message);
    let socket = connectedUsers[userId];
    // socket.emit('message', data);
    io.emit("message", data);
    // io.emit('message', data);
  });
});

//Chat
app.get("/getChat/:idUser1/:idUser2", (req, res) => {
  let idUser1 = req.params.idUser1;
  let idUser2 = req.params.idUser2;
  pool.query(
    "SELECT * FROM chat  WHERE user1id = '" +
      idUser1 +
      "' AND user2id='" +
      idUser2 +
      "'",
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error fetching chats");
      } else {
        res.json(result.rows);
      }
    }
  );
});

app.get("/getChatForUser/:idUser1", (req, res) => {
  let idUser1 = req.params.idUser1;
  pool.query(
    "SELECT * FROM chat  WHERE user1id = '" +
      idUser1 +
      "' OR user2id='" +
      idUser1 +
      "'",
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error fetching chats");
      } else {
        res.json(result.rows);
      }
    }
  );
});

app.post("/addChat", async (req, res) => {
  try {
    let chatid = req.body.chatid;
    let idUser1 = req.body.idUser1;
    let idUser2 = req.body.idUser2;
    let user1name = req.body.user1name;
    let user2name = req.body.user2name;
    let user1photo = req.body.user1photo;
    let user2photo = req.body.user2photo;
    await pool.query(
      "INSERT INTO chat (chatid, user1id, user2id, user1name,user2name,user1photo,user2photo) \
      SELECT '" +
        chatid +
        "', '" +
        idUser1 +
        "', '" +
        idUser2 +
        "', '" +
        user1name+
        "', '" +
        user2name+
        "', '" +
        user1photo+
        "', '" +
        user2photo+
        "' WHERE NOT EXISTS (SELECT 1 FROM chat WHERE (user1id = '" +
        idUser1 +
        "' OR user1id='" +
        idUser2 +
        "') AND (user2id='" +
        idUser2 +
        "' OR user2id='" +
        idUser1 +
        "'))"
    );
    res.status(201).send("Chat added");
  } catch (err) {
    console.error(err.message);
  }
});

app.put("/putNamePhotoChat", (req, res) => {
  let id = req.body.id;
  let name = req.body.name;
  let photo = req.body.photo;
  console.log(id);
  console.log(name);
  console.log(photo);
  try{
  pool.query(
    "UPDATE chat \
    SET user1name = CASE \
        WHEN user1id = '"+id+"' THEN '"+ name+"'\
        ELSE user1name \
    END,\
    user1photo = CASE \
        WHEN user1id = '"+id+"' THEN '"+ photo+"'\
        ELSE user1photo \
    END, \
    user2name = CASE \
        WHEN user2id = '"+id+"' THEN '"+ name+"'\
        ELSE user2name \
    END, \
    user2photo = CASE \
        WHEN user2id = '"+id+"' THEN '"+ photo+"'\
        ELSE user2photo \
    END \
    WHERE user1id = '"+id+"' OR user2id = '"+id+"'");
    // res.status(201).send("Chat updated");
  }
  catch(err)
  {
    console.error(err.message);
  }

});

//Messages
app.get("/getMessages/:idChat", async (req, res) => {
  let idChat = req.params.idChat;
  redisClient.get(idChat, async (error, mess) => {
    if (error) console.error(error);
    if (mess != null) {
      console.log("Cache Hit");
      return res.json(JSON.parse(mess));
    } else {
      console.log("Cache Miss");
      pool.query(
        "SELECT * FROM message WHERE chatid = '" + idChat + "'",
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).send("Error fetching chats");
          } else {
            console.log(result.rows);
            redisClient.set(idChat, JSON.stringify(result.rows));
            res.json(result.rows);
          }
        }
      );
    }
  });
});

app.post("/addMessage", async (req, res) => {
  try {
    let messageid = req.body.messageid;
    let text = req.body.text;
    let date = req.body.date;
    let senderid = req.body.senderid;
    let chatid = req.body.chatid;

    redisClient.flushall();
    await pool.query(
      "INSERT INTO message (idmessage, textmessage, datemessage, chatid, senderid) \
      VALUES ('" +
        messageid +
        "', '" +
        text +
        "', '" +
        date +
        "', '" +
        chatid +
        "', '" +
        senderid +
        "')"
    );

    res.status(201).send("Message added");
  } catch (err) {
    console.error(err.message);
  }
});

//Node Type
app.post("/postType/:name", function (req, res) {
  let name = req.params.name;
  session
    .run("CREATE (n:Type { name: '" + name + "'}) RETURN n")
    .then(function (result) {
      res.status(201).send(name);
      //session.close();
    })
    .catch(function (err) {
      console.log(err);
      res.status(400).send("Tip vec postoji");
    });
});

app.post("/postType", function (req, res) {
  let name = req.body.name;
  console.log(name);
  session
    .run("CREATE (n:Type { name: '" + name + "'}) RETURN n")
    .then(function (result) {
      res.status(201).send(name);
      //session.close();
    })
    .catch(function (err) {
      console.log(err);
      res.status(400).send("Tip vec postoji");
    });
});

app.get("/getTypes", function (req, res) {
  session
    .run("MATCH(n:Type) RETURN n")
    .then(function (result) {
      var niz = [];
      result.records.forEach(function (record) {
        niz.push(record._fields[0]);
      });
      res.send(niz);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.get("/getType/:id", function (req, res) {
  let idPar = req.params.id;
  console.log(idPar);
  session
    .run("MATCH(n:Type) WHERE ID(n) = " + idPar + " RETURN n")
    .then(function (result) {
      res.send(result.records[0]._fields[0].properties);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.put("/putType/:id", function (req, res) {
  let id = req.params.id;
  let name = req.body.name;
  console.log(id);
  console.log(name);
  session
    .run(
      "MATCH(s:Type) WHERE ID(s) = " +
        id +
        " SET s.name = '" +
        name +
        "' RETURN s"
    )
    .then(function (result) {
      res.status(200).send("updated");
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.delete("/deleteType/:id", function (req, res) {
  let idPar = req.params.id;
  console.log(idPar);
  session
    .run("MATCH (r:Type) WHERE ID(r) = " + idPar + " DETACH DELETE r")
    .then(function (result) {
      res.status(200).send("deleted");
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

//Node Breed
app.post("/postBreed", function (req, res) {
  let name = req.body.name;
  let idType = req.body.idType;
  session
    //.run("CREATE (n:Breed { name: '" + name + "'}) RETURN n")
    // veza Breed i Type
    .run(
      "MATCH (t:Type) WHERE ID(t) =" +
        idType +
        " CREATE (b:Breed {name: '" +
        name +
        "'})" +
        " CREATE (b)-[:BreedType]->(t)"
    )
    .then(function (result) {
      res.status(201).send(name);
      //session.close();
    })
    .catch(function (err) {
      console.log(err);
      res.status(400).send("Tip vec postoji");
    });
});

app.get("/getBreed", function (req, res) {
  session
    .run("MATCH(n:Breed) RETURN n")
    .then(function (result) {
      var niz = [];
      result.records.forEach(function (record) {
        niz.push(record._fields[0]);
      });
      res.send(niz);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.get("/getBreedType/:idBreed", function (req, res) {
  let id = req.params.idBreed;

  let s =
    "MATCH (b:Breed)-[v:BreedType]->(a:Type) WHERE ID(b) = " + id + " RETURN a";
  console.log(s);
  session
    .run(s)
    .then(function (result) {
      var niz = [];
      result.records.forEach(function (record) {
        niz.push(record._fields[0]);
      });
      res.send(niz);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.get("/getTypeBreeds/:idType", function (req, res) {
  let id = req.params.idType;

  let s = "MATCH (r)-[v:BreedType]->(a:Type) WHERE ID(a) = " + id + " RETURN r";
  console.log(s);
  session
    .run(s)
    .then(function (result) {
      var niz = [];
      result.records.forEach(function (record) {
        niz.push(record._fields[0]);
      });
      res.send(niz);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.put("/putBreed/:id", function (req, res) {
  let id = req.params.id;
  let name = req.body.name;
  session
    .run(
      "MATCH(s:Breed) WHERE ID(s) = " +
        id +
        " SET s.name = '" +
        name +
        "' RETURN s"
    )
    .then(function (result) {
      res.status(200).send("updated");
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.delete("/deleteBreed/:id", function (req, res) {
  let idPar = req.params.id;
  console.log(idPar);
  session
    .run("MATCH (r:Breed) WHERE ID(r) = " + idPar + " DETACH DELETE r")
    .then(function (result) {
      res.status(200).send("deleted");
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});


////////////////////////////
//Node User
app.post("/postUser", function (req, res) {
  console.log(req.body);
  let username = req.body.username;
  let userType = req.body.userType;
  let password = req.body.password;
  let name = req.body.name;
  let age = req.body.age;
  let pedigreUrl = req.body.pedigreUrl;
  let profilePictureUrl = req.body.profilePictureUrl;
  let bio = req.body.bio;
  let priceLevel = req.body.priceLevel;
  let active = req.body.active;
  let idBreed = req.body.idBreed;
  let idCity = req.body.idCity;
  //let idPost = req.body.idPost;

  let strr = "OPTIONAL MATCH(n) WHERE n.username = '" + username + "' RETURN n";

  console.log(strr);
  session
    .run(strr)
    .then(function (result) {
      let exsistUsername = result.records[0]._fields[0];
      console.log(exsistUsername);
      if (exsistUsername != null) {
        res.status(400).send("Korisnik sa ovim username vec postoji!");
      } else {
        let str =
          "MATCH (b:Breed) WHERE ID(b) = " +
          idBreed +
          " MATCH (country:LocationCountry)-[v3:CountryCity]->(l:LocationCity)  WHERE ID(l) = " +
          idCity +
          " CREATE (u:User { userType: '" +
          userType +
          "', username: '" +
          username +
          "', password: '" +
          password +
          "', name: '" +
          name +
          "', age: '" +
          age +
          "', pedigreUrl: '" +
          pedigreUrl +
          "', profilePictureUrl: '" +
          profilePictureUrl +
          "', bio: '" +
          bio +
          "', priceLevel: '" +
          priceLevel +
          "', active: '" +
          active +
          "'})" +
          "  CREATE (u)-[:UserBreed]->(b)" +
          "  CREATE (u)-[:UserLocation]->(l)";

        let s1 = "";
        let s3 = " RETURN u, b, l, country";
       
        console.log(s1);

        session
          .run(s1 + str  + s3)
          .then(function (result) {
            var niz = [];

            niz.push(result.records[0]._fields[0]);
            niz.push(result.records[0]._fields[1]);
            niz.push(result.records[0]._fields[2]);
            niz.push(result.records[0]._fields[3]);

            res.send(niz);
          })
          .catch(function (err) {
            console.log(err);
            res.status(400).send("Korisnik vec postoji");
          });
      }
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.get(
  "/getUsersWithFilters/:idUser/:idBreed/:minage/:maxage/:active/:idCity/:idCountry/:priceLevel",
  function (req, res) {
    let idUser = req.params.idUser;
    let idBreed = req.params.idBreed;
    let minage = req.params.minage;
    let maxage = req.params.maxage;
    let active = req.params.active;
    let idCity = req.params.idCity;
    let idCountry = req.params.idCountry;
    let priceLevel = req.params.priceLevel;

    if (
      idBreed == -1 &&
      minage == -1 &&
      maxage == -1 &&
      active == "" &&
      idCity == -1 &&
      idCountry == -1
    ) {
      res.status(404).send("There is no arguments");
    }

    let str1 =
      "MATCH(u1) WHERE ID(u1)=" +
      idUser +
      " MATCH (b:Breed)<-[v1:UserBreed]-(u:User)-[v2:UserLocation]->(l:LocationCity)<-[v3:CountryCity]-(c:LocationCountry) ";
    let str2 = "WHERE NOT ID(u)=" + idUser + " AND NOT u.userType='admin' AND NOT (u1)-[:Interested]->(u)";
    let str3 = " RETURN u, b, l, c";

    if (minage != -1) {
      str2 += "AND '" + minage + "' <=";
    }
    if (maxage != -1 || minage != -1) {
      str2 += "u.age";
    }
    if (maxage != -1) {
      str2 += "<='" + maxage + "'";
    }
    if (priceLevel != -1) {
      str2 += " AND u.priceLevel='" + priceLevel + "'";
    }
    if (active != "") {
      str2 += " AND  u.active = '" + active + "'";
    }

    if (idBreed != -1) {
      str2 += " AND ID(b) = " + idBreed;
    }

    if (idCountry != -1) {
      str2 += " AND ID(c) = " + idCountry;
    } else {
      if (idCity != -1) {
        str2 += " AND ID(l) = " + idCity;
      }
    }

    console.log(str1 + str2 + str3);
    session
      .run(str1 + str2 + str3)
      .then(function (result) {
        var niz = [];
        result.records.forEach(function (record) {
          niz.push(record._fields);
        });
        res.send(niz);
      })
      .catch(function (err) {
        console.log(err);
        res.status(404).send("Not found");
      });
  }
);

app.get("/getUserPosts/:idUser", function (req, res) {
  let id = req.params.idUser;
  console.log(id);
  let s =
    "MATCH (u:User) OPTIONAL MATCH (u)-[v1:UserPost]->(p:Post) WHERE ID(u)= " +
    id +
    " AND NOT u.userType='admin' RETURN p";
  console.log(s);
  session
    .run(s)
    .then(function (result) {
      var niz = [];
      result.records.forEach(function (record) {
        if (record._fields[0] != null) niz.push(record._fields[0]);
      });
      res.send(niz);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.get("/getUsers", function (req, res) {
  session
    .run(
      "MATCH (lc:LocationCountry)-[v3:CountryCity]->(c:LocationCity)<-[v2:UserLocation]-(u1:User)-[v1:UserBreed]->(b:Breed) WHERE NOT u1.userType='admin' RETURN u1, b, c, lc"
    )
    .then(function (result) {
      var niz = [];
      result.records.forEach(function (record) {
        niz.push(record._fields);
      });
      res.send(niz);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.get("/getUserPosts/:id", function (req, res) {
  let id = req.params.id;
  let s =
    "MATCH(n:User) WHERE ID(n)=" +
    id +
    " AND EXISTS((n)-[:UserPost]->())" +
    " MATCH (n)-[r:UserPost]->(p:Post)" +
    " RETURN p";
  console.log(s);
  session
    .run(s)
    .then(function (result) {
      var niz = [];
      result.records.forEach(function (record) {
        niz.push(record._fields[0]);
      });
      res.send(niz);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.get("/getUserById/:id", function (req, res) {
  let id = req.params.id;
  session
    .run(
      "MATCH (lc:LocationCountry)-[v3:CountryCity]->(c:LocationCity)<-[v2:UserLocation]-(u1:User)-[v1:UserBreed]->(b:Breed)" +
        " WHERE ID(u1) = " +
        id +
        " AND NOT u1.userType='admin' RETURN u1, b, c, lc"
    )
    .then(function (result) {
      var niz = [];
      result.records.forEach(function (record) {
        niz.push(record._fields);
      });
      res.send(niz);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.get("/getSimilarUsers/:id", function (req, res) {
  let id = req.params.id;


    // let s =
    // "MATCH (c:LocationCity)<-[v1:UserLocation]-(r:User)-[v2:UserBreed]->(b:Breed) \
    // OPTIONAL MATCH (r)-[:Interested]->(u2)-[:Interested]->(u1) \
    // MATCH (lc:LocationCountry)-[v3:CountryCity]->(c1:LocationCity)<-[v4:UserLocation]-(u1:User)-[v5:UserBreed]->(t1:Breed) \
    // WHERE ID(r) = " + id +
    // " AND ID(t1)=id(b) AND ID(c1)=id(c) AND NOT ID(u1)=id(r) AND u1.active='true' \
    // AND NOT u1.userType='admin' AND NOT (r)-[:Interested]->(u1)\
    // RETURN DISTINCT u1, t1, c1, lc";

    let s ="MATCH (c:LocationCity)<-[v1:UserLocation]-(r:User)-[v2:UserBreed]->(b:Breed) \
    MATCH (r)-[:Interested]->(u2)-[:Interested]->(u1), \
    (lc:LocationCountry)-[v3:CountryCity]->(c1:LocationCity)<-[v4:UserLocation]-(u1:User)-[v5:UserBreed]->(t1:Breed)\
    WHERE ID(r) = " + id +
    " AND NOT ID(u1)=id(r) AND u1.active='true' \
    AND NOT u1.userType='admin' AND NOT (r)-[:Interested]->(u1)\
    RETURN DISTINCT u1, t1, c1, lc \
    UNION \
    MATCH (c:LocationCity)<-[v1:UserLocation]-(r:User)-[v2:UserBreed]->(b:Breed) \
    MATCH (lc:LocationCountry)-[v3:CountryCity]->(c1:LocationCity)<-[v4:UserLocation]-(u1:User)-[v5:UserBreed]->(t1:Breed) \
    WHERE ID(r) = " + id +
    " AND ID(t1)=id(b) AND ID(c1)=id(c) AND NOT ID(u1)=id(r) AND u1.active='true' \
    AND NOT u1.userType='admin' AND NOT (r)-[:Interested]->(u1)\
    RETURN DISTINCT u1, t1, c1, lc";
 
    console.log(s);

  // let s =
  //   " MATCH (c:LocationCity)<-[v1:UserLocation]-(r:User)-[v2:UserBreed]->(b:Breed) \
  // MATCH (lc:LocationCountry)-[v3:CountryCity]->(c1:LocationCity)<-[v4:UserLocation]-(u1:User)-[v5:UserBreed]->(t1:Breed) \
  // WHERE ID(r) = " +
  //   id +
  //   " AND ID(t1)=id(b) AND ID(c1)=id(c) AND NOT ID(u1)=id(r) AND u1.active='true' AND NOT u1.userType='admin' AND NOT (r)-[:Interested]->(u1)\
  // RETURN DISTINCT u1, t1, c1, lc";

  var niz = [];
  session
    .run(s)
    .then(function (result) {
      //console.log(result.records);

      result.records.forEach(function (record) {
        console.log(record._fields);
        if(record._fields!=null)
          niz.push(record._fields);
      });
      
      if(niz.length<4)
        res.send(niz);
      else 
        res.send(getMultipleRandom(niz, 3));
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

function getMultipleRandom(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, num);
}

app.post("/login", function (req, res) {
  let username = req.body.username;
  let password = req.body.password;
  //console.log(id);
  let s1 =
    "MATCH (lc:LocationCountry)-[v3:CountryCity]->(c:LocationCity)<-[v2:UserLocation]-(u1:User)-[v1:UserBreed]->(b:Breed) \
  WHERE u1.username = '" +
    username +
    "' AND u1.password = '" +
    password +
    "' RETURN u1, b, c, lc";

  console.log(s1);
  session
    .run(s1)
    .then(function (result) {
      var niz = [];

      niz.push(result.records[0]._fields[0]);
      niz.push(result.records[0]._fields[1]);
      niz.push(result.records[0]._fields[2]);
      niz.push(result.records[0]._fields[3]);
      res.send(niz);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.put("/putUser/:id", function (req, res) {
  let id = req.params.id;
  let username = req.body.username;
  let userType = req.body.userType;
  let password = req.body.password;
  let name = req.body.name;
  let age = req.body.age;
  let pedigreUrl = req.body.pedigreUrl;
  let profilePictureUrl = req.body.profilePictureUrl;
  let bio = req.body.bio;
  let priceLevel = req.body.priceLevel;
  let active = req.body.active;
  let idCity = req.body.idCity;
  // console.log(award);
  // console.log(id);
  let str1 =
    "MATCH(u:User) WHERE ID(u) = " +
    id +
    " MATCH (u:User)-[v:UserLocation]->(c:LocationCity)" +
    " DELETE v";

  let str4 =
    "MATCH(u:User)-[v:UserBreed]->(br:Breed) WHERE ID(u) = " +
    id +
    " MATCH (country:LocationCountry)-[v3:CountryCity]->(city:LocationCity) WHERE ID(city)=" +
    idCity +
    " SET u.username = '" +
    username +
    "' SET u.userType = '" +
    userType +
    "' SET u.password = '" +
    password +
    "' SET u.name = '" +
    name +
    "' SET u.age = " +
    age +
    " SET u.pedigreUrl = '" +
    pedigreUrl +
    "' SET u.profilePictureUrl = '" +
    profilePictureUrl +
    "' SET u.bio = '" +
    bio +
    "' SET u.priceLevel = " +
    priceLevel +
    " SET u.active = '" +
    active +
    "' CREATE (u)-[:UserLocation]->(city)";

  let str3 = " RETURN u, br, city, country";


  session
    .run(str1)
    .then(function (result) {
      // console.log(str4 +str3);
      return session.run(str4 + str3);
    })
    .then(function (result) {
      var niz = [];

      niz.push(result.records[0]._fields[0]);
      niz.push(result.records[0]._fields[1]);
      niz.push(result.records[0]._fields[2]);
      niz.push(result.records[0]._fields[3]);

      res.send(niz);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.post("/InterestedInUser/:idUser1/:idUser2", function (req, res) {
  let id1 = req.params.idUser1;
  let id2 = req.params.idUser2;
  session
    .run(
      "MATCH(s1:User) WHERE ID(s1)=" +
        id1 +
        " MATCH(s2:User) WHERE ID(s2)=" +
        id2 +
        " AND NOT (s1)-[:Interested]->(s2) CREATE (s1)-[:Interested]->(s2)"
    )
    .then(function (result) {
      res.status(200).send("Relationship created");
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.delete("/deleteInterestedInUser/:idUser1/:idUser2", function (req, res) {
  let id1 = req.params.idUser1;
  let id2 = req.params.idUser2;
  session
    .run(
      "OPTIONAL MATCH(s1:User)-[v:Interested]->(s2:User) WHERE ID(s1)=" +
        id1 +
        " AND ID(s2)=" +
        id2 +
        " DELETE v"
    )
    .then(function (result) {
      res.status(200).send("Relationship deleted");
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.get("/getInterestedUsers/:id", function (req, res) {
  let id = req.params.id;
  let s =
    "MATCH (u1:User)-[v1:Interested]->(u2:User)-[v2:UserBreed]->(breed:Breed), (u2)-[v3:UserLocation]->(city:LocationCity)<-[v4:CountryCity]-(country:LocationCountry) \
  WHERE ID(u1) = " +
    id +
    " RETURN u2, breed, city, country";

  session
    .run(s)
    .then(function (result) {
      var niz = [];
      result.records.forEach(function (record) {
        niz.push(record._fields);
      });
      res.send(niz);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});


app.get("/getNumberOfInterestedUsers/:id", function (req, res) {
  let id = req.params.id;
  let s =
    "MATCH (u1:User)<-[r:Interested]-(u2:User)\
  WHERE ID(u1) = " +
    id +
    " RETURN count(*)";

  session
    .run(s)
    .then(function (result) {
      let rez=result.records[0]._fields;
      res.send(rez);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});


app.get("/getIsInterestedInUser/:idUser1/:idUser2", function (req, res) {
  let idUser1 = req.params.idUser1;
  let idUser2 = req.params.idUser2;
  let s =
    "MATCH (u1:User) MATCH(u2:User) \
  WHERE ID(u1) = " +
    idUser1 +
    " AND ID(u2) = " +
    idUser2 +
    " RETURN EXISTS((u1:User)-[:Interested]->(u2:User))";

  console.log(s);
  session
    .run(s)
    .then(function (result) {
      res.send(result.records[0]._fields);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.delete("/deleteUser/:id", function (req, res) {
  let idPar = req.params.id;
  console.log(idPar);
  session
    .run("MATCH (r:User) WHERE ID(r) = " + idPar + " DETACH DELETE r")
    .then(function (result) {
      res.status(200).send("deleted");
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

//Node Post
app.post("/postPost", function (req, res) {
  let date = req.body.date;
  let imageURL = req.body.imageURL;
  let idUser = req.body.idUser;
  session
    .run(
      "MATCH (u:User) WHERE ID(u) =" +
        idUser +
        " CREATE (n:Post { date: '" +
        date +
        "' , imageURL: '" +
        imageURL +
        "'})" +
        " CREATE (u)-[:UserPost]->(n)"
    )
    .then(function (result) {
      res.status(201).send(date);
      //session.close();
    })
    .catch(function (err) {
      console.log(err);
      res.status(400).send("Post vec postoji");
    });
});

app.get("/getPost", function (req, res) {
  session
    .run("MATCH(n:Post) RETURN n")
    .then(function (result) {
      var niz = [];
      result.records.forEach(function (record) {
        niz.push(record._fields[0]);
      });
      res.send(niz);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.put("/putPost/:id", function (req, res) {
  let id = req.params.id;
  let date = req.body.date;
  let imageURL = req.body.imageURL;
  // console.log(award);
  console.log(id);
  console.log(date);
  console.log(imageURL);
  session
    .run(
      "MATCH(n:Post) WHERE ID(n) = " +
        id +
        " SET n.date = '" +
        date +
        "' SET n.imageURL = '" +
        imageURL +
        "' RETURN n"
    )
    .then(function (result) {
      res.status(200).send("updated");
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.delete("/deletePost/:id", function (req, res) {
  let idPar = req.params.id;
  console.log(idPar);
  session
    .run("MATCH (r:Post) WHERE ID(r) = " + idPar + " DETACH DELETE r")
    .then(function (result) {
      res.status(200).send("deleted");
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

//Node LocationCity
app.post("/postLocationCity", function (req, res) {
  let name = req.body.name;
  let idCountry = req.body.idCountry;
  session
    //.run("CREATE (n:LocationCity { name: '" + name  + "'}) RETURN n")
    .run(
      "MATCH (lc:LocationCountry) WHERE ID(lc) =" +
        idCountry +
        " CREATE (l:LocationCity {name: '" +
        name +
        "'})" +
        " CREATE (l)<-[:CountryCity]-(lc)"
    )
    .then(function (result) {
      res.status(201).send(name);
      //session.close();
    })
    .catch(function (err) {
      console.log(err);
      res.status(400).send("Grad vec postoji");
    });
});

app.get("/getLocationCountryCities/:idCountry", function (req, res) {
  let id = req.params.idCountry;

  let s =
    "MATCH (r)<-[v:CountryCity]-(a:LocationCountry) WHERE ID(a) = " +
    id +
    " RETURN r";

  console.log(s);
  session
    .run(s)
    .then(function (result) {
      var niz = [];
      result.records.forEach(function (record) {
        niz.push(record._fields[0]);
      });
      res.send(niz);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.get("/getLocationCity", function (req, res) {
  session
    .run("MATCH(n:LocationCity) RETURN n")
    .then(function (result) {
      var niz = [];
      result.records.forEach(function (record) {
        niz.push(record._fields[0]);
      });
      res.send(niz);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.put("/putLocationCity/:id", function (req, res) {
  let id = req.params.id;
  let name = req.body.name;
  // console.log(award);
  console.log(id);
  console.log(name);
  session
    .run(
      "MATCH(n:LocationCity) WHERE ID(n) = " +
        id +
        " SET n.name = '" +
        name +
        "' RETURN n"
    )
    .then(function (result) {
      res.status(200).send("updated");
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.delete("/deleteLocationCity/:id", function (req, res) {
  let idPar = req.params.id;
  console.log(idPar);
  session
    .run("MATCH (r:LocationCity) WHERE ID(r) = " + idPar + " DETACH DELETE r")
    .then(function (result) {
      res.status(200).send("deleted");
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

//Node LocationCountry
app.post("/postLocationCountry", function (req, res) {
  let name = req.body.name;
  session
    .run("CREATE (n:LocationCountry { name: '" + name + "'}) RETURN n")
    .then(function (result) {
      res.status(201).send(name);
      //session.close();
    })
    .catch(function (err) {
      console.log(err);
      res.status(400).send("Grad vec postoji");
    });
});

app.get("/getLocationCountry", function (req, res) {
  session
    .run("MATCH(n:LocationCountry) RETURN n")
    .then(function (result) {
      var niz = [];
      result.records.forEach(function (record) {
        niz.push(record._fields[0]);
      });
      res.send(niz);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.put("/putLocationCountry/:id", function (req, res) {
  let id = req.params.id;
  let name = req.body.name;
  // console.log(award);
  console.log(id);
  console.log(name);
  session
    .run(
      "MATCH(n:LocationCountry) WHERE ID(n) = " +
        id +
        " SET n.name = '" +
        name +
        "' RETURN n"
    )
    .then(function (result) {
      res.status(200).send("updated");
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

app.delete("/deleteLocationCountry/:id", function (req, res) {
  let idPar = req.params.id;
  console.log(idPar);
  session
    .run(
      "MATCH (r:LocationCountry) WHERE ID(r) = " + idPar + " DETACH DELETE r"
    )
    .then(function (result) {
      res.status(200).send("deleted");
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).send("Not found");
    });
});

//Listen

// io.listen(server);
