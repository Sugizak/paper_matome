"use client";
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
// LinkコンポーネントはNext.js固有のため、window.location.hrefに置き換えます
// import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'; // ArrowLeftアイコンをインポート

export default function Marukeshi_online() { // コンポーネント名をMarukeshi_onlineに合わせる
    const [socket] = useState(io("/marukeshi/online", { autoConnect: false }));
    const [phase, set_phase] = useState(0);
    const [alert, set_alert] = useState({ visible: false, messages: "" });
    const [arr, set_arr] = useState(Array(4).fill(1).map(() => Array(4).fill(1)));
    const [turn, set_turn] = useState(1);
    const [myturn, set_myturn] = useState(0);
    const [winner, set_winner] = useState(0);
    const [Selected, set_Selected] = useState(null);

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
    }, [socket]);

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
        const json = JSON.parse(data);
        set_arr(json.arr);
        set_turn(json.turn);
        set_winner(json.winner);
        if (json.finished) {
            set_phase(2); // ゲーム終了フェーズ
        }
    })

    socket.on("lost-connection", () => {
        set_alert({ visible: true, messages: "接続が切れました。10秒後に最初のメニューに戻ります" });
        setTimeout(() => {
            set_alert({ visible: false, messages: "" })
            set_phase(0);
        }, 10000)
    })

    // フェーズごとのUIレンダリング
    switch (phase) {
        case 0: // 対戦相手を探しています (初期フェーズ)
            return (
                <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                    {alert.visible ? <div className="text-red-500 text-lg mb-4 animate-pulse">{alert.messages}</div> : null}
                    <div className="animate-spin h-16 w-16 border-8 border-blue-500 rounded-full border-t-transparent mb-6"></div>
                    <h2 className="text-3xl font-bold mb-2">対戦相手を探しています。</h2>
                    <p className="text-xl text-gray-600 mb-6">しばらくお待ちください...</p>
                    <button
                        className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                        onClick={() => { window.location.href = './'; }} // Linkをwindow.location.hrefに置き換え
                    >
                        <ArrowLeft className="w-6 h-6 mr-2" />
                        戻る
                    </button>
                </div>
            )
        case 1: // ゲームプレイフェーズ
            return (
                <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-8 text-center">
                        {/* ターン表示の色をtext-gray-900に変更 */}
                        <span className="text-gray-900">
                            {Turn(turn, myturn)}
                        </span>
                    </h2>
                    {alert.visible ? <div className="text-red-500 text-lg mb-4 animate-pulse">{alert.messages}</div> : null}
                    {/* Boardコンポーネントの呼び出し方を元の形に合わせる */}
                    {Board(arr, (i, j) => { place(i, j) })}
                </div>
            )
        case 2: // ゲーム結果フェーズ
            return (
                <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                    <div className="flex flex-col justify-center items-center">
                        {/* Winnerコンポーネントの呼び出し方を元の形に合わせる */}
                        {Winner({ winner: winner, myturn: myturn })}
                    </div>
                    <div className="flex space-x-4 mt-8">
                        <button
                            className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                            onClick={() => { window.location.href = './'; }} // Linkをwindow.location.hrefに置き換え
                        >
                            <ArrowLeft className="w-6 h-6 mr-2" />
                            やめる
                        </button>
                        <button
                            className="inline-flex items-center bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-full px-6 py-3 text-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-400"
                            onClick={(e) => { e.preventDefault(); location.reload(); }}
                        >
                            もう一度
                        </button>
                    </div>
                </div>
            )
        default:
            return null; // 未定義のフェーズの場合
    }

    // 以下、ロジック関数は元のコードから変更なしで維持
    function place(i, j) {
        if (turn != myturn) {
            return;
        }
        if (Selected == null) {
            const tmp = structuredClone(arr); // structuredCloneを維持
            tmp[i][j] = -1;
            set_Selected([i, j]);
            set_arr(tmp);
        } else {
            console.log("place?");
            const tmp = structuredClone(arr); // structuredCloneを維持
            tmp[Selected[0]][Selected[1]] = 1;
            set_arr(tmp);
            if (CanPlace(arr, Selected, [i, j])) {
                console.log("Selected:", Selected, "Target:", [i, j]);
                socket.emit("execute", [Selected, [i, j]]);
            }
            set_Selected(null);
        }
    }
}

// CanPlace関数はMarukeshi_friendコンポーネントの外に定義 (元のコードの構造を維持)
function CanPlace(arr, arr1, arr2) {
    if (arr1[0] === arr2[0]) {
        const min = Math.min(arr1[1], arr2[1]);
        const max = Math.max(arr1[1], arr2[1]);
        for (let i = min; i < max + 1; i++) {
            if (arr[arr1[0]][i] === 0) {
                return false;
            }
        }
        return true;
    } else if (arr1[1] === arr2[1]) {
        const min = Math.min(arr1[0], arr2[0]);
        const max = Math.max(arr1[0], arr2[0]);
        for (let i = min; i < max + 1; i++) {
            if (arr[i][arr1[1]] === 0) {
                return false;
            }
        }
        return true;
    }
    return false;
}

// Winnerコンポーネントの定義 (元のコードの形式に合わせる)
function Winner(props) {
    console.log(props.winner);
    // 勝敗表示のテキストサイズと色をモダンなスタイルに調整
    if (props.winner === props.myturn) {
        return (<h2 className="text-red-600 text-6xl md:text-7xl font-extrabold m-3 drop-shadow-lg">あなたの勝ち!!</h2>)
    }
    return (<h2 className="text-blue-700 text-6xl md:text-7xl font-extrabold m-3 drop-shadow-lg">あなたの負け!!</h2>)
}

// Turn関数はMarukeshi_friendコンポーネントの外に定義 (元のコードの構造を維持)
function Turn(turn, myturn) {
    switch (turn) {
        case myturn:
            return `あなたの番です`;
        case -myturn:
            return "相手の番です";
        default:
            return "";
    }
}

// Boardコンポーネントの定義 (元のコードの形式に合わせる)
function Board(arr, callback) {
    return (
        <table className="inline-block bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl p-6 mb-8 border-separate border-spacing-2 shadow-lg shadow-blue-200/50">
            <tbody>
                {arr.map((arr1, i) => {
                    return (
                        <tr key={i}>
                            {
                                arr1.map((n, j) => {
                                    return (
                                        <td key={`${i}-${j}`} className="p-1"> {/* keyをユニークに、paddingを追加 */}
                                            <div onClick={() => { if (callback != null) { callback(i, j) } }}
                                                className="w-16 h-16 flex justify-center items-center cursor-pointer transition-all duration-200 hover:scale-105 rounded-full"
                                            >
                                                {Cell(n)}
                                            </div>
                                        </td>
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

// Cellコンポーネントの定義 (元のコードの形式に合わせる)
function Cell(n) {
    let border = null
    switch (n) {
        case 0:
            //丸なし
            return (
                <div className="w-12 h-12 flex justify-center items-center"></div>
            )
        case -1:
            //選択中の丸 (元の border-red-300 を維持)
            border = "border-red-300"
            break
        default:
            //消す前の丸 (元の border-blue-300 を維持)
            border = "border-blue-300"
            break;
    }
    return (
        <button className="w-16 h-16 flex justify-center items-center p-0 m-0">
            {/* hover:border-red-300 も元のコード通り維持 */}
            <div className={`w-12 h-12 ${border} hover:border-red-300 border-4 rounded-full `}></div>
        </button>
    )
}
