"use client";
import { useState } from "react";
import { ArrowLeft } from 'lucide-react'; // ArrowLeftアイコンをインポート

export default function Marukeshi_local() {
    // ゲームボードの状態 (4x4グリッド)
    // 1: アクティブな丸, 0: 消された丸, -1: 選択中の丸
    const [arr, set_arr] = useState(Array(4).fill(0).map(() => Array(4).fill(1)));
    // 現在のターン: 1が先行, -1が後攻
    const [turn, set_turn] = useState(1);
    // 選択中の丸があるかどうかの状態
    const [SelectedCount, set_SelectedCount] = useState(0);
    // 選択中の丸の座標 [行, 列]
    const [Selected, set_Selected] = useState([-1, -1]);
    // ゲームが終了したかどうかの状態 (スペルミスを修正: finishied -> finished)
    const [finished, set_finished] = useState(false);
    // プレイヤー名
    const [name, set_name] = useState(["先行", "後攻"]);

    // ゲームが終了した場合の表示
    if (finished) {
        return (
            <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                <h1 className="text-6xl md:text-7xl font-extrabold mb-8 text-center animate-bounce">
                    {/* 勝者を表示 */}
                    <span className="text-red-600 drop-shadow-lg">
                        {/* turnが最後に丸を消したプレイヤーの次のターンを示すため、勝者は現在のturnの逆 */}
                        {turn === 1 ? name[0] : name[1]}の勝ち!!
                    </span>
                </h1>
                <div className="flex space-x-4">
                    {/* ゲーム選択ページに戻るボタン */}
                    <button
                        className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                        onClick={() => { window.location.href = './'; }} // ページ遷移
                    >
                        <ArrowLeft className="w-6 h-6 mr-2" />
                        ゲーム選択に戻る
                    </button>
                    {/* もう一度プレイするボタン (ページをリロード) */}
                    <button
                        className="inline-flex items-center bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-full px-6 py-3 text-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-400"
                        onClick={(e) => { e.preventDefault(); location.reload(); }}
                    >
                        もう一度
                    </button>
                </div>
            </div>
        );
    } else {
        // ゲーム進行中の表示
        return (
            <div className="bg-white text-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
                <h1 className="text-5xl md:text-6xl font-extrabold mb-8 text-center">
                    {/* 現在のプレイヤーのターンを表示 */}
                    <span className="text-black-700">
                        {turn === 1 ? name[0] : name[1]}の番
                    </span>
                </h1>
                {/* ゲームボードをレンダリング */}
                <Board arr={arr} put={put} />
                <div className="mt-8">
                    {/* ゲーム選択ページに戻るボタン */}
                    <button
                        className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-300 bg-gray-100/50 border border-gray-300 hover:border-gray-500 rounded-full px-6 py-3 text-xl font-semibold shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300"
                        onClick={() => { window.location.href = './'; }} // ページ遷移
                    >
                        <ArrowLeft className="w-6 h-6 mr-2" />
                        ゲーム選択に戻る
                    </button>
                </div>
            </div>
        );
    }

    /**
     * セルのクリックイベントを処理し、選択と消去のロジックを管理します。
     * @param {number} i - クリックされたセルの行インデックス。
     * @param {number} j - クリックされたセルの列インデックス。
     */
    function put(i, j) {
        // 丸が選択されていない場合
        if (SelectedCount === 0) {
            // クリックされたセルがアクティブな丸 (値が1) の場合
            if (arr[i][j] === 1) {
                const newArr = structuredClone(arr); // 新しい配列のコピーを作成
                newArr[i][j] = -1; // コピーを変更
                set_arr(newArr); // 新しい配列で状態を更新
                set_SelectedCount(1); // 1つの丸が選択されたことを示す
                set_Selected([i, j]); // 選択された丸の座標を保存
                console.log("select");
            }
        } else if (Canput(Selected, [i, j])) {
            // 丸が選択されており、現在のクリックが有効な消去対象の場合
            const updatedArr = erase(Selected, [i, j]); // erase関数が更新された配列を返すように変更
            set_turn(-turn); // ターンを切り替える
            set_SelectedCount(0); // 選択状態をリセット
            set_Selected([-1, -1]); // 選択された座標をリセット
            judge(updatedArr); // 更新された配列をjudge関数に渡す
            console.log("put");
        } else {
            // 丸が選択されているが、現在のクリックが有効な対象ではない場合 (選択をキャンセル)
            set_SelectedCount(0); // 選択状態をリセット
            const tmp = structuredClone(arr); // ディープコピーを作成
            tmp[Selected[0]][Selected[1]] = 1; // 選択された丸をアクティブ (1) に戻す
            set_arr(tmp); // 状態を更新
            set_Selected([-1, -1]); // 選択された座標をリセット
            console.log("cancel");
        }
        console.log(`Clicked: (${i}, ${j})`);
    }

    /**
     * 2つの点の間の丸を消去できるかチェックします。
     * 有効な移動は水平または垂直で、間のすべての丸がアクティブ (1) または選択済み (-1) である必要があります。
     * @param {Array<number>} arr1 - 最初の点の座標 [行, 列]。
     * @param {Array<number>} arr2 - 2番目の点の座標 [行, 列]。
     * @returns {boolean} - 移動が有効な場合はtrue、それ以外の場合はfalse。
     */
    function Canput(arr1, arr2) {
        // 水平移動をチェック
        if (arr1[0] === arr2[0]) {
            const min = Math.min(arr1[1], arr2[1]);
            const max = Math.max(arr1[1], arr2[1]);
            for (let i = min; i < max + 1; i++) {
                // 間に消されたセル (0) がある場合、移動は無効
                if (arr[arr1[0]][i] === 0) {
                    return false;
                }
            }
            return true;
        }
        // 垂直移動をチェック
        else if (arr1[1] === arr2[1]) {
            const min = Math.min(arr1[0], arr2[0]);
            const max = Math.max(arr1[0], arr2[0]);
            for (let i = min; i < max + 1; i++) {
                // 間に消されたセル (0) がある場合、移動は無効
                if (arr[i][arr1[1]] === 0) {
                    return false;
                }
            }
            return true;
        }
        // 水平または垂直移動ではない
        return false;
    }

    /**
     * 2つの点の間の丸を消去します (値を0に設定)。
     * 移動が有効であると仮定します (Canputでチェック済み)。
     * @param {Array<number>} arr1 - 最初の点の座標 [行, 列]。
     * @param {Array<number>} arr2 - 2番目の点の座標 [行, 列]。
     * @returns {Array<Array<number>>} - 更新されたボードの配列。
     */
    function erase(arr1, arr2) {
        const tmp = structuredClone(arr); // 新しい配列のコピーを作成
        // 水平に消去
        if (arr1[0] === arr2[0]) {
            const min = Math.min(arr1[1], arr2[1]);
            const max = Math.max(arr1[1], arr2[1]);
            for (let i = min; i < max + 1; i++) {
                tmp[arr1[0]][i] = 0; // コピーを変更
            }
        }
        // 垂直に消去
        else if (arr1[1] === arr2[1]) {
            const min = Math.min(arr1[0], arr2[0]);
            const max = Math.max(arr1[0], arr2[0]);
            for (let i = min; i < max + 1; i++) {
                tmp[i][arr1[1]] = 0; // コピーを変更
            }
        }
        set_arr(tmp); // 新しい配列で状態を更新
        return tmp; // 更新された配列を返す
    }

    /**
     * ゲームが終了したか (すべての丸が消去されたか) をチェックします。
     * 終了している場合、ゲームの状態を終了済みに設定します。
     * @param {Array<Array<number>>} currentArr - 評価する現在のボードの配列。
     * @returns {boolean} - ゲームが終了している場合はtrue、それ以外の場合はfalse。
     */
    function judge(currentArr) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (currentArr[i][j] === 1) { // 渡された配列を使用
                    return false; // アクティブな丸が見つかったため、ゲームは終了していません
                }
            }
        }
        set_finished(true); // すべての丸が消去されたため、ゲームを終了済みに設定
        return true;
    }
}

/**
 * ゲームボードのテーブルをレンダリングします。
 * @param {Array<Array<number>>} arr - ゲームボードを表す2D配列。
 * @param {Function} put - セルがクリックされたときに呼び出す関数 (put関数)。
 * @returns {JSX.Element} - ボードを表すHTMLテーブル。
 */
function Board({ arr, put }) {
    return (
        <table className="inline-block bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl p-6 mb-8 border-separate border-spacing-2 shadow-lg shadow-blue-200/50">
            <tbody>
                {arr.map((rowArr, i) => (
                    <tr key={i}>
                        {rowArr.map((cellValue, j) => (
                            <td key={`${i}-${j}`} className="p-1">
                                <div
                                    onClick={() => { put(i, j); }}
                                    className="w-16 h-16 flex justify-center items-center cursor-pointer transition-all duration-200 hover:scale-105 rounded-full"
                                >
                                    {/* 個々のセルをレンダリング */}
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
function Cell({ n }) {
    let borderClass = "";

    switch (n) {
        case 0:
            // 消去された丸: 表示なし
            return (
                <div className="w-12 h-12 flex justify-center items-center"></div>
            );
        case -1:
            // 選択中の丸: 赤い枠線のみ
            borderClass = "border-red-500";
            break;
        default:
            // アクティブな丸: 青い枠線のみ
            borderClass = "border-blue-500";
            break;
    }

    return (
        <button className="w-16 h-16 flex justify-center items-center p-0 m-0">
            <div
                // 塗りつぶし、影、拡大のクラスを削除し、枠線のみにする
                className={`w-12 h-12 ${borderClass} border-4 rounded-full flex items-center justify-center transition-all duration-300`}
            ></div>
        </button>
    );
}
