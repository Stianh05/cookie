//variabler
let Score = document.querySelector("#score")
let Scoreps = document.querySelector("#scoreps")
let Clicked = document.querySelector("#btn")
Clicked.addEventListener("click",bob)
let Upc1 = document.querySelector("#upc1")
Upc1.addEventListener("click",upc1)
let Fisker = document.querySelector("#fisker")
Fisker.addEventListener("click",fiskerr)
let Fiskerupg = document.querySelector("#fiskerupg")
Fiskerupg.addEventListener("click",fiskerrupg)
let upc1c = document.querySelector("#opgft")
let fiskerrc = document.querySelector("#kfisk")
let fiskerupgc =document.querySelector("#opgfr")




async function hentBrukere() {
    let dbresult = await fetch("/brukere")
    let resultat = await dbresult.json()
    
    let savedata = resultat[0].savedata

    let saven = {
        noe: 1,
        noeannet: 2
    }

    let savetekst = JSON.stringify(saven)
    let saveobjekt = JSON.parse(savetekst)
    console.log(savetekst)
    console.log(typeof savetekst)

    console.log(saveobjekt)
    console.log(typeof saveobjekt)

}


save = { 
    perclick : 1,
    Balance : 0,
    upc1c : 10,
    spc : 0,
    fiskerpt :1 ,
    fiskerantall: 0,
    fiskerrc: 100,
    fiskerupgc : 100
}

save2 = { 
    perclick : 2,
    Balance : 500,
    upc1c : 10,
    spc : 0,
    fiskerpt :1 ,
    fiskerantall: 0,
    fiskerrc: 100,
    fiskerupgc : 100
}

let perclick = save.perclick
let Balance = save.Balance
upc1c = save.upc1c
opgft.innerHTML = upc1c

let spc = save.spc
let fiskerpt = save.fiskerpt
let fiskerantall = save.fiskerantall
fiskerrc = save.fiskerrc
kfisk.innerHTML = fiskerrc

fiskerupgc = save.fiskerupgc
opgfr.innerHTML = fiskerupgc

function bob(){
    Balance = Balance + perclick
    score.innerHTML = Balance
}

function upc1(){
    if (Balance >= upc1c){
        Balance -= upc1c
        perclick = 2
        upc1c= 3
        opgft.innerHTML = upc1c
    }
    else{
        alert("Du har ikke nok fisk")
    }
}
function fiskerr(){
if(Balance >= fiskerrc){
    fiskerantall++
    Balance -= fiskerrc
    fiskerrc = 2
    spc = fiskerantall= fiskerpt
    kfisk.innerHTML = fiskerrc

}else{
    alert("Du har ikke nok fisk")
}
}

function fiskerrupg(){
    if (Balance >= fiskerupgc){
       Balance -= fiskerupgc
       fiskerupgc = 5

       fiskerpt= 2

       opgfr.innerHTML = fiskerupgc
       spc = fiskerantall *= fiskerpt

    }
    else{
        alert("Do har ikke nok fisk")
    }
}

function Ark(){
    Balance = spc + Balance
    Score.innerHTML = Balance
    Scoreps.innerHTML = spc

} setInterval(Ark,1000)