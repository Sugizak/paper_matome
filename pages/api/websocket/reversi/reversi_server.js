export default class game_server{
    constructor(){
        this.size=8;
        const arr=Array(this.size).fill(0).map(()=>Array(this.size).fill(0));
        arr[3][4]=1;
        arr[4][3]=1;
        arr[3][3]=-1;
        arr[4][4]=-1;
        this.board=arr;
        this.turn=1;
        this.winner=0;
    }
    get(){
        return{
            board:this.board,
            turn:this.turn,
        }
    }
    can_place(i,j,turn=this.turn){
        if(this.board[i][j]!=0){
            return false;
        }
        let flag=false;
        const directions=[[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
        for(let direction of directions){
            const [di,dj]=direction;
            if(this.can_place_dir(i,j,di,dj,turn)){
                return true;
            }
        }
        return false;
    }
    can_place_dir(i,j,di,dj,turn=this.turn){
        for(let n=1;n<this.size;n++){
            const ni=i+n*di;
            const nj=j+n*dj;
            if(ni<0||nj<0||ni>=this.size||nj>=this.size){
                break;
            }
            if(this.board[ni][nj]==0){
                break;
            }
            if(this.board[ni][nj]==turn){
                if(n>1){
                    return true;
                }
                break;
            }
        }
        return false;
    }
    execute([i,j]){
        if(this.can_place(i,j)){
            this.place(i,j);
            const n=this.pass_check();
            if(n==1){
                return [2,"alert","パスしました"];
            }else if(n==2){
                this.get_result();
                return [2,"finish",this.winner];
            }
        }
        return [0,"alert",null];
    }
    place(i,j){
        const new_board=this.board;
        const directions=[[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
        directions.forEach((direction)=>{
            const [di,dj]=direction;
            if(this.can_place_dir(i,j,di,dj)){
                for(let n=1;n<this.size;n++){
                    const ni=i+n*di;
                    const nj=j+n*dj;
                    if(this.board[ni][nj]==this.turn){
                        break;
                    }else{
                        new_board[ni][nj]=this.turn;
                    }
                }
            }
        });
        new_board[i][j]=this.turn;
        this.board=new_board;
        this.turn*=-1;
    }    
    pass_check(){
        //何も無ければ0,パスで1,終了で2
        if(this.isPass()){
            this.turn*=-1;
            if(this.isPass(this.turn*-1)){
                return 2;
            }else{
                return 1;
            }
        }
        return 0;
    }
    isPass(turn=this.turn){
        for(let i=0;i<this.size;i++){
            for(let j=0;j<this.size;j++){
                if(this.can_place(i,j)){
                    return false;
                }
            }
        }
        return true;
    }
    get_result(){
        let black=0;
        let white=0;
        for(let i=0;i<this.size;i++){
            for(let j=0;j<this.size;j++){
                if(this.board[i][j]==1){
                    black++;
                }else if(this.board[i][j]==-1){
                    white++;
                }
            }
        }
        if(black>white){
            this.winner=1;
        }else if(black<white){
            this.winner=-1;
        }else{
            this.winner=0;
        }
        return;
    }
}