"use client";
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
// LinkコンポーネントはNext.js固有のため、window.location.hrefに置き換えます
// import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'; // ArrowLeftアイコンをインポート

// BoardコンポーネントとCellコンポーネントは、このファイル内で定義します。

export default function Marukeshi_friend() {
    // Socket.IOクライアントのインスタンス
    const [socket] = useState(io("/marukeshi/friend", { autoConnect: false }));

    // ゲームのフェーズ管理 (0: 部屋選択, 1: 待機中, 2: ゲーム中, 3: 結果)
    const [phase, set_phase] = useState(0);
    // 部屋名
    const [room, set_room] = useState("");
    // アラートメッセージの表示状態と内容
    const [alert, set_alert] = useState({ visible: false, messages: "" });
    // ゲームボードの状態 (4x4グリッド)
    const [arr, set_arr] = useState(Array(4).fill(1).map(() => Array(4).fill(1)));
    // 現在のターン (1: 先行, -1: 後攻)
    const [turn, set_turn] = useState(1);
    // 自分のプレイヤーID (サーバーから設定されることを想定)
    const [myturn, set_myturn] = useState(0);
    // 勝者 (0: なし, 1: 先行の勝ち, -1: 後攻の勝ち)
    const [winner, set_winner] = useState(0);
    // 選択中の丸の座標 [row, col]
    const [Selected, set_Selected] = useState(null);

    // コンポーネントマウント時にソケット接続を試みる
    useEffect(() => {
        fetch("/api/websocket/server", { method: "POST" })
            .then(() => {
                socket.connect();
                console.log("Socket connected.");
            })
            .catch((error) => console.error("Fetch error or Socket connection failed:", error));

        // コンポーネントアンマウント時にソケットを切断
        return () => {
            socket.disconnect();
            console.log("Socket disconnected.");
        };
    }, [socket]); // socketを依存配列に追加

    // Socket.IOイベントリスナー
    socket.on("change_phase", (phase_num) => {
        set_phase(phase_num);
        console.log(`Phase changed to: ${phase_num}`);
    });

    socket.on("alert", (message) => {
        set_alert({ visible: true, messages: message });
        console.warn(`Alert: ${message}`);
        setTimeout(() => { set_alert({ visible: false, messages: "" }) }, 5000);
    });

    socket.on("set_myturn", (my_turn) => {
        set_myturn(my_turn);
        console.log(`My turn set to: ${my_turn}`);
    });

    socket.on("update", (data) => {
        const json = JSON.parse(data);
        set_arr(json.arr);
        set_turn(json.turn);
        set_winner(json.winner);
        console.log("Game state updated:", json);
        if (json.finished) {
            set_phase(3); // ゲーム終了フェーズへ
        }
    });

    socket.on("lost-connection", () => {
        set_alert({ visible: true, messages: "接続が切れました。10秒後に最初のメニューに戻ります" });
        console.error("Lost connection to server.");
        setTimeout(() => {
            set_alert({ visible: false, messages: "" })
            set_phase(0); // 最初のメニューに戻る
        }, 10000)
    });

    /**
     * プレイヤーがボード上のセルをクリックした際のロジック。
     * サーバーサイドのロジックに依存するため、ここではUIの更新とイベント送信のみを行う。
     * @param {number} i - クリックされたセルの行インデックス。
     * @param {number} j - クリックされたセルの列インデックス。
     */
    function place(i, j) {
        // 自分のターンでなければ操作不可
        if (turn !== myturn) {
            set_alert({ visible: true, messages: "相手の番です！" });
            setTimeout(() => set_alert({ visible: false, messages: "" }), 2000);
            return;
        }

        // 選択中の丸がない場合 (最初のクリック)
        if (Selected === null) {
            // クリックされたセルに丸があるか確認
            if (arr[i][j] === 1) {
                const newArr = structuredClone(arr); // 新しい配列のコピーを作成
                newArr[i][j] = -1; // 選択中の丸としてマーク
                set_Selected([i, j]);
                set_arr(newArr); // UIを更新
            } else if (arr[i][j] === 0) {
                set_alert({ visible: true, messages: "既に消された丸です。" });
                setTimeout(() => set_alert({ visible: false, messages: "" }), 2000);
            }
        } else {
            // 選択中の丸がある場合 (2回目のクリック)
            const tmpArrForCanPlace = structuredClone(arr);
            // 選択を解除して元に戻す（CanPlaceチェックのため）
            tmpArrForCanPlace[Selected[0]][Selected[1]] = 1;

            // 有効な消去範囲かチェック（このチェックはクライアント側でも行うが、最終判定はサーバー）
            if (CanPlace(tmpArrForCanPlace, Selected, [i, j])) {
                // 有効な手であれば、サーバーに実行を要求
                socket.emit("execute", [Selected, [i, j]]);
            } else {
                // 無効な手であれば、アラートを表示し、選択をキャンセルして元に戻す
                set_alert({ visible: true, messages: "無効な手です。水平または垂直に、途中に消された丸がない場所を選んでください。" });
                setTimeout(() => set_alert({ visible: false, messages: "" }), 3000);
            }
            // 選択状態をリセット (サーバーからのupdateで最終的なボード状態が反映される)
            set_Selected(null);
            // 選択解除後の状態をUIに一時的に反映（サーバーからのupdateで上書きされる）
            set_arr(tmpArrForCanPlace);
        }
        console.log(`Clicked: (${i}, ${j})`);
    }

    // ゲームフェーズごとのUIレンダリング
    switch (phase) {
        case 0: // 部屋名入力フェーズ
            return (
                <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                    {alert.visible && <div className="text-red-500 text-lg mb-4 animate-pulse">{alert.messages}</div>}
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
                            className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full px-6 py-3 text-xl shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-400"
                        >
                            部屋に入る
                        </button>
                    </div>
                </div>
            );
        case 1: // 対戦相手待機フェーズ
            return (
                <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                    {alert.visible && <div className="text-red-500 text-lg mb-4 animate-pulse">{alert.messages}</div>}
                    <div className="animate-spin h-16 w-16 border-8 border-blue-500 rounded-full border-t-transparent mb-6"></div>
                    <h2 className="text-3xl font-bold mb-2">対戦相手を探しています。</h2>
                    <p className="text-xl text-gray-600 mb-6">しばらくお待ちください...</p>
                    <h2 className="text-2xl font-semibold mb-8">部屋名: <span className="text-blue-600">{room}</span></h2>
                    <button
                        onClick={() => { socket.emit("leave-room", room); set_phase(0); }} // set_phase(0)を直接呼び出し
                        className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                    >
                        部屋を出る
                    </button>
                </div>
            );
        case 2: // ゲームプレイフェーズ
            return (
                <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-8 text-center">
                        <span className="text-blue-700">
                            {Turn(turn, myturn)}
                        </span>
                    </h2>
                    {alert.visible && <div className="text-red-500 text-lg mb-4 animate-pulse">{alert.messages}</div>}
                    {/* Boardコンポーネントにarrとplace関数をpropsとして渡す */}
                    <Board arr={arr} callback={place}></Board>
                </div>
            );
        case 3: // ゲーム結果フェーズ
            return (
                <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                    <div className="flex flex-col justify-center items-center">
                        <Winner winner={winner} myturn={myturn}></Winner>
                    </div>
                    <div className="flex space-x-4 mt-8">
                        <button
                            className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                            onClick={() => { window.location.href = './'; }}
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
            );
        default:
            return null;
    }
}

/**
 * 2つの点の間の丸を消去できるかチェックします。
 * @param {Array<Array<number>>} arr - 現在のボードの状態。
 * @param {Array<number>} arr1 - 最初の点の座標 [行, 列]。
 * @param {Array<number>} arr2 - 2番目の点の座標 [行, 列]。
 * @returns {boolean} - 移動が有効な場合はtrue、それ以外の場合はfalse。
 */
function CanPlace(arr, arr1, arr2) {
    // 同じ座標は無効
    if (arr1[0] === arr2[0] && arr1[1] === arr2[1]) {
        return false;
    }

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

/**
 * ゲームボードのテーブルをレンダリングします。
 * @param {Array<Array<number>>} arr - ゲームボードを表す2D配列。
 * @param {Function} callback - セルがクリックされたときに呼び出す関数 (place関数)。
 * @returns {JSX.Element} - ボードを表すHTMLテーブル。
 */
function Board({ arr, callback }) { // propsを分割代入で受け取る
    return (
        <table className="inline-block bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl p-6 mb-8 border-separate border-spacing-2 shadow-lg shadow-blue-200/50">
            <tbody>
                {arr.map((rowArr, i) => (
                    <tr key={i}>
                        {rowArr.map((cellValue, j) => (
                            <td key={`${i}-${j}`} className="p-1">
                                <div
                                    onClick={() => { if (callback != null) { callback(i, j) } }}
                                    className="w-16 h-16 flex justify-center items-center cursor-pointer transition-all duration-200 hover:scale-105 rounded-full"
                                >
                                    <Cell n={cellValue} />
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

/**
 * セルの値に基づいて個々のゲームセルをレンダリングします。
 * @param {number} n - セルの値 (1: アクティブ, 0: 消去済み, -1: 選択済み)。
 * @returns {JSX.Element} - セルを表すdiv要素。
 */
function Cell({ n }) { // nを分割代入で受け取る
    let borderClass = null;

    switch (n) {
        case 0:
            //丸なし (消された丸)
            return (
                <div className="w-12 h-12 flex justify-center items-center"></div>
            );
        case -1:
            //選択中の丸
            borderClass = "border-red-500";
            break;
        default:
            //消す前の丸 (アクティブな丸)
            borderClass = "border-blue-500";
            break;
    }
    return (
        <button className="w-16 h-16 flex justify-center items-center p-0 m-0">
            <div className={`w-12 h-12 ${borderClass} border-4 rounded-full transition-all duration-300`}></div>
        </button>
    );
}

/**
 * 勝者メッセージをレンダリングします。
 * @param {object} props - winnerとmyturnを含むプロパティ。
 * @param {number} props.winner - 勝者のプレイヤーID (1: 先行, -1: 後攻)。
 * @param {number} props.myturn - 自分のプレイヤーID (1: 先行, -1: 後攻)。
 * @returns {JSX.Element} - 勝敗メッセージ。
 */
function Winner({ winner, myturn }) { // propsを分割代入で受け取る
    console.log(`Winner: ${winner}, MyTurn: ${myturn}`);
    if (winner === myturn) {
        return (<h2 className="text-red-600 text-6xl md:text-7xl font-extrabold m-3 drop-shadow-lg">あなたの勝ち!!</h2>);
    }
    return (<h2 className="text-blue-700 text-6xl md:text-7xl font-extrabold m-3 drop-shadow-lg">あなたの負け!!</h2>);
}

/**
 * 現在のターンメッセージをレンダリングします。
 * @param {number} turn - 現在のターンを示すID (1: 先行, -1: 後攻)。
 * @param {number} myturn - 自分のプレイヤーID (1: 先行, -1: 後攻)。
 * @returns {string} - ターンメッセージ。
 */
function Turn(turn, myturn) {
    if (turn === myturn) {
        return `あなたの番です`;
    } else if (turn === -myturn) {
        return "相手の番です";
    }
    return "";
}
