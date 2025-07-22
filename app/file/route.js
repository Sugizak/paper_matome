const path = require('path');

const fs = require("fs");
// 多分nasだけ
export async function GET(request) {
    try {
        const config_str = fs.readFileSync("config.json", "utf-8");
        const config = JSON.parse(config_str);

        const file_name = request.nextUrl.searchParams.get("filename");
        const username = request.nextUrl.searchParams.get("username");
        const folder_path = config[username].folder_path;
        if (!isAllowedPath(folder_path)) {
            return new Response("Access denied", { status: 403 });
        }
        const file = fs.readFileSync(path.join(folder_path, file_name));
        return new Response(file);
    } catch (e) {
        console.error("Error reading file:", e);
        return new Response("failed", { status: 404 });
    }
}

function isAllowedPath(pathName) {
    if (typeof pathName !== 'string') {
        return false; // 文字列型でない場合はfalse
    }

    // 正規表現の解説:
    // ^        : 文字列の先頭にマッチ
    // [\\\\/]* : バックスラッシュ (\) またはスラッシュ (/) が0回以上繰り返されることにマッチ
    //            - `\\\\` は正規表現内でリテラルのバックスラッシュを表すため
    // nas3     : リテラルの文字列 "nas3" にマッチ
    // i        : 大文字・小文字を区別しない (case-insensitive) フラグ
    const regex = /^[\\\\/]*nas3/i;

    // `test()` メソッドは、文字列が正規表現にマッチするかどうかをチェックし、
    // マッチすれば `true`、しなければ `false` を返します。
    return regex.test(pathName);
}
