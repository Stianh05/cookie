const express = require("express");
const sqlite3 = require('better-sqlite3')
const db = sqlite3('coockie-clicker.db')
const path = require('path')
const hbs = require('hbs')
const session = require('express-session');
const { request } = require("http");
const app = express();
const bcrypt = require('bcrypt');

const publicDirectoryPath = path.join(__dirname, "/public")
app.use(express.static(publicDirectoryPath))
app.use(express.urlencoded({ extended: true }));
app.use("/savegame",express.json());

const viewPath = path.join(__dirname, "/views")
app.set("view engine", hbs)
app.set('views',viewPath)


app.use(session({
    secret: "Keep it secret",
    resave: false,
    saveUninitialized: false
}));


let Usernow = ""
let UserIdNow = ""

/*
app.get("/brukere", (request, response) => {
    let stmt = db.prepare("SELECT * FROM User").all()
    
    response.send(stmt)
})
*/


app.get("/acount", (request, response) => {
    if (request.session.logedIn == true) {
        const sql = db.prepare("SELECT * FROM User WHERE id=(?)")
        const User = sql.get(UserIdNow)

        const run = db.prepare("SELECT Pokal.type FROM User_Pokal INNER JOIN User ON User_Pokal.User_id = User.id INNER JOIN Pokal ON User_Pokal.Pokal_id = Pokal.id WHERE User_Pokal.User_id=(?);")
        const dinPokal = run.all(UserIdNow)

        response.render("acount.hbs", {
            title: "Acount",
            User: User,
            dinPokal: dinPokal
        })
    }
    else {
        response.redirect("http://localhost:3000/login%20and%20register.html")
    }
})


app.post("/addUser", (request, response) => {
    const username = request.body.name

    const sql = db.prepare("SELECT * FROM User WHERE name=(?)")
    const userRow = sql.get(username)
    
    if (userRow == undefined){ //bruker finnes ikke, lager ny
        const sql = db.prepare('INSERT INTO User (name,password,savedata) VALUES (?,?,?)')
        const hashedPassword = bcrypt.hashSync(request.body.password, 10)
        const info = sql.run(request.body.name, hashedPassword, request.body.savedata)

        Usernow = username
        
        const tbl = db.prepare("SELECT * FROM User WHERE name=(?)")//hent id fra ny bruker
        const User = tbl.get(username)
        UserIdNow = User.id

        request.session.logedIn = true
        response.redirect("/")
    }
})


app.post("/login", (request, response) => {
    const sql = db.prepare("SELECT * FROM User WHERE name=(?)")

    const username = request.body.name
    const password = request.body.password
  
    const userRow = sql.get(username)
    const isCorrect  = bcrypt.compareSync(password, userRow.password);
   
  
    if (isCorrect == true){
    Usernow = request.body.name
    UserIdNow = userRow.id
    request.session.logedIn = true
    response.redirect("http://localhost:3000")
    }
    else {
        request.session.logedIn = false
        response.redirect("back")
    }
})


app.get("/logout", (request, response) => {
    Usernow = ""
    UserIdNow = ""
    request.session.logedIn = false
    response.redirect("http://localhost:3000/login%20and%20register.html")
})


app.get('/delete', (request, response) => {
    const tbl_User_Pokal = db.prepare('DELETE FROM User_Pokal WHERE User_id=(?)')
    tbl_User_Pokal.run(request.query.id)
    const sql = db.prepare('DELETE FROM User WHERE id=(?)')
    sql.run(request.query.id)
    response.redirect("http://localhost:3000/login%20and%20register.html")
})


app.get('/pokal', (request, response) => {
    const selectedPokal = request.query.pokal;//Henter valgte type pokal Bronce etc som id

    const sql = db.prepare("SELECT * FROM User WHERE name=(?)")
    const Userid = sql.get(Usernow)

    const INSPokal = db.prepare('INSERT INTO User_Pokal (Pokal_id,User_id) VALUES (?,?)')
    INSPokal.run(selectedPokal,Userid.id)

   
    
    response.redirect("back")
})


app.get("/pokalSite", (request, response) => {
    const sql = db.prepare('SELECT Pokal.type, User.name FROM User_Pokal INNER JOIN User ON User_Pokal.User_id = User.id INNER JOIN Pokal ON User_Pokal.Pokal_id = Pokal.id WHERE User_Pokal.Pokal_id =(?);')

    const Bronce = sql.all(1)
    const Silver = sql.all(2)
    const Gold = sql.all(4)
    const Plat = sql.all(5)
    const Diamond = sql.all(3)
    
    
    response.render("pokal.hbs", {
        title: "Pokal",
        Bronce: Bronce,
        Silver: Silver,
        Gold: Gold,
        Plat: Plat,
        Diamond: Diamond
    })
})



app.post("/nameUpdate", (request, response) => {
    const newName = request.body.name
    const sql = db.prepare('UPDATE User SET name=(?) WHERE id=(?)')
    sql.run(newName,UserIdNow)

    Usernow = newName
    response.redirect("back")
})


/*
app.post("/savegame", (request, response) => {
    response.json({ message: "Data received" });
})
*/

app.listen("3000", () => {
    console.log("UP!")
})