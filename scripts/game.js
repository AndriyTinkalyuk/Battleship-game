import { popup, showPopup }  from "./modules/popup.js"
import {  Board } from "./classes/Board.js";

const params = new URLSearchParams(window.location.search);
const gameId = params.get("gameId"); // localStorage.gameId
const myUsername = localStorage.username;

const gameIdElement = document.getElementById("room-id");
const myBoardElement = document.getElementById("my-board");
const myNameElement = document.getElementById("my-username");

const instructionLink = document.getElementById("instruction-link");
const instructionPopup = document.getElementById("instruction-popup");
const instructionPopupButton = instructionPopup.querySelector("button");

const endGamePopup = document.getElementById("endGame-popup");
const endGameText = endGamePopup.querySelector(".popup-text")
const endGamePopupButton = document.getElementById("endGame-popup-button");

const readyButton = document.getElementById("start-game-button");


const myBoard = new Board();
const enemyBoard = new Board();

myBoard.initCells();
enemyBoard.initCells();

const enemyBoardElement = document.getElementById("enemy-board");
const enemyNameElement = document.getElementById("enemy-username");

let shipsToPlace = localStorage.shipsToPlace;
let shipsToDestroy =  localStorage.shipsToPlace;
let placingShips = true;
let canShoot = false;

const ws = new WebSocket("ws://localhost:8080");

gameIdElement.textContent = `Room id: ${gameId}`;
myNameElement.textContent = myUsername;

popup(instructionLink, instructionPopup);

renderBoard(myBoard, myBoardElement, false);
renderBoard(enemyBoard, enemyBoardElement, true);

instructionPopupButton.addEventListener("click", (e) => {
    e.preventDefault();
    instructionPopup.classList.remove("active");
    document.body.classList.remove("lock");
})


myBoardElement.addEventListener("click", (e) => {addMark(e); renderBoard(myBoard, myBoardElement, false);});
enemyBoardElement.addEventListener("click", (e) => {addMark(e), renderBoard(enemyBoard, enemyBoardElement, true)});

readyButton.addEventListener("click", () => {
    ready();
    readyButton.style.display = 'none';
})

endGamePopupButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.replace('./index.html');
})


ws.onopen = () => {

    console.log("New cliend was joined.");

    const payload = {
        username: myUsername,
        gameId,
    }

    if (localStorage.shipsToPlace !== undefined) {
        payload.countShips = Number(localStorage.shipsToPlace);
    }
    
   ws.send(JSON.stringify({
    event: "connect",
    payload: payload,
   }))
    
}


ws.onmessage = function(response) {
    console.log(response);
    
    const {type, payload} = JSON.parse(response.data);
    const {username, x, y, canStart, success, countShips} = payload;
    switch (type) {
        case "connectToPlay":
            if (success === false) {
                // window.location.href = '/';
                console.warn("No success from server..");
            }
            shipsToPlace = countShips;
            shipsToDestroy = countShips;
            console.log(shipsToPlace);
            break;
        case "readyToPlay":
            if(payload.username === myUsername && canStart) {
                canShoot = true;
                enemyBoardElement.classList.add("shoot");
            }
            if(username != myUsername) {   
                enemyNameElement.textContent = username;
               }
            break;
        case "afterShootByMe": 
        console.log("afterShoot", username !== myUsername);
        if (username !== myUsername) {
            const isPerfectHit = myBoard.getCells(x, y).mark?.name === "ship";
            ChangeBoardAfterShoot(myBoard, myBoardElement, false, x, y, isPerfectHit);
            ws.send(JSON.stringify({event: "checkshoot", payload: { ...payload, isPerfectHit}}))
            if (!isPerfectHit) {
                canShoot = true;
                enemyBoardElement.classList.add("shoot");
                
            }
        }
            break
        case "isPerfectHit": 
        console.log("received isPerfectHit", payload);
        if (username === myUsername) {
        ChangeBoardAfterShoot(enemyBoard,enemyBoardElement,true,x,y, payload.isPerfectHit);
        canShoot =  payload.isPerfectHit;
        if (shipsToDestroy === 0) {
            GameEnd()
           }
        }
            break;
        case "playerWin":
        console.log(`Game end. win ${username}`);
        shipsToDestroy = -1;
        showPopup(endGamePopup);
        if(username === myUsername) {
            endGameText.textContent = `You win! ☺️`;
        } else {
            endGameText.textContent = `You lose! ☹️`;
        }
        break
        default:
            break;
    }
}

//FUNC

function renderBoard(board, container, isEnemy = false,) {
    container.innerHTML = ''; 


    board.cells.forEach(row => {
        row.forEach(cell => {
            const cellDiv = document.createElement("div");
            cellDiv.classList.add("cell");
            cellDiv.dataset.x = cell.x;
            cellDiv.dataset.y = cell.y;

            if(cell.mark?.name) {
            cellDiv.textContent = cell.mark.logo;
            cellDiv.style.color = cell.mark.color;
            }
        

  

            container.appendChild(cellDiv);
        });

        container.classList.remove("shoot");
    });
}


function addMark(e) {
    if(e.target.classList.contains("cell")) {
        let x =  Number(e.target.dataset.x);
        let y = Number(e.target.dataset.y);
       if(placingShips && myBoardElement.contains(e.target)) {
        if (!myBoard.getCells(x,y).mark?.ship && shipsToPlace > 0) {
            myBoard.addShip(x,y);
            shipsToPlace--;   
        } else {
         alert("All ships are deployed! Press ready!")   
         }
        console.log( myBoard.getCells(x,y));
       } 
       if(canShoot && enemyBoardElement.contains(e.target) && !enemyBoard.getCells(x ,y).mark && shipsToDestroy > 0) {
        shoot(x,y);
       } 
        }
}

function ChangeBoardAfterShoot(board,boardElement,isEnemy, x,y, isPerfectHit) {
    if(isPerfectHit){
        board.addDamage(x,y)
        shipsToDestroy--;
    } else{
        board.addMiss(x,y);
    } 
    renderBoard(board, boardElement, isEnemy);
}


function shoot(x,y) {
    ws.send(JSON.stringify({event: "shoot", payload:{ username: myUsername, x,y, gameId}}));
    console.log(canShoot);
    
}

function ready() {
    ws.send(JSON.stringify({event: "ready", payload: {username : myUsername, gameId}}))
    placingShips = false;
    canShoot = true;
}


function GameEnd() {
    ws.send(JSON.stringify({event: "endGame", payload: {username : myUsername, gameId}}))
}