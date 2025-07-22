import game_server from "./reversi_server";
import socket_online from "../game_components/online";
module.exports=(io)=>{
    socket_online(io,"/reversi/online",game_server);
}