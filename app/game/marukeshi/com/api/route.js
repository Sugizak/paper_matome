import fs from 'fs'

export async function POST(request) {

    const d = fs.readFileSync('app/game/marukeshi/com/api/com.txt', 'utf-8')
    const datasheet = d.split("\n").map((x) => parseInt(x))

    const data = await request.json();
    const arr = data.arr;

    const Erases = Erases_init();
    const next_arrs_num = []
    for (let i = 0; i < Erases.length; i++) {
        if (CanErase(arr, Erases[i])) {
            const next_arr_num = arr_to_num(erase(arr, Erases[i]));
            next_arrs_num.push(next_arr_num);
        }
    }
    const next_arr = num_to_arr(select(datasheet, next_arrs_num));
    return Response.json({ arr: next_arr });
}

function Erases_init() {
    const Erases = []
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let erase = Array(4).fill(0).map(() => Array(4).fill(0));
            for (let k = 0; k < 4 - j; k++) {
                erase[i][j + k] = 1;
                Erases.push(copy(erase));
            }
            erase = Array(4).fill(0).map(() => Array(4).fill(0));
            for (let k = 0; k < 4 - i; k++) {
                erase[i + k][j] = 1;
                if (k > 0) {
                    Erases.push(copy(erase));
                }
            }
        }
    }
    return Erases;
}

function copy(arr) {
    const new_arr = Array(4).fill(0).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            new_arr[i][j] = arr[i][j];
        }
    }
    return new_arr;
}
function arr_to_num(arr) {
    let num = 0;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            num += 2 ** (4 * i + j) * arr[i][j];
        }
    }
    return num;
}

function num_to_arr(num) {
    const arr = Array(4).fill(0).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            arr[i][j] = num % 2;
            num = Math.floor(num / 2);
        }
    }
    return arr;
}
function CanErase(arr, erase) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (arr[i][j] === 0 && erase[i][j] === 1) {
                return false;
            }
        }
    }
    return true;
}

function erase(arr, erase) {
    const new_arr = Array(4).fill(0).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            new_arr[i][j] = arr[i][j] - erase[i][j];
        }
    }
    return new_arr;
}

function select(datasheet, next_arrs_num) {
    // return randomChoice(next_arrs_num)
    const arrs = limit_select(datasheet, next_arrs_num);
    return randomChoice(arrs);
}

function limit_select(datasheet, nums) {
    const arrs = []

    for (let num of nums) {
        if (datasheet[num] === 1) {
            arrs.push(num);
        }
    }
    if (arrs.length === 0) {
        return nums;
    }
    return arrs;
}

function randomChoice(arr) {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
}