"use client";
import { useEffect, useState } from "react";
// LinkコンポーネントはNext.js固有のため、window.location.hrefに置き換えます
// import Link from "next/link";
import { io } from "socket.io-client";
import Board from "../components/board"; // Boardコンポーネントは外部からインポートされることを維持
import { ArrowLeft } from 'lucide-react'; // ArrowLeftアイコンをインポート

export default function Reversi_online() {
    const [socket] = useState(io("/reversi/online", { autoConnect: false }));
    const [phase, set_phase] = useState(0);
    const [alert, set_alert] = useState({ visible: false, messages: "" });
    // ボードの初期化ロジックはユーザーの提供コードを維持
    const [board, set_board] = useState(Array(8).fill(0).map(() => Array(8).fill(0)));
    // 初期配置をユーザーの提供コードのまま維持 (constructor相当の処理)
    useEffect(() => {
        const initial = Array(8).fill(0).map(() => Array(8).fill(0));
        initial[3][4] = 1; // 黒
        initial[4][3] = 1; // 黒
        initial[3][3] = -1; // 白
        initial[4][4] = -1; // 白
        set_board(initial);
    }, []); // 空の依存配列で一度だけ実行

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
        set_phase(2); // フェーズを2に設定 (ゲーム終了)
    })

    socket.on("lost-connection", () => {
        set_alert({ visible: true, messages: "接続が切れました。10秒後に最初のメニューに戻ります" });
        setTimeout(() => {
            set_alert({ visible: false, messages: "" })
            window.location.href = './'; // 最初のメニューに戻る
        }, 10000)
    })

    // place関数は元のロジックを維持
    function place(i, j) {
        if (turn != myturn) {
            return;
        }
        // socketがnullでないことを確認 (元のコードに追加されたnullチェックを維持)
        if (socket) {
            socket.emit("execute", [i, j]);
        } else {
            console.error("Socket is not initialized.");
        }
    }

    switch (phase) {
        case 0: // 対戦相手待機フェーズ (初期フェーズ)
            return (
                <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                    {alert.visible ? <div className="text-red-500 text-lg mb-4 animate-pulse">{alert.messages}</div> : null}
                    <div className="animate-spin h-16 w-16 border-8 border-blue-500 rounded-full border-t-transparent mb-6"></div>
                    <h2 className="text-3xl font-bold mb-2">対戦相手を探しています。</h2>
                    <p className="text-xl text-gray-600 mb-6">しばらくお待ちください...</p>
                    <button
                        className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                        onClick={() => { window.location.href = './'; }}
                    >
                        <ArrowLeft className="w-6 h-6 mr-2" />
                        戻る
                    </button>
                </div>
            );
        case 1: // ゲームプレイフェーズ
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
                            onClick={() => { window.location.href = './'; }} // 部屋を出るボタン
                        >
                            <ArrowLeft className="w-6 h-6 mr-2" />
                            部屋を出る
                        </button>
                    </div>
                </div>
            );
        case 2: // ゲーム結果フェーズ
            return (
                <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                    <div className="flex flex-col justify-center items-center">
                        <h2 className="text-5xl md:text-6xl font-extrabold mb-4 text-center text-gray-900">ゲーム終了!!</h2>
                        {Winner(winner, myturn)}
                        <Board board={board} turn={turn}></Board> {/* 勝敗表示時もボードを表示 */}
                        <div className="flex space-x-4 mt-8">
                            <button
                                className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                                onClick={() => { window.location.href = './'; }} // 部屋を出るボタン
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
