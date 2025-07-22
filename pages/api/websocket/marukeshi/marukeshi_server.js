export default class game_server{
    constructor(){
        this.arr=Array(4).fill(1).map(()=>Array(4).fill(1));
        this.turn=1;
        this.winner=0;
        this.finished=false;
    }
    get(){
        return{
            arr:this.arr,
            turn:this.turn,
            winner:this.winner,
            finished:this.finished
        }
    }
    Canplace(arr1,arr2){
        if(arr1[0]===arr2[0]){
            const min=Math.min(arr1[1],arr2[1]);
            const max=Math.max(arr1[1],arr2[1]);
            for(let i=min;i<max+1;i++){
                if(this.arr[arr1[0]][i]===0){
                    return false;
                }
            }
            return true;
        }else if(arr1[1]===arr2[1]){
            const min=Math.min(arr1[0],arr2[0]);
            const max=Math.max(arr1[0],arr2[0]);
            for(let i=min;i<max+1;i++){
                if(this.arr[i][arr1[1]]===0){
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    execute([arr1,arr2]){
        if(this.Canplace(arr1,arr2)){
            if(arr1[0]===arr2[0]){
                const min=Math.min(arr1[1],arr2[1]);
                const max=Math.max(arr1[1],arr2[1]);
                for(let i=min;i<max+1;i++){
                    this.arr[arr1[0]][i]=0;
                }
            }else if(arr1[1]===arr2[1]){
                const min=Math.min(arr1[0],arr2[0]);
                const max=Math.max(arr1[0],arr2[0]);
                for(let i=min;i<max+1;i++){
                    this.arr[i][arr1[1]]=0;
                }
            }
            this.turn*=-1;
            if(this.judge()){
                this.finished=true;
                this.winner=this.turn;
            }
        }
        return [0,"alert","hello"];
    }

    judge(){
        for(let i=0;i<4;i++){
            for(let j=0;j<4;j++){
                if(this.arr[i][j]!=0){
                    return false;
                }
            }
        }
        return true;
    }
}