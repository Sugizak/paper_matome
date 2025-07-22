"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, CircleDot, Home, ArrowRight } from 'lucide-react';

// ゲームの情報を配列で管理
const games = [
    {
        name: "リバーシ",
        slug: "/reversi",
        description: "白と黒の石で盤面を挟んでいく古典的なボードゲームです。",
        icon: <Gamepad2 className="w-12 h-12 text-emerald-400" />,
        color: "from-emerald-500 to-green-600"
    },
    {
        name: "まるけし",
        slug: "/marukeshi",
        description: "交互に点を消していき、最後の点を消した方が負けとなるシンプルなゲーム。",
        icon: <CircleDot className="w-12 h-12 text-sky-400" />,
        color: "from-sky-500 to-blue-600"
    }
];

export default function GamePage() {
    const pathname = usePathname();

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
            {/* ページタイトル */}
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                    Game
                </span>
            </h1>
            <p className="text-gray-400 mb-12 text-lg">プレイしたいゲームを選んでください</p>

            {/* ゲーム選択カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {games.map((game) => (
                    <Link href={pathname + game.slug} key={game.name}>
                        <div className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 h-full flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20">
                            <div>
                                <div className="mb-4">
                                    {game.icon}
                                </div>
                                <h2 className="text-3xl font-bold text-gray-100 mb-2">{game.name}</h2>
                                <p className="text-gray-400">{game.description}</p>
                            </div>
                            <div className={`mt-6 flex items-center justify-end text-lg font-semibold text-purple-300`}>
                                プレイする
                                <ArrowRight className="w-5 h-5 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ホームへのリンク */}
            <div className="mt-16 text-center">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-300">
                    <Home className="w-5 h-5 mr-2" />
                    ホームに戻る
                </Link>
            </div>
        </div>
    );
}
