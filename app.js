const express = require("express");
const sqlite3 = require('better-sqlite3')
const db = sqlite3('coockie-clicker.db', {verbose:console.log})
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


app.get("/brukere", (request, response) => {
    let stmt = db.prepare("SELECT * FROM User").all()
    
    response.send(stmt)
})


app.get("/acount", (request, response) => {
    if (request.session.logedIn == true) {
        const sql = db.prepare("SELECT * FROM User WHERE name=(?)")
        const username = "Stian"
  
        const User = sql.get(username)

        response.render("acount.hbs", {
            title: "Acount",
            User: User
        })
    }
    if (request.session.logedIn == false) {
        response.render("http://localhost:3000/login%20and%20register.html")
    }
})


app.post("/addUser", (request, response) => {
    const sql = db.prepare('INSERT INTO User (name,password,savedata) VALUES (?,?,?)')
    const hashedPassword = bcrypt.hashSync(request.body.password, 10)
    const info = sql.run(request.body.name, hashedPassword, request.body.savedata)
    console.log("Amount changes done: " + info.changes)
    console.log("lastInsertRowID: " + info.lastInsertRowID)
    request.session.logedIn = true
    response.redirect("/")
})


app.post("/login", (request, response) => {
    const sql = db.prepare("SELECT * FROM User WHERE name=(?)")

    const username = request.body.name
    const password = request.body.password
  
    const userRow = sql.get(username)
    const isCorrect  = bcrypt.compareSync(password, userRow); 
    if (isCorrect == true){
    console.log("hei hei")
    }

    if (isCorrect == true){
        request.session.logedIn = true
        response.redirect("/")
    }
    else {
        request.session.logedIn = false
        response.redirect("back")
    }
})


app.get("/logout", (request, response) => {
    request.session.logedIn = false
})


app.get('/delete', (request, response) => {
    const sql = db.prepare('DELETE FROM User WHERE id=(?)')
    const info = sql.run(request.query.id)
    response.redirect("back")
})


app.post("/savegame", (request, response) => {
    console.log(request.body);
    response.json({ message: "Data received" });
})


app.listen("3000", () => {
    console.log("UP!")
})