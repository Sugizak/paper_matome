"use client";
import { useState, useEffect } from "react";
// LinkコンポーネントはNext.js固有のため、window.location.hrefに置き換えます
// import Link from "next/link";
import { ArrowLeft } from "lucide-react"; // ArrowLeftアイコンをインポート

export default function Marukeshi_local() {
    const [turn, set_turn] = useState(Math.random() < 0.5 ? 1 : -1);
    const [arr, set_arr] = useState(Array(4).fill(0).map(() => Array(4).fill(1)));
    const [SelectedCount, set_SelectedCount] = useState(0);
    const [Selected, set_Selected] = useState([-1, -1]);
    const [finishied, set_finishied] = useState(false); // finishied のスペルはそのまま維持

    if (finishied) {
        return (
            <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                <h1 className="text-6xl md:text-7xl font-extrabold mb-8 text-center animate-bounce">
                    <span className={`drop-shadow-lg ${turn === 1 ? "text-red-600" : "text-blue-700"}`}>
                        {turn === 1 ? "あなたの勝ち!!" : "コンピューターの勝ち!!"}
                    </span>
                </h1>
                <div className="flex space-x-4 mt-8">
                    <button
                        className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                        onClick={() => { window.location.href = './'; }}
                    >
                        <ArrowLeft className="w-6 h-6 mr-2" />
                        戻る
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
    } else if (turn === 1) {
        judge(); // ロジックは変更せずそのまま維持
        return (
            <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                <h1 className="text-5xl md:text-6xl font-extrabold mb-8 text-center">
                    {/* ターン表示の色をtext-gray-900に変更 */}
                    <span className="text-gray-900">
                        あなたの番
                    </span>
                </h1>
                {/* Boardコンポーネントにarrとput関数をpropsとして渡す */}
                {/* Board関数の呼び出し方を元の形に合わせる */}
                {Board(arr, put)}
                <div className="mt-8">
                    <button
                        className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                        onClick={() => { window.location.href = './'; }}
                    >
                        <ArrowLeft className="w-6 h-6 mr-2" />
                        戻る
                    </button>
                </div>
            </div>
        );
    } else {
        //非同期にしないとマウント時にエラー (元のロジックを維持)
        setTimeout(com_put, 0);
        return (
            <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                <h1 className="text-5xl md:text-6xl font-extrabold mb-8 text-center">
                    {/* ターン表示の色をtext-gray-900に変更 */}
                    <span className="text-gray-900">
                        コンピューターの番
                    </span>
                </h1>
                {/* Boardコンポーネントにarrとcallback=nullをpropsとして渡す */}
                {/* Board関数の呼び出し方を元の形に合わせる */}
                {Board(arr, null)}
                <div className="mt-8">
                    <button
                        className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                        onClick={() => { window.location.href = './'; }}
                    >
                        <ArrowLeft className="w-6 h-6 mr-2" />
                        戻る
                    </button>
                </div>
            </div>
        );
    }

    // 以下、ロジック関数は元のコードから変更なしで維持
    function put(i, j) {
        if (SelectedCount === 0) {
            if (arr[i][j] === 1) {
                set_SelectedCount(1);
                set_Selected([i, j]);
                arr[i][j] = -1; // ここが直接変更されている箇所
            }
        } else if (Canput(Selected, [i, j])) {
            erase(Selected, [i, j]);
            set_turn(-turn);
            set_SelectedCount(0);
            set_Selected([-1, -1]);
            judge();
        } else {
            set_SelectedCount(0);
            const tmp = arr // ここが直接参照になっている箇所
            tmp[Selected[0]][Selected[1]] = 1;
            set_arr(tmp);
            set_Selected([-1, -1]);
        }
    }

    function Canput(arr1, arr2) {
        // arrの参照はそのまま維持
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

    function erase(arr1, arr2) {
        const tmp = arr // ここが直接参照になっている箇所
        if (arr1[0] === arr2[0]) {
            const min = Math.min(arr1[1], arr2[1]);
            const max = Math.max(arr1[1], arr2[1]);
            for (let i = min; i < max + 1; i++) {
                tmp[arr1[0]][i] = 0;
            }
        } else if (arr1[1] === arr2[1]) {
            const min = Math.min(arr1[0], arr2[0]);
            const max = Math.max(arr1[0], arr2[0]);
            for (let i = min; i < max + 1; i++) {
                tmp[i][arr1[1]] = 0;
            }
        }
        set_arr(tmp);
    }

    function judge() {
        // arrの参照はそのまま維持
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (arr[i][j] !== 0) {
                    return false;
                }
            }
        }
        set_finishied(true);
        return true
    }

    async function com_put() {
        // fetch API呼び出しはそのまま維持
        const response = await fetch("com/api", { method: "POST", body: JSON.stringify({ arr: arr }) })
        const data = await response.json();
        await new Promise((resolve) => setTimeout(resolve, 500));
        set_turn(-turn);
        set_arr(data.arr);
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
        <button className="w-12 h-12 flex justify-center items-center">
            {/* hover:border-red-300 も元のコード通り維持 */}
            <div className={` w-12 h-12 ${border} hover:border-red-300 border-4 rounded-full `}></div>
        </button>
    )
}
