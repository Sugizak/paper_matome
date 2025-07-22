export default function socket_friend(io,namespace,game_server){
    const AllRooms=[];
    io.of(namespace).on("connection",(socket)=>{
        const clientId = socket.id;
        console.log(`A client connected to ${namespace},id:${clientId}`);

        socket.on("leave-room",()=>{
        const left_room=socket.rooms;
        left_room.forEach((room)=>{
            if(room!=socket.id){
            socket.leave(room);
            }
        })
        })

        socket.on("join-room-request", (room_name) => {
            console.log(`socket ${clientId} has requested to join room ${room_name}`);
            const room = io.of(namespace).adapter.rooms.get(room_name);
            const numClients = room ? room.size : 0;
            if(numClients<2){
                console.log("join-room-request")
                socket.join(room_name);
                socket.emit("change_phase",1);
                // 2人目が入ったらゲームを開始する
                if(numClients==1){
                console.log("2nd player has joined")
                io.of(namespace).to(room_name).emit("change_phase",2);
                const players=Array.from(room);
                const tmp_num=Math.floor(Math.random()*2);
                //ゲーム情報の初期化
                AllRooms[room_name]={
                    game:new game_server()
                }
                AllRooms[room_name][players[tmp_num]]=1;
                AllRooms[room_name][players[1-tmp_num]]=-1;

                players.forEach((player)=>{
                    io.of(namespace).to(player).emit("set_myturn",AllRooms[room_name][player]);
                });

                io.of(namespace).to(room_name).emit("alert","対戦相手が見つかりました");
                const json=JSON.stringify(AllRooms[room_name].game.get());
                io.of(namespace).to(room_name).emit("update",json);
                }else{
                io.of(namespace).to(room_name).emit("change_phase",1);
                }
            }else{
                socket.emit("alert","部屋が満員です");
            }
        });

        socket.on("execute",(data)=>{
            let room_name;
            socket.rooms.forEach((name)=>{
                room_name = name==socket.id? room_name:name;
            });
            room_name = room_name==undefined ? socket.id : room_name;
            const room=AllRooms[room_name];

            if(room[socket.id]==room.game.turn){
                const [target,mode,emit_data]=room.game.execute(data);
                if(target==1){
                    socket.emit(mode,emit_data);
                }else if(target==2){
                    io.of(namespace).to(room_name).emit(mode,emit_data);
                }
                
                const json=JSON.stringify(room.game.get());
                io.of(namespace).to(room_name).emit("update",json);
            }else{
                socket.emit("alert","あなたのターンではありません");
            }
        });

        socket.on("join-room", (room, id) => {
        console.log(`socket ${id} has joined room ${room}`);
        });

        // クライアントが切断した場合の処理
        socket.on('disconnecting', () => {
        let room_name;
        socket.rooms.forEach((room)=>{
        if(room!=socket.id){
            room_name=room;
        }
        });
        if(room_name==undefined){
        room_name=socket.id
        }
        io.of(namespace).to(room_name).emit("lost-connection");
        io.of(namespace).in(room_name).socketsLeave(room_name);
        delete AllRooms[room_name];
        console.log('A client disconnecting.');
        });
    
        socket.on("disconnect",()=>{
        console.log('A client disconnected.');
        });
    })
}