"use client"
import { Component } from "react";
import { ArrowLeft } from 'lucide-react'; // ArrowLeftアイコンをインポート
import Link from "next/link";
export default class Reversi_local extends Component {
    constructor(props) {
        super(props);
        this.size = 8
        let arr = []
        for (let i = 0; i < this.size; i++) { arr.push(Array(8).fill(0)) }
        this.state = {
            turn: 1,
            board: arr,
            isPass: false,
            isFinished: false,
            winner: 1
        }
        arr[3][4] = 1;
        arr[4][3] = 1;
        arr[3][3] = -1;
        arr[4][4] = -1;
        this.Board = this.Board.bind(this)
    }
    canPlace(i, j, turn = this.state.turn) {
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                if (this.canPlaceDir(i, j, di, dj, turn)) { return true }
            }
        }
        return false;
    }
    canPlaceDir(i, j, di, dj, turn = this.state.turn) {
        if (di == 0 && dj == 0) {
            return false;
        }
        if (this.state.board[i][j] != 0) {
            return false;
        }
        for (let n = 1; n < this.size; n++) {
            try {
                const color = this.state.board[i + di * n][j + dj * n]
                if (color == turn) {
                    if (n == 1) {
                        break;
                    } else {
                        return true;
                    }
                } else if (color == turn * -1) {
                    continue
                } else {
                    break;
                }
            } catch (e) {
                break;
            }
        }
        return false;
    }
    put(i, j) {
        const new_board = this.state.board
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                if (this.canPlaceDir(i, j, di, dj)) {
                    for (let n = 1; n < this.size; n++) {
                        if (this.state.board[i + di * n][j + dj * n] == this.state.turn) {
                            break;
                        } else {
                            new_board[i + di * n][j + dj * n] = this.state.turn
                        }
                    }
                }
            }
        }
        new_board[i][j] = this.state.turn;
        this.setState({
            board: new_board,
            turn: this.state.turn * -1
        }, () => {
            if (this.isPass()) {
                if (this.isPass(this.state.turn * -1)) {
                    this.finish()
                } else {
                    console.log("NG")
                    this.setState({
                        pass: true,
                        turn: this.state.turn * -1
                    })
                    setTimeout(() => {
                        this.setState({
                            pass: false,
                        })
                    }, 1000)
                }
            } else {
                console.log("OK")
            }
        })
    }
    Cell(n, i, j) {
        const Color = () => {
            const color = this.state.turn == 1 ? "black" : "white"
            switch (n) {
                case 1:
                    return (
                        <div className="w-8 h-8 bg-black border-black rounded-full"></div>
                    )
                case -1:
                    return (
                        <div className="w-8 h-8 bg-white border-white rounded-full"></div>
                    )
                default:
                    if (this.canPlace(i, j)) {
                        return (
                            <div className="w-10 h-10 flex justify-center items-center" onClick={() => { this.put(i, j) }}>
                                <div className={` w-1 h-1 bg-${color} border-${color} rounded-full `}></div>
                            </div>
                        )
                    } else {
                        return null
                    }
            }
        }
        return (
            <div className="w-10 h-10 flex justify-center items-center">
                {Color()}
            </div>
        )
    }
    Board() {
        return (
            <table className="inline-block bg-green-600 border border-collapse border-black m-5">
                <tbody>
                    {this.state.board.map((arr1, i) => {
                        return (
                            <tr key={i}>
                                {
                                    arr1.map((n, j) => {
                                        return (
                                            <td key={i + j} className="border border-black">{this.Cell(n, i, j)}</td>
                                        )
                                    })
                                }
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        )
    }
    Announce() {
        if (this.state.isFinished) {
            switch (this.state.winner) {
                case 1:
                    return (<div className="text-5xl text-red-500 mt-4 font-bold">黒の勝ち!!</div>)
                case -1:
                    return (<div className="text-5xl text-red-500 mt-4 font-bold">白の勝ち!!</div>)
                default:
                    return (<div className="text-5xl text-red-500 mt-4 font-bold">引き分け!!</div>)
            }
        } else {
            return (
                // <div className="text-4xl mt-4 ">{this.state.turn == 1 ? "黒" : "白"}の番です</div>
                <h1 className="text-5xl md:text-6xl font-extrabold mb-8 text-center">
                    {/* 現在のプレイヤーのターンを表示 */}
                    <span className="text-black-700">
                        {this.state.turn == 1 ? "黒" : "白"}の番です
                    </span>
                </h1>
            )
        }
    }
    isPass(turn = this.state.turn) {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.canPlace(i, j, turn)) {
                    return false;
                }
            }
        }
        return true;
    }
    PassPouOut() {
        if (this.state.isPass) {
            return (
                <>
                    <span className="absolute w-screen h-screen bg-white bg-opacity-45"></span>
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl w-80 h-20 font-bold bg-opacity-80 bg-slate-500 flex justify-center items-center">
                        置ける場所がないのでパスします
                    </span>
                </>
            )
        } else {
            return (
                <></>
            )
        }
    }
    finish() {
        let tmp = []
        this.state.board.forEach((a) => { tmp = tmp.concat(a) })
        console.log(tmp, typeof (tmp))
        const BlackCount = tmp.filter(value => value == 1).length;
        const WhiteCount = tmp.filter(value => value == -1).length;
        let winner = 0
        if (BlackCount > WhiteCount) {
            winner = 1;
        } else if (BlackCount < WhiteCount) {
            winner = -1
        } else {
            winner = 0
        }
        console.log(BlackCount, WhiteCount)
        console.log(BlackCount)
        this.setState({
            isFinished: true,
            winner: winner
        })
    }
    render() {
        return (
            <div className="relative bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                {this.Announce()}
                {this.PassPouOut()}
                <this.Board />
                <div className="flex space-x-4">
                    <button
                        className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                        onClick={() => { window.location.href = './'; }} // ページ遷移
                    >
                        <ArrowLeft className="w-6 h-6 mr-2" />
                        ゲーム選択に戻る
                    </button>
                    {this.state.isFinished ? (
                        <button
                            className="inline-flex items-center bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-full px-6 py-3 text-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-400"
                            onClick={(e) => { e.preventDefault(); location.reload(); }}
                        >
                            もう一度
                        </button>
                    ) : null}
                </div>
            </div>
        )
    }
}