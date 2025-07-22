"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Dropdown from '../Dropdown';
import TruncatedText from '../TruncatedText';
import Url from '../Url';
import Link from 'next/link';
import { usePathname, useParams } from "next/navigation";
import NotFound from '@/app/not-found';

export default function Page() {
  const [config, setConfig] = useState({});
  const [data, setData] = useState({});
  const CurrentData = useRef({}); // 保存済みデータを保持するための参照
  const DataForSave = useRef({}); // データ保存用の参照
  const [notification, setNotification] = useState({
    message: '',
    isVisible: false,
    isError: false, // エラー通知用に追加
  });
  const [Query, setQuery] = useState({});
  const [Username, setUsername] = useState(useParams().username);
  const [IsNotFound, setIsNotFound] = useState(false);
  // 初期データ取得
  useEffect(() => {
    fetchData();

    setInterval(() => {
      document.activeElement.blur() // フォーカスを外す
      PostData()
    }, 1000 * 60)

    //キーハンドラー
    const Keyhandler = (e) => {
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        document.activeElement.blur()//フォーカスを外さないとなぜか上にスクロールされる
        PostData();
      }
    };
    document.addEventListener('keydown', Keyhandler);
    return () => {
      //クリーンアップ関数。必要か分からん
      //   clearInterval(intervalId); 
      document.removeEventListener('keydown', Keyhandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paper_list = data ? Object.keys(data) : [];
  const contents_list = config.contents ? Object.keys(config.contents) : [];
  const pathname = usePathname();
  function PaperRow({ fileName }) {
    const contents = config.contents ? Object.keys(config.contents) : [];

    return (
      <tr className=" border-b-1 border-gray-300">
        <td>
          <Url name={fileName} username={Username} />
        </td>
        {contents.map((contentKey) => {
          const contentConfig = config.contents[contentKey];
          if (contentConfig.type === 'dropdown') {
            return (
              <td key={contentKey} className="">
                <Dropdown
                  option={data[fileName][contentKey]}
                  options={contentConfig.options}
                  onTextChange={(value) => {
                    const tmp_data = { ...DataForSave.current };
                    if (tmp_data[fileName][contentKey] !== value) {
                      tmp_data[fileName][contentKey] = value;
                      DataForSave.current = tmp_data;
                    }
                  }}
                />
              </td>
            );
          } else {
            return (
              <td key={contentKey} className="w-1/5">
                <TruncatedText
                  Text={data[fileName][contentKey]}
                  onTextChange={(value) => {
                    const tmp_data = { ...DataForSave.current };
                    if (tmp_data[fileName][contentKey] !== value) {
                      tmp_data[fileName][contentKey] = value;
                      DataForSave.current = tmp_data;//ここのせいでドロップダウンを変更するたびに再読み込みされる
                    }
                  }}
                />
              </td>
            );
          }
        })}
      </tr>
    );

  }

  const showNotification = useCallback((message, isError = false) => {
    setNotification({ message, isVisible: true, isError });
    // 3秒後に通知を非表示にする
    const timer = setTimeout(() => {
      setNotification({ message: '', isVisible: false, isError: false });
    }, 3000);
    return () => clearTimeout(timer); // クリーンアップ関数
  }, []);

  function InitialData(fetchedData) {
    setConfig(fetchedData.config);
    setData(fetchedData.data);
    CurrentData.current = JSON.parse(JSON.stringify(fetchedData.data));
    //これディープコピーだと上手くいかない
    DataForSave.current = fetchedData.data;
  }

  async function PostData() {
    const response = await fetch('/api/papers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          data: DataForSave.current,
          username: Username, // ユーザー名を追加
        }
      ), // 変更されたデータを送信
    });

    if (!response.ok) {
      throw new Error('POST request failed');
    } else {
      CurrentData.current = JSON.parse(JSON.stringify(DataForSave.current));// 保存後に保存済みデータを更新
      showNotification("Saved", false);
    }
    const responseData = await response.json();
    return responseData;
  }

  async function fetchData(query) {
    query = query || {};
    query.username = Username; // クエリにユーザー名を追加
    // query.["username"]=Username; // クエリにユーザー名を追加
    let data;
    data = await GetData(query, setIsNotFound);
    InitialData(data);
  };

  function Filter({ content }) {
    if (config.contents[content].type !== "dropdown") {
      return (
        <td key={content}>
          {content}
        </td>
      );
    }
    const options = config.contents[content] ? [...config.contents[content].options.values()] : [];
    options.unshift("");
    options.unshift(content); // 最初の要素にcontentを追加
    return (
      <td key={content}>
        <Dropdown
          option={!(Query[content] == undefined) ? Query[content] : content}
          options={options}
          IncludeBlank={false}
          onTextChange={(value) => {
            // Queryに値がないか、異なる場合のみ更新
            if (value === content && !(Query[content] == undefined)) {
              const tmp_query = { ...Query };
              delete tmp_query[content];
              setQuery(tmp_query);
              PostData().then(() => {
                fetchData(tmp_query);
              })
            } else if (value !== content) {
              if (!Query[content] || Query[content] !== value) {
                const tmp_query = { ...Query };
                tmp_query[content] = value;
                setQuery(tmp_query);
                PostData().then(() => {
                  fetchData(tmp_query);
                })
              }
            }
          }}
        />
      </td>
    )
  }
  if (IsNotFound) {
    return <NotFound />
  }
  return (
    <div className="p-5 items-center justify-center bg-white text-black">
      <h1 className="p-0 m-2 text-center text-3xl font-bold"><Link href="/">論文まとめ</Link></h1>
      <div>
        <div className="flex justify-between items-center m-1">

          <p className="">
            論文数 : {paper_list.length}
          </p>
          <div>
            <button
              className="ml-2 px-4 py-2 bg-gray-300 text-gray-800 hover:bg-gray-400 border rounded cursor-pointer"
              onClick={async () => {
                PostData();
              }}
            >
              保存
            </button>
            <Link href={`${pathname}/config`}>
              <button className="ml-2 px-4 py-2 bg-gray-300 text-gray-800 hover:bg-gray-400 border rounded cursor-pointer">
                設定
              </button>
            </Link>
          </div>
        </div>
      </div>
      <table>
        <tbody>
          <tr className="bg-gray-200 text-center">
            <td className="w-1/2">Name</td>
            {contents_list.map((content) => (
              <Filter key={content} content={content}></Filter>
            ))}
          </tr>
          {paper_list.map((fileName) => (
            <PaperRow key={fileName} fileName={fileName} />
          ))}
        </tbody>
      </table>

      {notification.isVisible && (
        <div
          className={`z-10 fixed bottom-4 right-4 px-6 py-3  text-black transition-opacity duration-300 ease-in-out ${notification.isError ? 'text-red-500' : 'text-black'
            }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );

}

async function GetData(query, setIsNotFound) {
  // クエリパラメータをURLに追加
  const url = new URL('/api/papers', window.location.origin);
  // url.searchParams.append('username',Username);
  if (query) {
    Object.keys(query).forEach((key) => {
      url.searchParams.append(key, query[key]);
    });
  }
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      setIsNotFound(true);
    }
    throw new Error('GET request failed');
  }
  const responseData = await response.json();
  return responseData;
}

//使わん
function IsEqual(obj1, obj2) {
  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }
  if (Object.keys(obj1).length > 1) {
    for (const key in obj1) {
      if (IsEqual(obj1[key], obj2[key]) === false) {
        return false;
      }
    }
  } else {
    if (obj1 != obj2) {
      return false;
    }
  }
  return true;
}