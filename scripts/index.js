import { popup } from './modules/popup.js'

const tabsLink = [...document.querySelectorAll(".game-lobby-tablink")];
const activeTab = document.querySelector(".tab-active");
const tabsBodies = [...document.querySelectorAll(".game-lobby-tabcontent")];

const generateIdButton = document.getElementById("create-id");
const startGameButton = document.getElementById("start-game");
const idBody = document.querySelector(".game-lobby-id");

const idMessage = document.getElementById("id-message");
const usernameMessage = document.getElementById("username-message");
const idAbsence = document.getElementById("id-absence");

const usernameInput = document.getElementById("username");
const idInput = document.getElementById("gameId");

const instructionLink = document.getElementById("instruction-link");
const instructionPopup = document.getElementById("instruction-popup");
const instructionPopupButton = instructionPopup.querySelector("button");

const countShipsInput = document.getElementById("count-ships");
const countShipsMessage = document.getElementById("ships-message");

let gameId;
let username;
let shipsToPlace; 

// EVENTS

popup(instructionLink, instructionPopup);

instructionPopupButton.addEventListener("click", (e) => {
    e.preventDefault();
    instructionPopup.classList.remove("active");
    document.body.classList.remove("lock");
})

usernameInput.addEventListener("blur", () => { 
    usernameMessage.textContent = '';
     username = usernameInput.value.trim();

    usernameInput.classList.remove("error"); 


    if (username.length < 3) {
        usernameMessage.textContent = 'Username must be more than 3 characters';
        usernameInput.classList.add("error");
        
    } else if(!isValidUsername(username)) {
        usernameMessage.textContent = '❌ Username must contain the characters a-z, 0-9';
        usernameInput.classList.add("error"); 
    } 
})


idInput.addEventListener("blur", () => {
    idMessage.textContent = '';
    idInput.classList.remove("error");
    let gameIdfromInput = idInput.value.trim();

    if(!isValidUUID(gameIdfromInput)) {
    idMessage.textContent = '❌ Invalid Room ID. Please check format.';
    idInput.classList.add("error");
    return false;  
    }

    gameId = gameIdfromInput;
})

generateIdButton.addEventListener("click", (e) => { 
    e.preventDefault();
    gameId = crypto.randomUUID();
    idBody.textContent = gameId;
    localStorage.gameId = gameId;
})

startGameButton.addEventListener("click", (e) => { 
    e.preventDefault();

    username = usernameInput.value.trim();
    let gameIdfromInput = idInput.value.trim();

    usernameMessage.textContent = '';
    idMessage.textContent = '';
    idAbsence.textContent = '';
    countShipsMessage.textContent = '';

    let valid = true;
    let isCreateGame = document.getElementById("create-game-tab").style.display === 'flex';

    if (username.length < 3) {
        usernameMessage.textContent = '❌ Username must be more than 3 characters';
        usernameInput.classList.add("error");
        valid = false;
    } else if(!isValidUsername(username)) {
        usernameMessage.textContent = '❌ Username must contain the characters a-z, 0-9';
        usernameInput.classList.add("error");
        valid = false;
    } else {
        localStorage.username = username;
        usernameInput.classList.remove("error");
    }

    if (!isValidUUID(gameId)) {
        idMessage.textContent = '❌ Invalid Room ID. Please check format.';
        idInput.classList.add("error");
        valid = false;
    } else {
        localStorage.gameId = gameId;
        idInput.classList.remove("error");
    }

    if (isCreateGame) {
        let countShips = Number(countShipsInput.value.trim())
    if (countShips < 0  || countShips > 15 || countShips === 0) {
        countShipsMessage.textContent = '❌ Invalid value. Please enter value from 1 to 15';
        countShipsInput.classList.add("error");
        valid = false;
    } else {
        localStorage.shipsToPlace = countShips;
        countShipsInput.classList.remove("error");
    } 
    } else {
        localStorage.removeItem(shipsToPlace);
    }

    if (valid) {
        window.location.href =  `./game.html?gameId=${gameId}`;
    } else {
        idAbsence.textContent = '❌ For start game you need a valid username and room ID!';
    }
});


tabsAnimation(tabsLink, activeTab);

tabs(tabsLink, tabsBodies);

// FUNC


function isValidUsername(username) {
    const usernameRegex = /^[a-z0-9]{3,}$/i;
    return usernameRegex.test(username);
}

function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }


  function tabsAnimation(tabs, activeTab) {
    tabs.forEach( (tab, index) => {
        tab.addEventListener("click", (e) => { 
            e.preventDefault();
            let move = (100 / tabs.length) * index;
            activeTab.style.width = `${tab.getBoundingClientRect().width + 10}px`;
            activeTab.style.left = `${move}%`;
        })
    })   
    }
    
    
    function tabs(tabsLink, tabBodies) {
        tabBodies.forEach((tabBody) => tabBody.style.display = 'none');
        tabBodies[0].style.display = 'flex';
        tabsLink.forEach((tabLink) => { 
            tabLink.addEventListener("click", (e) => {
                e.preventDefault();
                tabBodies.forEach((tabBody) => tabBody.style.display = 'none');
                document.getElementById(`${tabLink.dataset.content}`).style.display = 'flex';
            })
        })
    }
    