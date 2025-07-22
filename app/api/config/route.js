const fs = require("fs")
// import { useLocation } from 'react-router-dom';

export async function GET(request) {
    const Username = new URL(request.url).searchParams.get('username'); // デフォルトのユーザー名を設定
    const config_str = fs.readFileSync("config.json", "utf-8");
    const config = JSON.parse(config_str)[Username];
    if (!config) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    console.log(config)
    return new Response(JSON.stringify({ config: config }), {
        headers: {
            'Content-Type': 'application/json',
        }
    });
}

export async function POST(request) {
    const data = await request.json();
    const new_config = data.config;
    const Username = data.Username; // ユーザー名を取得


    const config_str = fs.readFileSync("config.json", "utf-8");
    const config = JSON.parse(config_str);

    if (!new_config || Object.keys(new_config).length === 0) {
        delete config[Username]; // ユーザー名が空の場合は削除
    } else {
        config[Username] = { ...new_config }; // ユーザー名をキーにして新しい設定を保存
    }
    fs.writeFileSync("config.json", JSON.stringify(config, null, 4), "utf-8");
    return new Response(JSON.stringify({ message: 'Data saved successfully' }), {
        headers: {
            'Content-Type': 'application/json',
        },
    });

}