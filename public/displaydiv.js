let login = document.getElementById("login")
let register = document.getElementById("register")

let loginshow = document.getElementById("loginshow")
loginshow.addEventListener("click", () => {
    login.style.display = "block"
    register.style.display = "none"
})

let registershow = document.getElementById("registershow")

registershow.addEventListener("click", () => {
    register.style.display = "block"
    login.style.display = "none"
    console.log("hei")
})
