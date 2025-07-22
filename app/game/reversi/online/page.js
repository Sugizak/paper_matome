import Reversi_online from "./reversi_online"
export default function Page() {
    return (
        <div className="text-center py-2">
            <Reversi_online />
        </div>
    )
}


export const metadata = {
    title: 'リバーシ オンライン対戦',
}