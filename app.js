// Importerer nødvendige biblioteker og oppretter en express-app
const express = require("express"); 
const sqlite3 = require('better-sqlite3') // Bedre versjon av SQLite
const db = sqlite3('coockie-clicker.db') // Oppretter en database-tilkobling
const path = require('path') // Hjelpebibliotek for å håndtere filstier
const hbs = require('hbs') // Hjelpebibliotek for å generere HTML-templates
const session = require('express-session'); // Bibliotek for å håndtere sesjoner
const bcrypt = require('bcrypt'); // Bibliotek for å hashe passord
const app = express(); // Oppretter en ny express-app

// Setter opp middleware for statiske filer og form-data
const publicDirectoryPath = path.join(__dirname, "/public")
app.use(express.static(publicDirectoryPath))
app.use(express.urlencoded({ extended: true }));
app.use("/savegame",express.json());

// Setter opp templating med Handlebars
const viewPath = path.join(__dirname, "/views")
app.set("view engine", hbs)
app.set('views',viewPath)

// Setter opp sesjoner
app.use(session({
    secret: "Keep it secret", // hemmelig nøkkel brukt for å signere sesjonsdata
    resave: false, // krever ikke å lagre sesjonsdata på hver request
    saveUninitialized: false // krever ikke å opprette en ny sesjon for hver request
}));

// Initialiserer variabler for bruker og bruker-ID
let Usernow = ""
let UserIdNow = ""

/*
app.get("/brukere", (request, response) => {
    let stmt = db.prepare("SELECT * FROM User").all()
    
    response.send(stmt)
})
*/

// Rute for brukersiden
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
        response.redirect("http://localhost:3000/login_and_register.html")
    }
})

// Rute for å legge til ny bruker
app.post("/addUser", (request, response) => {
    const username = request.body.name;
  
    // Sjekk om brukeren allerede eksisterer i databasen
    const sql = db.prepare("SELECT * FROM User WHERE name=(?)");
    const userRow = sql.get(username);
  
    if (userRow == undefined) {
      // Hvis brukeren ikke finnes, legg den til i databasen
      const sql = db.prepare("INSERT INTO User (name,password,savedata) VALUES (?,?,?)");
      const hashedPassword = bcrypt.hashSync(request.body.password, 10); // Hasjer passordet før det lagres
      const info = sql.run(request.body.name, hashedPassword, request.body.savedata);
  
      Usernow = username;
  
      // Hent ID fra ny bruker
      const tbl = db.prepare("SELECT * FROM User WHERE name=(?)");
      const User = tbl.get(username);
      UserIdNow = User.id;
  
      // Sett logget inn status for brukeren til true
      request.session.logedIn = true;
      response.redirect("/");
    }
  });
  
  // Rute for å logge inn en bruker
  app.post("/login", (request, response) => {
    const sql = db.prepare("SELECT * FROM User WHERE name=(?)");
  
    const username = request.body.name;
    const password = request.body.password;
  
    const userRow = sql.get(username);
    const isCorrect = bcrypt.compareSync(password, userRow.password); // Sjekk om passordet er korrekt
  
    if (isCorrect == true) {
      // Sett brukeren som logget inn og lagre brukerinfo i sessions
      Usernow = request.body.name;
      UserIdNow = userRow.id;
      request.session.logedIn = true;
      response.redirect("/");
    } else {
      // Hvis innloggingen ikke er korrekt, sett logget inn status til false og redirect tilbake til forrige side
      request.session.logedIn = false;
      response.redirect("back");
    }
  });
  
  // Rute for å logge ut en bruker
  app.get("/logout", (request, response) => {
    Usernow = "";
    UserIdNow = "";
    request.session.logedIn = false;
    response.redirect("http://localhost:3000/login_and_register.html");
  });


app.get('/delete', (request, response) => {
    const tbl_User_Pokal = db.prepare('DELETE FROM User_Pokal WHERE User_id=(?)')
    tbl_User_Pokal.run(request.query.id)
    const sql = db.prepare('DELETE FROM User WHERE id=(?)')
    sql.run(request.query.id)
    response.redirect("http://localhost:3000/login_and_register.html")
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