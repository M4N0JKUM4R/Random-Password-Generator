// Get the required elements in the DOM

const generatePasswordBtn = document.querySelector("#generate-password")
const generatedPasswordField = document.querySelector(".generated-password .password-gen")
const passwordLengthEl = document.querySelector(`input[name="password-length"]`)
const copyEl = document.querySelector(".copy")
const copiedMessage = document.querySelector(".copied-message")
const saveEl = document.querySelector(".save")
const savedMessage = document.querySelector(".saved-message")
const upperCaseInput = document.querySelector("input[name='uppercase-input']")
const lowerCaseInput = document.querySelector("input[name='lowercase-input']")
const numberInput = document.querySelector("input[name='number-input']")
const specialCharInput = document.querySelector("input[name='symbol-input']")
const strength = document.querySelector(".password-strength-meter .strength")
const passwordLengthValueEl = document.querySelector(".password-length-value")
const checkboxes = document.querySelectorAll("input[type='checkbox'");
const passwordHistoryEl = document.querySelector(".password-history")
const passwordHistoryBtn = document.querySelector("#history-button")
const infoButton = document.querySelector(".info-history")
const notification = document.querySelector(".notification")
const deleteLSEl = document.querySelector(".delete-history")
const historyNumber = document.querySelector(".history-number")
const historyLoop = document.querySelector(".history-loop")
const passwordBox = document.querySelector(".password-box")

// Get sound inputs
const savedAudio = new Audio("sounds/saved.mp3")
const trashAudio = new Audio("sounds/trash.mp3")

// Initialize default values

let password = ""
let subpassword = []
let passwordHistory = JSON.parse(localStorage.getItem("passwordKey"));
passwordLengthValueEl.value = passwordLengthEl.value

const upperCaseLetter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const lowerCaseLetter = "abcdefghijklmnopqrstuvwxyz"
const numbers = "123456789"
const specialCharacters = " !#$%&()*+,-./:;<=>?@[\]^_{|}~"

// Initialize random selection of the above required values

function getUpperCase() {
    return upperCaseLetter[Math.floor(Math.random() * upperCaseLetter.length)]
}

function getLowerCase() {
    return lowerCaseLetter[Math.floor(Math.random() * lowerCaseLetter.length)]
}

function getnumbers() {
    return numbers[Math.floor(Math.random() * numbers.length)]
}

function getspecialCharacters() {
    return specialCharacters[Math.floor(Math.random() * specialCharacters.length)]
}

function updateLS() {
    localStorage.setItem("passwordKey", JSON.stringify(passwordHistory))
}

/* Thank StackOverflow: https://stackoverflow.com/a/11268104/4813913 for password strength script */

function scorePassword(pass) {
    var score = 0;
    if (!pass)
        return score;

    // award every unique letter until 5 repetitions
    var letters = {};
    for (var i = 0; i < pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    // bonus points for mixing it up
    var variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    }

    var variationCount = 0;
    for (var check in variations) {
        variationCount += (variations[check] == true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    return parseInt(score);
}

/* Assign classes based on scorePassword score */

const strengthIndicator = (password, el) => {

    // Could be a better method to add and remove class. Looking for a comment on this

    if (scorePassword(password) < 60) {
        el.classList.add("low")
        el.classList.remove("medium")
        el.classList.remove("high")
    } else if (scorePassword(password) >= 60 && scorePassword(password) < 80) {
        el.classList.remove("low")
        el.classList.add("medium")
        el.classList.remove("high")
    } else if (scorePassword(password) >= 80) {
        el.classList.remove("low")
        el.classList.remove("medium")
        el.classList.add("high")
    }
}

// Generate password, indicate strength and adjust the element height on clicking Generate password button

generatePasswordBtn.addEventListener("click", () => {
    password = ""
    generatePassword();
    strengthIndicator(password, strength);
    adjustContentDimensions();
    adjustPasswordHistoryDimension();
})

/* Form the complete array from the set of subarrays */

const generatePassword = () => {
    let passwordLength = passwordLengthEl.value;

    for (let i = 0; i < passwordLength; i++) {
        let randomNumber = generateMainArray()
        password += randomNumber;
    }

    generatedPasswordField.innerText = password

    document.querySelector(".column-container").classList.remove("translate-left")
    document.querySelector(".column-1").classList.remove("disappear")
    document.querySelector(".column-2").classList.replace("appear", "disappear")
}

/* Generate main array required for random selection of password */

const generateMainArray = () => {
    subpassword = []
    if (upperCaseInput.checked) {
        let randomUpperCase = getUpperCase()
        subpassword.push(randomUpperCase)
    }

    if (lowerCaseInput.checked) {
        let randomLowerCase = getLowerCase()
        subpassword.push(randomLowerCase)
    }

    if (numberInput.checked) {
        let randomNumber = getnumbers()
        subpassword.push(randomNumber)
    }

    if (specialCharInput.checked) {
        let randomSpecialChar = getspecialCharacters()
        subpassword.push(randomSpecialChar)
    }

    if (!upperCaseInput.checked && !lowerCaseInput.checked && !numberInput.checked && !specialCharInput.checked) {
        let randomUpperCase = getUpperCase()
        subpassword.push(randomUpperCase)

        let randomLowerCase = getLowerCase()
        subpassword.push(randomLowerCase)

        let randomNumber = getnumbers()
        subpassword.push(randomNumber)

        let randomSpecialChar = getspecialCharacters()
        subpassword.push(randomSpecialChar)
    }

    return subpassword[Math.floor(Math.random() * subpassword.length)]
}

// Call default functions everytime the page is loaded

window.onload = () => {
    generatePassword();
    strengthIndicator(password, strength);
    updateHistoryNumber()
}

// Copy password and show popup for 3 seconds

const CopyFn = (el, textCopied) => {
    el.addEventListener("click", () => {
        navigator.clipboard.writeText(generatedPasswordField.innerText);
        textCopied.classList.add("success")
        setTimeout(() => {
            textCopied.classList.remove("success")
        }, 3000)
    })
}

CopyFn(copyEl, copiedMessage)

// Show value on input slider change

passwordLengthEl.addEventListener("input", (e) => {
    passwordLengthValueEl.value = e.target.value
})

// Sync values of slider and number input

passwordLengthValueEl.addEventListener("input", (e) => {
    passwordLengthEl.value = e.target.value
    if (e.target.value < 0) {
        e.target.value = 0
    } else if (e.target.value > 255) {
        e.target.value = 255
    }
})

// For adjusting the height of the generated password box

const adjustContentDimensions = () => {
    generatedPasswordField.style.width = null;
    generatedPasswordField.style.height = null;
    generatedPasswordField.parentElement.style.height = (generatedPasswordField.clientHeight + 35) + "px";
}

const adjustPasswordHistoryDimension = () => {
    historyLoop.style.height = "60px";
    historyLoop.style.height = (generatedPasswordField.clientHeight + 285) + "px";
}

const storePassword = () => {
    let time = new Date().toLocaleString()
    if (passwordHistory == null) {
        passwordHistory = []
    }
    passwordHistory.push({
        "password": password,
        "time": time
    })
    updateLS()
}


saveEl.addEventListener("click", () => {
    storePassword()
    savedMessage.classList.add("success")
    setTimeout(() => {
        savedMessage.classList.remove("success")
    }, 3000)
    checkForHistoryActivity()
    updateHistoryNumber()
    playSound(savedAudio)
})

// Displaying password history

const displayHistory = () => {

    passwordHistoryEl.querySelector(".history-loop").innerHTML = ""
    if (passwordHistory == null || passwordHistory.length == 0) {
        disablePointerEvents([passwordHistoryBtn, generatePasswordBtn, infoButton, deleteLSEl])
        emptyState()
        notify(notificationText = "No Passwords stored in local history", 3000)
    } else {
        passwordHistory.forEach((password, index) => {
            let passwordEl = document.createElement("div");

            passwordEl.classList.add("password-container")
            passwordEl.innerHTML = `<div class="password">
                                        <div class="password-text"></div> 
                                        <div class="password-actions">
                                            <div class="password-copy">
                                                <div class="copied-message">Copied</div>
                                                <i class="fa fa-copy"></i>
                                            </div>
                                            <div class="password-time"> 
                                                <div class="time-stored">${password.time}</div>
                                                <i class="fa fa-clock" title="${password.time}"></i> 
                                            </div>
                                        </div>
                                    </div>
                                    <div class="password-strength-meter"><div class="strength"></div></div>`
            passwordEl.querySelector(".password-text").innerText = `${password.password}`
            passwordHistoryEl.querySelector(".history-loop").append(passwordEl)
            let strengthEl = passwordEl.querySelector(".strength")
            strengthIndicator(password.password, strengthEl)

            let passwordCopyEl = passwordEl.querySelector(".password-copy")
            passwordCopyEl.addEventListener("click", (el) => {
                passwordCopyEl.querySelector(".copied-message").classList.add("success")
                setTimeout(() => {
                    passwordCopyEl.querySelector(".copied-message").classList.remove("success")
                }, 3000)
            })

            let passwordTimeEl = passwordEl.querySelector(".password-time")
            passwordTimeEl.addEventListener("click", (el) => {
                passwordTimeEl.querySelector(".time-stored").classList.add("success")
                setTimeout(() => {
                    passwordTimeEl.querySelector(".time-stored").classList.remove("success")
                }, 3000)
            })
        })
    }
}

passwordHistoryBtn.addEventListener("click", () => {
    displayHistory()
    adjustContentDimensions()
    adjustPasswordHistoryDimension()
    document.querySelector(".column-container").classList.add("translate-left")
    document.querySelector(".column-1").classList.add("disappear")
    setTimeout(() => {
        document.querySelector(".column-2").classList.replace("disappear", "appear")
    }, 500)
    historyLoop.querySelectorAll(".password .password-copy").forEach(e => e.addEventListener("click", () => {
        navigator.clipboard.writeText(e.parentElement.parentElement.querySelector(".password-text").innerText);
    }))
})

// Delete all localHistory

deleteLSEl.addEventListener("click", () => {
    localStorage.clear()
    disablePointerEvents([infoButton,passwordHistoryBtn,generatePasswordBtn])
    let allPasswords = passwordHistoryEl.querySelectorAll(".password-container")

    allPasswords.forEach((e, index) => {

        let interval = setInterval(() => {
            e.classList.add("translate-right", "disappear")
            e.remove()
        }, 100)
        if (index === allPasswords.length) {
            clearInterval(interval)
        }
    })

    notify("Passwords were cleared from local database", 3000)

    passwordHistory = []
    emptyState()
    checkForHistoryActivity()
    updateHistoryNumber()
    playSound(trashAudio)
})

const notify = (notificationText, timer, close) => {
    notification.classList.add("trigger")
    notification.querySelector(".notification-message").innerHTML = notificationText
    let timeLeftEl = notification.querySelector(".time-left")
    let width = 100;

    async function removeNotify() {
        const width = await notifyPromise();
        notification.classList.remove("trigger")
    }

    const notifyPromise = () => {
        return new Promise((resolve, reject) => {
            let notifyInterval = setInterval(() => {
                width--
                timeLeftEl.style.width = `${width}%`;
                if (width == 0) {
                    clearInterval(notifyInterval)
                    resolve(width)
                }
            }, 50)
        })
    }

    removeNotify()
}

infoButton.addEventListener("click", async () => {
    notify(`All your passwords are stored in your browser's <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage">LocalStorage</a> and never sent to any server which you can verify using the source code: <a target="_blank" href="https://github.com/M4N0JKUM4R/Password-Generator">Github Repository</div>`, 5000)
    disablePointerEvents([passwordHistoryBtn, generatePasswordBtn, infoButton, deleteLSEl])
})


// History number 
const updateHistoryNumber = () => {
    if (passwordHistory) {
        historyNumber.innerHTML = `${passwordHistory.length}`
    }
}

const playSound = (soundEl) => {
    soundEl.currentTime = 0
    soundEl.play()
}

const checkForHistoryActivity = () => {
    if (passwordHistory === null || passwordHistory.length === 0) {
        deleteLSEl.classList.add("inactive")
    } else {
        deleteLSEl.classList.remove("inactive")
    }
}

checkForHistoryActivity()

const disablePointerEvents = (el) => {
    el.forEach(element => {
        element.style.pointerEvents = "none";
        setTimeout(() => {
            element.style.pointerEvents = "unset";
        }, 5000)
    })  
}

const emptyState = () => {
    passwordHistoryEl.querySelector(".history-loop").innerHTML = `<div class="empty-state">
                                                                        <img src="images/Trash Empty.png" alt="" class="empty">
                                                                    </div>`
}