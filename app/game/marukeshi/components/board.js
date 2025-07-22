// Boardコンポーネメントの定義
export default function Board(props) { // propsを受け取る形式
    return (
        <table className="inline-block bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl p-6 mb-8 border-separate border-spacing-2 shadow-lg shadow-blue-200/50">
            <tbody>
                {props.arr.map((arr1, i) => { // props.arrを使用
                    return (
                        <tr key={i}>
                            {
                                arr1.map((n, j) => {
                                    return (
                                        <td key={`${i}-${j}`} className="p-1"> {/* keyをユニークに、paddingを追加 */}
                                            <div
                                                onClick={() => { if (props.callback != null) { props.callback(i, j) } }} // props.callbackを使用
                                                className="w-16 h-16 flex justify-center items-center cursor-pointer transition-all duration-200 hover:scale-105 rounded-full"
                                            >
                                                {/* 個々のセルをレンダリング */}
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

// Cellコンポーネントの定義 (関数として)
function Cell(n) { // nを直接受け取る形式

    let borderClass = null; // borderをborderClassにリネーム

    switch (n) {
        case 0:
            //丸なし
            return (
                <div className="w-12 h-12 flex justify-center items-center"></div>
            )
        case -1:
            //選択中の丸
            borderClass = "border-red-500" // シンプルな赤色に調整
            break
        default:
            //消す前の丸
            borderClass = "border-blue-500" // シンプルな青色に調整
            break;
    }
    return (
        <button className="w-16 h-16 flex justify-center items-center p-0 m-0"> {/* ボタンのサイズを調整 */}
            <div className={`w-12 h-12 ${borderClass} border-4 rounded-full transition-all duration-300`}></div> {/* hover:border-red-300 を削除 */}
        </button>
    )
}
