const express = require("express");
const sqlite3 = require('better-sqlite3')
const db = sqlite3('coockie-clicker.db', {verbose:console.log})
const path = require("path")
const session = require('express-session')

const app = express()

app.use(express.static(path.join(__dirname, "/public")))
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "Keep it secret",
    resave: false,
    saveUninitialized: false
}));



app.get("/brukere", (request, response) => {
    let stmt = db.prepare("SELECT * FROM User").all()
    
    response.send(stmt)
})

app.get("/test", (request, response) => {
    if (request.session.logedIn !== true) {
        response.redirect("/login")
        return
    }
    
    response.send("du er logget in")
})


app.post("/addUser", (request, response) => {
    const sql = db.prepare('INSERT INTO User (name,password,savedata) VALUES (?,?,?)')
    
    const info = sql.run(request.body.name, request.body.password, request.body.savedata)
    console.log("Amount changes done: " + info.changes)
    console.log("lastInsertRowID: " + info.lastInsertRowID)
    
  
    response.redirect("/")
})

app.post("/login", (request, response) => {
    const sql = db.prepare("SELECT * FROM User WHERE name=(?)")
    const results = sql.get(request.body.name)
    if (request.body.password == results.password){
        request.session.logedIn = true
        response.redirect("/")
    }
    else {
        console.log("shit")
        request.session.logedIn = false
        response.redirect("back")
    }
  
    
})


app.listen("3000", () => {
    console.log("UP!")
})