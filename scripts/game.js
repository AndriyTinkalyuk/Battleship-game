
import {  Board } from "./classes/Board.js";

const params = new URLSearchParams(window.location.search);
const gameId = params.get("gameId"); // localStorage.gameId
const myUsername = localStorage.username;

const gameIdElement = document.getElementById("room-id");
const myBoardElement = document.getElementById("my-board");
const myNameElement = document.getElementById("my-username");

const readyButton = document.getElementById("start-game-button");


const myBoard = new Board();
const enemyBoard = new Board();

myBoard.initCells();
enemyBoard.initCells();

const enemyBoardElement = document.getElementById("enemy-board");
const enemyNameElement = document.getElementById("enemy-username");

let shipsToPlace = 1; 
let placingShips = true;
let canShoot = false;


gameIdElement.textContent = `Room id: ${gameId}`;
myNameElement.textContent = myUsername;






const ws = new WebSocket("ws://localhost:5500");

ws.onopen = () => {

    console.log("New cliend was joined.");
    
   ws.send(JSON.stringify({
    event: "connect",
    payload: {
        username: myUsername,
        gameId,
    }
   }))
    
}


ws.onmessage = function(response) {
    console.log(response);
    
    const {type, payload} = JSON.parse(response.data);
    const {username, x, y, canStart, success} = payload;
    switch (type) {
        case "connectToPlay":
            if (success === false) {
                // window.location.href = '/';
                console.warn("No success from server..");
            }
             
            break;
        case "readyToPlay":
            if(payload.username === myUsername && canStart) {
                canShoot = true;
            }
            if(username != myUsername) {   
                enemyNameElement.textContent = username;
               }
            break;
        case "afterShootByMe": 
        console.log("afterShoot", username !== myUsername);
        if (username !== myUsername) {
            const isPerfectHit = myBoard.cells[y][x].mark?.name === "ship";
            ChangeBoardAfterShoot(myBoard, myBoardElement, false, x, y, payload.isPerfectHit);
            ws.send(JSON.stringify({event: "checkshoot", payload: { ...payload, isPerfectHit}}))
            if (!isPerfectHit) {
                canShoot = true;
            }
        }
            break
        case "isPerfectHit": 
        console.log("received isPerfectHit", payload);
        if (username === myUsername) {
        ChangeBoardAfterShoot(enemyBoard,enemyBoardElement,true,x,y, payload.isPerfectHit);
        canShoot =  payload.isPerfectHit;
        }
            break;

        
        default:
            break;
    }
}


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
    });
}



renderBoard(myBoard, myBoardElement, false);
renderBoard(enemyBoard, enemyBoardElement, true);

myBoardElement.addEventListener("click", (e) => {addMark(e); renderBoard(myBoard, myBoardElement, false);});
enemyBoardElement.addEventListener("click", (e) => {addMark(e), renderBoard(enemyBoard, enemyBoardElement, true)});

readyButton.addEventListener("click", () => {
    ready();
    readyButton.style.display = 'none';
})

function addMark(e) {
    if(e.target.classList.contains("cell")) {
        let x =  Number(e.target.dataset.x);
        let y = Number(e.target.dataset.y);
       if(placingShips && myBoardElement.contains(e.target)) {
        if (!myBoard.getCells(x,y).mark?.ship) {
            myBoard.addShip(x,y);   
        }
        console.log( myBoard.getCells(x,y));
       } else if(canShoot && enemyBoardElement.contains(e.target)) {
        shoot(x,y);
       }
        }
}

function ChangeBoardAfterShoot(board,boardElement,isEnemy, x,y, isPerfectHit) {
    isPerfectHit ? board.addDamage(x,y) : board.addMiss(x,y);
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