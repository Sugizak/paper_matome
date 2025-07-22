const fs = require("fs")

export async function GET(request) {
    try {
        const SearchParams = request.nextUrl.searchParams;
        const Username = SearchParams.get('username')
        const config_str = fs.readFileSync("config.json", "utf-8");
        const config = JSON.parse(config_str)[Username];
        const data_str = fs.readFileSync("data.json", "utf-8");
        const data = JSON.parse(data_str);
        //不正なユーザー名の場合
        if (config === undefined) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const folder_path = config.folder_path;
        //読み出し
        const files = fs.readdirSync(folder_path).filter(file => file.endsWith('.pdf')); // configからファイル名のリストを取得
        //ファイル名をキーにしてデータを取得
        const new_data_user = {}
        for (const file of files) {
            new_data_user[file] = {};
            //旧データに合ったら加える
            for (const content in config.contents) {
                if (data[Username] && data[Username][file] && data[Username][file][content]) {
                    new_data_user[file][content] = JSON.parse(JSON.stringify(data[Username][file][content]));
                } else {
                    new_data_user[file][content] = "";
                }
            }
        }
        data[Username] = JSON.parse(JSON.stringify(new_data_user)); // ユーザー名をキーにしてデータを保存
        //書き込み.
        fs.writeFileSync("data.json", JSON.stringify(data, null, 4), "utf-8");

        //サーチパラメータによるフィルタリング
        const filtered_data_user = JSON.parse(JSON.stringify(new_data_user));
        for (const key of SearchParams.keys()) {
            if (key === 'username') continue; // usernameは除外
            const value = SearchParams.get(key);
            for (const file in new_data_user) {
                // 条件に合致する場合はそのまま
                if (new_data_user[file][key] !== undefined && new_data_user[file][key] == value) {
                    continue;
                } else {
                    delete filtered_data_user[file]; // 条件に合致しない場合は削除
                }
            }
        }
        console.log("Filtered data for user:", Username, filtered_data_user);
        return new Response(JSON.stringify({ config: config, data: filtered_data_user }), {
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (e) {
        console.error("Error reading file:", e);
        return new Response("failed", { status: 400 });
    }
}

export async function POST(request) {
    try {
        const POST_json = await request.json();
        const POSTdata = POST_json.data; // POSTされたデータを取得
        const Username = POST_json.username; // ユーザー名を取得

        //現在のデータ取得
        const data_str = fs.readFileSync("data.json", "utf-8");
        const data = JSON.parse(data_str);
        if (!data[Username]) {
            data[Username] = {}; // ユーザー名が存在しない場合は新規作成
        }

        //POSTされたデータをdataに加える
        for (const fileName in POSTdata) {
            if (!data[Username][fileName]) {
                data[Username][fileName] = {};
            }
            for (const contentKey in POSTdata[fileName]) {
                data[Username][fileName][contentKey] = POSTdata[fileName][contentKey];
            }
        }

        fs.writeFileSync("data.json", JSON.stringify(data, null, 4), "utf-8");
        return new Response(JSON.stringify({ message: 'Data saved successfully' }), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (e) {
        console.error("Error saving data:", e);
        return new Response("failed", { status: 500 });
    }

}