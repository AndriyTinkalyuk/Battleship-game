
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

let idRoom;

// EVENTS

usernameInput.addEventListener("blur", () => { 
    usernameMessage.textContent = '';
    let username = usernameInput.value.trim();

    usernameInput.classList.remove("error"); 


    if (username.length < 3) {
        usernameMessage.textContent = 'Username must be more than 3 characters';
        usernameInput.classList.add("error");
        
    } else if(!isValidUsername(username)) {
        usernameMessage.textContent = '❌ Username must contain the characters a-z, 0-9';
        usernameInput.classList.add("error"); 
    } else {
        localStorage.username = username;
    }
})


idInput.addEventListener("blur", () => {
    idMessage.textContent = '';
    idInput.classList.remove("error");
    let idRoom = idInput.value.trim();

    if(isValidUUID(idRoom)) {
    localStorage.idRoom = idRoom;
    return true;   
    }

    idMessage.textContent = '❌ Invalid Room ID. Please check format.';
    idInput.classList.add("error");
})

generateIdButton.addEventListener("click", (e) => { 
    e.preventDefault();
    idRoom = crypto.randomUUID();
    idBody.textContent = idRoom;
    localStorage.idRoom = idRoom;
})

startGameButton.addEventListener("click", (e) => { 
    e.preventDefault();
    if(localStorage.username && localStorage.idRoom) {
        window.location.href = `game.html?roomId=${localStorage.idRoom}`;
    }
})

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
    