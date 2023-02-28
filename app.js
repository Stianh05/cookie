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

/*
app.get("/brukere", (request, response) => {
    let stmt = db.prepare("SELECT * FROM User").all()
    
    response.send(stmt)
})
*/


app.get("/acount", (request, response) => {
    if (request.session.logedIn == true) {
        const sql = db.prepare("SELECT * FROM User WHERE name=(?)")
  
        const User = sql.get(Usernow)

        response.render("acount.hbs", {
            title: "Acount",
            User: User
        })
    }
    else {
        response.redirect("http://localhost:3000/login%20and%20register.html")
    }
})


app.post("/addUser", (request, response) => {
    const sql = db.prepare('INSERT INTO User (name,password,savedata) VALUES (?,?,?)')
    const hashedPassword = bcrypt.hashSync(request.body.password, 10)
    const info = sql.run(request.body.name, hashedPassword, request.body.savedata)

    Usernow = request.body.name

    request.session.logedIn = true
    response.redirect("/")
})


app.post("/login", (request, response) => {
    const sql = db.prepare("SELECT * FROM User WHERE name=(?)")

    const username = request.body.name
    const password = request.body.password
  
    const userRow = sql.get(username)
    const isCorrect  = bcrypt.compareSync(password, userRow.password);
    
    if (isCorrect == true){
    Usernow = request.body.name
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
    const selectedPokal = request.query.pokal;

    const sql = db.prepare("SELECT * FROM User WHERE name=(?)")
    const Userid = sql.get(Usernow)
    
    const tbl_User_Pokal = db.prepare("SELECT Pokal_id FROM User_Pokal WHERE User_id=(?)")
    const Pokal_id = tbl_User_Pokal.get(Userid.id)

    if (Pokal_id == undefined){ //Har ikke pokal fra før
        const sql = db.prepare('INSERT INTO User_Pokal (Pokal_id,User_id) VALUES (?,?)')
        const info = sql.run(selectedPokal,Userid.id)
    }
    else{
        const sql = db.prepare('UPDATE User_Pokal SET Pokal_id=(?) WHERE User_id=(?)')
        const info = sql.run(selectedPokal,Userid.id)
    }
    
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


/*
app.post("/savegame", (request, response) => {
    response.json({ message: "Data received" });
})
*/


app.listen("3000", () => {
    console.log("UP!")
})