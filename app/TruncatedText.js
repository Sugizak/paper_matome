// "use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

function TruncatedText({ Text = "", limit = "30", editable = true, onTextChange = null }) {
  const [text, setText] = useState(Text);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const componentRef = useRef(null);
  const textareaRef = useRef(null);

  const isTruncated = text.length > limit;

  const displayedText = isExpanded || !isTruncated
    ? text
    : `${text.substring(0, limit)}`;

  const handleTextClick = () => {
    if (!isEditing) {
      if (isExpanded) {
        setIsEditing(true); // 編集モードに切り替える
      }
      setIsExpanded(!isExpanded);
    }
  };

  const handleDoubleClick = () => {
    if (!editable) return; // 編集不可の場合は何もしない
    setIsEditing(true);
    setIsExpanded(true); // 編集時は常に全文表示
  };

  const handleTextareaChange = (event) => {
    setText(event.target.value);
  };

  const handleSave = useCallback(() => {
    setIsEditing(false);
    setIsExpanded(false); // 編集モードを抜けるときに展開状態もfalseにする
    if (onTextChange) {
      onTextChange(text);
    }
  }, [onTextChange, text]);

  // キーボードイベントハンドラを少し変更
  const handleKeyDown = (event) => {

    if (isEditing) { // 編集モードの場合（textareaにフォーカスがある場合）
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSave();
      } else if (event.key === 'Escape') {
        event.preventDefault(); // Escapeキーのデフォルト動作（ブラウザのUIによっては影響があるかも）を防ぐ
        handleSave(); // 編集をキャンセルして閉じる
      }
    } else if (isExpanded) { // 展開モードで編集中でない場合
      if (event.key === 'Enter') {
        event.preventDefault(); // Enterキーのデフォルト動作を防ぐ
        if (!editable) return; // 編集不可の場合は何もしない
        setIsEditing(true); // 編集モードに切り替える
      } else
        if (event.key === 'Escape') {
          event.preventDefault(); // Escapeキーのデフォルト動作を防ぐ
          setIsExpanded(false); // 展開状態を閉じる
        }
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (componentRef.current && !componentRef.current.contains(event.target)) {
        if (isEditing) {
          handleSave();
        }
        if (isExpanded && !isEditing) {
          setIsExpanded(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, isEditing, handleSave]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(text.length, text.length);
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing, text]);

  return (
    // ルートのdivにonKeyDownを設定
    <div
      ref={componentRef}
      onKeyDown={handleKeyDown} // ここにonKeyDownを設定
      tabIndex={isExpanded ? 0 : -1} // 展開時にのみtabIndex=0を設定してフォーカス可能にする（アクセシビリティのため）
      className={`
        relative bg-white rounded-md text-base leading-relaxed box-border
        ${isExpanded || isEditing
          ? 'absolute top-0 left-0 w-full max-w-lg p-2 border border-blue-500 shadow-lg z-50'
          : 'z-10 h- overflow-hidden' /* h-10 (40px) は仮の高さ、内容に合わせて調整 */}
        transition-all duration-200 ease-in-out
      `}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="
            w-full min-h-[80px] p-2 border border-blue-500 rounded-md
            font-sans text-base leading-relaxed box-border resize-y
            focus:outline-none focus:ring-2 focus:ring-blue-400
          "
          value={text}
          onChange={handleTextareaChange}
          onBlur={handleSave}
        />
      ) : (
        <p
          onClick={handleTextClick}
          onDoubleClick={handleDoubleClick}
          className="
            m-0 p-0 cursor-pointer whitespace-pre-wrap break-words min-h-[20px]
            border border-transparent transition-colors duration-100 ease-in-out
            hover:bg-gray-100
          "
        >
          {displayedText}
          {!isExpanded && isTruncated && <span className="text-gray-500">...</span>}
        </p>
      )}
    </div>
  );
}

export default TruncatedText;