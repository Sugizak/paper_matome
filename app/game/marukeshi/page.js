import Link from "next/link";
import { Laptop, Users, UserPlus, Globe, ArrowLeft } from 'lucide-react';

// 対戦モードの情報を配列で管理
const modes = [
    {
        name: "コンピューターと対戦",
        href: "marukeshi/com",
        description: "AIを相手に腕試し。手軽に一人でプレイできます。",
        icon: <Laptop className="w-10 h-10 text-cyan-400" />
    },
    {
        name: "ローカル対戦",
        href: "marukeshi/local",
        description: "一つのデバイスを共有し、友達や家族と対戦します。",
        icon: <Users className="w-10 h-10 text-orange-400" />
    },
    {
        name: "友達と対戦",
        href: "marukeshi/friend",
        description: "合言葉を使って、遠くの友達とオンラインで対戦します。",
        icon: <UserPlus className="w-10 h-10 text-rose-400" />
    },
    {
        name: "誰かと対戦",
        href: "marukeshi/online",
        description: "オンライン上のプレイヤーとランダムにマッチングします。",
        icon: <Globe className="w-10 h-10 text-lime-400" />
    }
];

export default function MarukeshiPage() {
    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
            {/* ページタイトル */}
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-600">
                    まるけし
                </span>
            </h1>
            <p className="text-gray-400 mb-12 text-lg">対戦モードを選択してください</p>

            {/* 対戦モード選択カード */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl">
                {modes.map((mode) => (
                    <Link href={mode.href} key={mode.name}>
                        <div className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 h-full flex flex-col transform transition-all duration-300 hover:scale-105 hover:border-sky-400 hover:shadow-2xl hover:shadow-sky-500/20">
                            <div className="flex items-center mb-4">
                                {mode.icon}
                                <h2 className="text-2xl font-bold text-gray-100 ml-4">{mode.name}</h2>
                            </div>
                            <p className="text-gray-400 text-sm">{mode.description}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* 戻るボタン */}
            <div className="mt-12 text-center">
                <Link href="./" className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-300 bg-gray-800/50 border border-gray-700 hover:border-gray-500 rounded-full px-6 py-3">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    ゲーム選択に戻る
                </Link>
            </div>
        </div>
    );
}

// サーバーコンポーネントでは、このようにmetadataをexportするのが正しい方法です。
export const metadata = {
    title: 'まるけし',
}
