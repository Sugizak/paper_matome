import game_server from "./marukeshi_server";
import socket_online from "../game_components/online";
module.exports=(io)=>{
    socket_online(io,"/marukeshi/online",game_server);
}