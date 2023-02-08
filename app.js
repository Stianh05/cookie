const express = require("express");
const sqlite3 = require('better-sqlite3')
const db = sqlite3('coockie-clicker.db', {verbose:console.log})
const path = require("path")

const app = express()

app.use(express.static(path.join(__dirname, "/public")))
app.use(express.urlencoded({ extended: true }));


app.get("/brukere", (request, response) => {
    let stmt = db.prepare("SELECT * FROM User").all()
    
    response.send(stmt)
})
app.post("/sendInn", (request, response) => {
    const sql = db.prepare('INSERT INTO User (name,password,savedata) VALUES (?,?,?)')
     
    const info = sql.run(request.body.name, request.body.password, request.body.savedata)
    console.log("Amount changes done: " + info.changes)
    console.log("lastInsertRowID: " + info.lastInsertRowID)
    
  
    response.redirect("back")
})


app.listen("3000", () => {
    console.log("UP!")
})