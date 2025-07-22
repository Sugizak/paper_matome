import cors from "cors";
import { Server } from "socket.io";
const corsMiddleware = cors();

export default function handler(req,res) {
    console.log("API Server")
    if (req.method !== 'POST') {
        console.log("405")
        res.status(405).end();
        return;
    }
    if (res.socket.server.io) {
        res.send('already-set-up');
        return;
    }
    // Socket.IOのサーバーを作成する
    const io =new Server(res.socket.server, {
        addTrailingSlash: false,
    });
    
    //namespaceを読み込む
    require("./reversi/friend")(io)
    require("./reversi/online")(io)
    require("./marukeshi/friend")(io)
    require("./marukeshi/online")(io)
    
    // CORS対策を一応、有効にした上でサーバーを設定する
    corsMiddleware(req, res, () => {
        res.socket.server.io = io;
        res.end();
    });
}