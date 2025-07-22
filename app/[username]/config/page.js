
"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from "next/navigation";
import Link from 'next/link';
import NotFound from '@/app/not-found';

export default function Page() {

  const [config, setConfig] = useState({});
  const [str, set_str] = useState("");
  const [isError, set_isError] = useState(false);
  const [Username, setUsername] = useState(useParams().username);
  const [IsNotFound, setIsNotFound] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const Keyhandler = (e) => {
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        LineUp();
      }
    };
    document.addEventListener('keydown', Keyhandler);

    initializeConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function initializeConfig() {
    let data;
    try {
      data = await GetData(Username);
    } catch (error) {
      setIsNotFound(true);
      return;
    }
    setConfig({ ...data });
    set_str(JSON.stringify(data, null, 4));
    return
  }

  //これをしないとconfigがuseEffect内でクロージャーされてしまう
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  function LineUp() {
    set_str(JSON.stringify(configRef.current, null, 4));
  }
  if (IsNotFound) {
    return <NotFound />
  }
  return (
    <div className="p-5 items-center justify-center bg-white text-black">
      <h1 className="p-0 m-2 text-center text-3xl font-bold"><Link href="/">設定</Link></h1>
      {isError}
      <div className='flex justify-between '>
        <div className=''>
          <button
            className="mx-1 my-1 px-4 py-2 bg-gray-300 text-gray-800 hover:bg-gray-400 border rounded cursor-pointer"
            onClick={async () => {
              PostData(config, Username, router);
            }}
          >
            保存
          </button>
          <button
            className="mx-1  my-1 px-4 py-2 bg-gray-300 text-gray-800 hover:bg-gray-400 border rounded cursor-pointer"
            onClick={() => {
              LineUp();
            }}
          >
            整列
          </button>
        </div>
        <div>
          <button
            className="mx-2  my-1 px-4 py-2 bg-red-500 text-white hover:bg-red-700 border border-red-300 rounded cursor-pointer"
            onClick={() => {
              PostData({}, Username, router);
            }}
          >
            削除
          </button>
        </div>
      </div>
      <textarea
        className={`w-full h-100 p-2 border border-gray-300 rounded ${isError ? "bg-red-50" : "bg-white"}`}
        value={str}
        onChange={(e) => {
          set_str(e.target.value);
          try {
            const newConfig = JSON.parse(e.target.value);
            setConfig(newConfig);
            set_isError(false);
          } catch (error) {
            set_isError(true);
          }
        }}
      />
      <Link href={`./`}>
        <button className="mx-1 px-4 py-2 bg-gray-300 text-gray-800 hover:bg-gray-400 border rounded cursor-pointer">
          戻る
        </button>
      </Link>
      <pre>
        {JSON.stringify(config, null, 4)}
      </pre>
    </div >
  )
}

async function GetData(Username) {
  const url = new URL('/api/config', window.location.origin)
  url.searchParams.append('username', Username);
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
  console.log("config data:", responseData.config);
  return responseData.config;
}

async function PostData(data, Username, router) {
  const url = new URL('/api/config', window.location.origin)
  url.searchParams.append('username', Username);
  const data_post = {
    config: data,
    Username: Username
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data_post),
  });

  if (response.ok) {
    if (Object.keys(data).length === 0) {
      router.push("/");
    } else {
      router.push("./");
    }
  }
}