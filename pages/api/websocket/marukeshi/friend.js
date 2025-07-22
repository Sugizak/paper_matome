import game_server from "./marukeshi_server";
import socket_friend from "../game_components/friend";
module.exports=(io)=>{
    socket_friend(io,"/marukeshi/friend",game_server);
}