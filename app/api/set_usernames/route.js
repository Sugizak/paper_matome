const fs = require("fs")
import path from "path";

const config_Template = {
    "folder_path": "論文のあるフォルダパスをここに入力",
    "contents": {
        "Genre": {
            "type": "dropdown",
            "options": [
                "EMP",
                "QET",
                "その他"
            ]
        },
        "Type": {
            "type": "dropdown",
            "options": [
                "学術論文",
                "学位論文",
                "書籍",
                "その他"
            ]
        },
        "IsRead": {
            "type": "dropdown",
            "options": [
                "〇",
                "△",
                "×"
            ]
        },
        "Overview": {
            "type": "text"
        }
    }
}

export async function GET(request) {
    const config_str = fs.readFileSync("config.json", "utf-8");
    const config = JSON.parse(config_str);
    const usernames = Object.keys(config);
    return new Response(JSON.stringify({ usernames: usernames }), {
        headers: {
            'Content-Type': 'application/json',
        }
    });
}

export async function POST(request) {
    const POSTdata = await request.json();

    //現在のデータ取得
    const config_str = fs.readFileSync("config.json", "utf-8");
    const config = JSON.parse(config_str);
    const userNames = Object.keys(config);

    if (!isAlphaNumericNonEmpty(POSTdata.username)) {
        return new Response(JSON.stringify({ message: 'Username must be alphanumeric' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    const appDirectory = path.join(process.cwd(), "app");
    const Dirnames = fs.readdirSync(appDirectory).filter(item => {
        const itemPath = path.join(appDirectory, item);
        return fs.statSync(itemPath).isDirectory();
    });

    if (userNames.includes(POSTdata.username)) {
        return new Response(JSON.stringify({ message: 'Username already exists' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    if (Dirnames.includes(POSTdata.username)) {
        return new Response(JSON.stringify({ message: 'You cannot use this username' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    config[POSTdata.username] = { ...config_Template }; // 新しいユーザー名を追加

    fs.writeFileSync("config.json", JSON.stringify(config, null, 4), "utf-8");
    return new Response(JSON.stringify({ message: 'Data saved successfully' }), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

function isAlphaNumericNonEmpty(str) {
    return str !== "" && /^[a-zA-Z0-9]*$/.test(str);
}