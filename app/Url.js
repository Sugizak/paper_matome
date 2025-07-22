import Link from 'next/link';
const path = require('path');
// Dropdownコンポーネントは変更なし
export default function Url({ username, name }) {
    const CurrentPath = window.location.href;
    return (
        <div className="break-words overflow-hidden">
            <Link href={`file?username=${username}&filename=${name}`} className=" hover:underline">
                {removeFileExtension(name)} {/* .pdfなどを除去して表示 */}
            </Link>
        </div>
    )
}

function removeFileExtension(filename) {
    // 正規表現: \.[^.]+$/
    // \.   -> リテラルのドットにマッチ
    // [^.] -> ドット以外の任意の文字にマッチ
    // +    -> 直前の文字が1回以上繰り返される
    // $    -> 文字列の末尾にマッチ
    // これにより、最後のドットとそれに続く全ての文字（改行を除く）にマッチします。
    const regex = /\.[^.]+$/;
    return filename.replace(regex, '');
}