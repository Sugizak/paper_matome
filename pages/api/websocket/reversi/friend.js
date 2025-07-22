import game_server from "./reversi_server";
import socket_friend from "../game_components/friend";
module.exports=(io)=>{
    socket_friend(io,"/reversi/friend",game_server);
}