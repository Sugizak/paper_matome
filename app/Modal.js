// src/components/ConfirmModal.js
import React from 'react';

const Modal = ({
  message,
  confirmText = 'はい', // デフォルト値
  cancelText = 'いいえ', // デフォルト値
  onConfirm,
  onCancel,
  Show,
  SetShow,
}) => {
  if (!Show) {
    return null; // showがfalseなら何も表示しない
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => SetShow(false)}>
      {/* モーダルコンテンツ */}
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
        {/* メッセージ表示エリア */}
        <p className="text-lg text-gray-800 mb-6">{message}</p>

        {/* ボタンコンテナ */}
        <div className="flex justify-center space-x-4">
          {/* キャンセルボタン */}
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
          >
            {cancelText}
          </button>

          {/* 確認ボタン */}
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      SetShow(false); // Escapeキーでモーダルを閉じる
    }
  }
};

export default Modal;