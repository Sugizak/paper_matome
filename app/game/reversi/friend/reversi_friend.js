"use client";
import { useEffect, useState } from "react";
// LinkコンポーネントはNext.js固有のため、window.location.hrefに置き換えます
// import Link from "next/link";
import { io } from "socket.io-client";
import Board from "../components/board"; // Boardコンポーネントは外部からインポートされることを維持
import { ArrowLeft } from 'lucide-react'; // ArrowLeftアイコンをインポート

export default function Reversi_friend() {
    const [socket] = useState(io("/reversi/friend", { autoConnect: false }));
    const [phase, set_phase] = useState(0);
    const [room, set_room] = useState("");
    const [alert, set_alert] = useState({ visible: false, messages: "" });
    const [board, set_board] = useState(Array(8).fill(0).map(() => Array(8).fill(0)));
    const [turn, set_turn] = useState(1);
    const [myturn, set_myturn] = useState(0);
    const [winner, set_winner] = useState(0);

    useEffect(() => {
        fetch("/api/websocket/server", { method: "POST" })
            .then(() => {
                socket.connect();
            })
            .catch((error) => console.error("Fetch error:", error));

        // コンポーネントアンマウント時にソケットを切断
        return () => {
            socket.disconnect();
        };
    }, [socket]); // socketを依存配列に追加

    socket.on("change_phase", (phase_num) => {
        set_phase(phase_num);
    })
    socket.on("alert", (message) => {
        set_alert({ visible: true, messages: message });
        setTimeout(() => { set_alert({ visible: false, messages: "" }) }, 5000);
    })

    socket.on("set_myturn", (my_turn) => {
        set_myturn(my_turn);
    })

    socket.on("update", (data) => {
        console.log("きた")
        console.log(data);
        console.log(typeof (data));
        const json = JSON.parse(data);
        console.log(json.board);
        set_board(json.board);
        set_turn(json.turn);
    })
    socket.on("finish", (winner) => {
        set_winner(winner);
        set_phase(3);
    })

    socket.on("lost-connection", () => {
        set_alert({ visible: true, messages: "接続が切れました。10秒後に最初のメニューに戻ります" });
        setTimeout(() => {
            set_alert({ visible: false, messages: "" })
            set_phase(0);
        }, 10000)
    })

    // place関数は元のロジックを維持
    function place(i, j) {
        if (turn != myturn) {
            return;
        }
        if (socket) { // socketがnullでないことを確認
            socket.emit("execute", [i, j]);
        } else {
            console.error("Socket is not initialized.");
        }
    }

    switch (phase) {
        case 0: // 部屋名入力フェーズ
            return (
                <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                    {alert.visible ? <div className="text-red-500 text-lg mb-4 animate-pulse">{alert.messages}</div> : null}
                    <h2 className="text-3xl font-bold mb-4">部屋名を入力してください</h2>
                    <input
                        type="text"
                        value={room}
                        onKeyDown={(e) => { if (e.key === "Enter") { socket.emit("join-room-request", room) } }}
                        onChange={(e) => { set_room(e.target.value) }}
                        className="border border-gray-300 rounded-lg p-3 m-2 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="例: myroom123"
                    />
                    <div className="flex space-x-4 mt-4">
                        <button
                            className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                            onClick={() => { window.location.href = './'; }}
                        >
                            <ArrowLeft className="w-6 h-6 mr-2" />
                            戻る
                        </button>
                        <button
                            onClick={() => { socket.emit("join-room-request", room); }}
                            className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full px-6 py-3 text-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-400"
                        >
                            部屋に入る
                        </button>
                    </div>
                </div>
            );
        case 1: // 対戦相手待機フェーズ
            return (
                <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                    {alert.visible ? <div className="text-red-500 text-lg mb-4 animate-pulse">{alert.messages}</div> : null}
                    <div className="animate-spin h-16 w-16 border-8 border-blue-500 rounded-full border-t-transparent mb-6"></div>
                    <h2 className="text-3xl font-bold mb-2">対戦相手を探しています。</h2>
                    <p className="text-xl text-gray-600 mb-6">しばらくお待ちください...</p>
                    <h2 className="text-2xl font-semibold mb-8">部屋名: <span className="text-blue-600">{room}</span></h2>
                    <button
                        onClick={() => { socket.emit("leave-room", room); set_phase(0) }}
                        className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                    >
                        部屋を出る
                    </button>
                </div>
            );
        case 2: // ゲームプレイフェーズ
            return (
                <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-8 text-center text-gray-900">
                        {Turn(turn, myturn)}
                    </h2>
                    {alert.visible ? <div className="text-red-500 text-lg mb-4 animate-pulse">{alert.messages}</div> : null}
                    <Board board={board} callback={place} turn={turn}></Board>
                    <div className="mt-8">
                        <button
                            className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                            onClick={() => { socket.emit("leave-room", room); set_phase(0) }}
                        >
                            <ArrowLeft className="w-6 h-6 mr-2" />
                            部屋を出る
                        </button>
                    </div>
                </div>
            );
        case 3: // ゲーム結果フェーズ
            return (
                <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                    <div className="flex flex-col justify-center items-center">
                        <h2 className="text-5xl md:text-6xl font-extrabold mb-4 text-center text-gray-900">ゲーム終了!!</h2>
                        {Winner(winner, myturn)}
                        <Board board={board} turn={turn}></Board> {/* 勝敗表示時もボードを表示 */}
                        <div className="flex space-x-4 mt-8">
                            <button
                                className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                                onClick={() => { socket.emit("leave-room", room); set_phase(0) }}
                            >
                                <ArrowLeft className="w-6 h-6 mr-2" />
                                部屋を出る
                            </button>
                            <button
                                className="inline-flex items-center bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-full px-6 py-3 text-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-400"
                                onClick={(e) => { e.preventDefault(); window.location.reload(); }} // location.reload()を使用
                            >
                                もう一度
                            </button>
                        </div>
                    </div>
                </div>
            );
        default:
            return null;
    }
}

// Winner関数: 勝敗メッセージをレンダリング (UIのみ変更)
function Winner(winner, myturn) {
    console.log(winner);
    let message = "";
    let textColor = "";
    switch (winner) {
        case myturn:
            message = "あなたの勝ち!!";
            textColor = "text-red-600";
            break;
        case -myturn:
            message = "あなたの負け!!";
            textColor = "text-blue-600";
            break;
        default:
            message = "引き分け!!";
            textColor = "text-yellow-500";
            break;
    }
    return (<h2 className={`text-6xl md:text-7xl font-extrabold m-3 drop-shadow-lg ${textColor}`}>{message}</h2>);
}

// Turn関数: 現在のターンメッセージをレンダリング (UIのみ変更)
function Turn(turn, myturn) {
    // ターン表示の色をtext-gray-900に変更
    if (turn === myturn) {
        return `あなたの番です (${myturn === 1 ? "黒" : "白"})`;
    } else if (turn === -myturn) {
        return `相手の番です`;
    }
    return "";
}
