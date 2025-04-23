import dotenv from 'dotenv'; // я не знаю для чого я це взагалі зробив, 
                             // але я просто хотів попробувати як це працює
import { WebSocketServer}  from 'ws';
dotenv.config();

const games = {};
const port = process.env.PORT || 8080;


function start() {
    const webSocketServer = new WebSocketServer({port: port});
    console.log(`WebSocket Server start on ${port} port`);
    

    webSocketServer.on("connection", (ws) => { 
        ws.on("message", (message) => { 
            const req = JSON.parse(message.toString());
            if (req.event == 'connect') {
                ws.nickname = req.payload.username;
                initGames(ws, req.payload.gameId)
            }

            broadcast(req);
        })
    })


    function initGames(ws, gameId) {
        if(!games[gameId]) { 
            games[gameId] = [ws];
        }

        if([gameId] && games[gameId]?.length < 2) { 
            games[gameId] = [...games[gameId], ws]
        }
        

        if(games[gameId] && games[gameId].length === 2) {
            games[gameId] = games[gameId].filter(wsc => wsc.nickname !== ws.nickname);
            games[gameId] = [...games[gameId], ws];

        }
    }



    function broadcast(params) {
        let res; 

        const {username, gameId} = params.payload;
        games[gameId].forEach( (client) => {
            switch (params.event) {
                case "connect":
                    res = {
                        type: "connectToPlay",
                        payload: { 
                            canStart: games[gameId].length > 1, username
                        }
                    };
                    break;
                case "ready":
                    res = {type: 'readyToPlay', payload: { canStart: games[gameId].length > 1, username }};
                    break;
                
                case "shoot":
                    res = { type: "afterShootByMe", payload: params.payload }
                    break;    
                case "checkshoot": 
                    res = {type: "isPerfectHit", payload: params.payload}
                    break
                default:
                    res = {type: "logout", payload: params.payload};
                    break;
            }

            client.send(JSON.stringify(res));
        });
    }
}


start();