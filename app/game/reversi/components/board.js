export default function Board(props) {
    return (
        <div>
            <table className="inline-block bg-green-600 border border-collapse border-black m-3">
                <tbody>
                    {props.board.map((arr1, i) => {
                        return (
                            <tr key={i}>
                                {
                                    arr1.map((n, j) => {
                                        return (
                                            <td key={i + j} className="border border-black">{Cell(n, i, j, props.callback)}</td>
                                        )
                                    })
                                }
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
function Cell(n, i, j, callback = null) {
    const Color = () => {
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
                return (
                    <div className="w-10 h-10" onClick={() => { callback(i, j) }} />
                )

        }
    }
    return (
        <div className="w-10 h-10 flex justify-center items-center">
            {Color()}
        </div>
    )
}
