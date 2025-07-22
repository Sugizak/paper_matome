import Reversi_local from "./reversi_local"
export default function Page() {
    return (
        <div className="text-center py-2">
            <Reversi_local />
        </div>
    )
}

export const metadata = {
    title: 'リバーシ ローカル対戦',
}