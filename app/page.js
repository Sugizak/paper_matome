"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Dropdown from './Dropdown';
// import TruncatedText from './TruncatedText';
// import Url from './Url';
import Link from 'next/link';
export default function Page() {
  const [Usernames, setUsernames] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [error, set_error] = useState("");
  const router = useRouter()
  function setError(message) {
    set_error(message);
    setTimeout(() => set_error(""), 3000);
  }
  useEffect(() => {
    fetchUsernames().then((names) => {
      setUsernames(names)
    });
  }, []);
  return (
    <div className="h-screen flex flex-col text-center items-center justify-center bg-gray-100 text-black">

      <div className="m-5 w-96 bg-white shadow-md rounded-lg p-6">
        <h1 className="p-0 m-3 text-4xl font-bold"><Link href="/">論文まとめ</Link></h1>
        <div className="w-64 mx-auto">
          <Dropdown
            option="ユーザー名を選択"
            options={["ユーザー名を選択", ...Usernames]}
            IncludeBlank={false}
            onTextChange={(value) => {
              if (value !== "ユーザー名を選択") {
                window.location.href = `/${value}`;
              }
            }}
          />
        </div>
        <div className="m-3 pt-6 border-t border-gray-200 w-64 mx-auto flex flex-col items-center">
          <h2 className="text-base font-semibold mb-3 text-gray-600">新しいユーザーを追加</h2> {/* 文字サイズを小さく、色も少し薄く */}
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>} {/* エラーメッセージを表示 */}
          <input
            type="text"
            placeholder="ユーザー名を入力"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                AddNewUsername(newUsername, setError, router);
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 w-full mb-3 text-gray-700 text-sm" // ringの色もグレー系に
          />
          <button
            onClick={(e) => { AddNewUsername(newUsername, setError, router) }}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition duration-200 w-full text-sm" // ボタンの背景色を少し薄く
          >
            追加
          </button>
        </div>
      </div>
      <button>
        <Link className={`z-10 fixed bottom-1 right-1 px-6 py-3  text-black transition-opacity duration-300 ease-in-out text-black'}`}
          href="/game">
          game
        </Link>
      </button>
    </div>
  );
}


async function fetchUsernames() {
  const url = new URL('/api/set_usernames', window.location.origin);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('GET request failed');
  }
  const responseData = await response.json();
  return responseData.usernames;
}

async function AddNewUsername(username, setError, router) {
  if (!username) {
    setError("ユーザー名を入力してください");
    return;
  }
  const url = new URL('/api/set_usernames', window.location.origin);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: username }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    setError(errorData.message || 'POST request failed');
    throw new Error('POST request failed');
  }
  router.push(`/${username}/config`);
  // ユーザー名を追加した後、リダイレクトする
  const responseData = await response.json();
  return responseData;
}