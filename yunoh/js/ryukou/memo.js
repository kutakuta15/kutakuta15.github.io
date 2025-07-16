// 保存データ
let memoData = localStorage.getItem('memo');
memoData = JSON.parse(memoData) || new Object();

// メモ入力欄
let popup_memo = document.querySelector('#text-memo');

// 選択されているテキストを表示する場所
let popup_selectText = document.getElementById('select-text');

// 選択している要素
let selected;

// 要素選択処理
document.querySelectorAll('.word').forEach(element => {
    element.addEventListener('click', () => {
        selected = element;
        popup_selectText.innerHTML = selected.innerHTML;
        popup_memo.value = memoData[selected.getAttribute('name')] || "";
    });
});

// 入力時保存処理
popup_memo.addEventListener('input', () => {
    if (!selected) return console.error("error: selected is not defined");
    memoData[selected.getAttribute('name')] = popup_memo.value;
    localStorage.setItem('memo', JSON.stringify(memoData));
});