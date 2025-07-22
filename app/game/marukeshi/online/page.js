import Marukeshi_online from "./marukeshi_online"
export default function Page() {
    return (
        <div className="text-center py-2">
            <div>
                <Marukeshi_online />
            </div>
        </div>
    )
}


export const metadata = {
    title: 'まるけし オンライン対戦',
}