// 初期化
let orderNumber = parseInt(localStorage.getItem('orderNumber')) || 1;
const orders = JSON.parse(localStorage.getItem('orders')) || [];
const historyOrders = JSON.parse(localStorage.getItem('historyOrders')) || [];
let editingOrderNumber = null; // 編集中の注文番号

// ページが読み込まれたときにデータを復元
window.onload = function() {
  displayOrders();
  displayConfirmOrders();
  displayHistory();
};

// タブの表示を切り替える
function showTab(tabId) {
  const tabs = document.querySelectorAll('.tab-content');
  const buttons = document.querySelectorAll('.tab-button');

  tabs.forEach(tab => tab.style.display = 'none');
  buttons.forEach(button => button.classList.remove('active'));

  document.getElementById(tabId).style.display = 'block';
  document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');

  if (tabId === 'historyTab') {
    displayHistory(); // 履歴タブが表示されるときに更新
  }
}

// 注文を追加または編集する関数
function addOrUpdateOrder() {
  const itemA = parseInt(document.getElementById('itemA').value) || 0;
  const itemB = parseInt(document.getElementById('itemB').value) || 0;
  const itemC = parseInt(document.getElementById('itemC').value) || 0;

  if (!itemA && !itemB && !itemC) {
    alert("少なくとも1つの商品を注文してください。");
    return;
  }

  if (editingOrderNumber !== null) {
    // 編集中の場合、既存の注文を更新
    const order = orders.find(o => o.number === editingOrderNumber);
    if (order) {
      order.items.A = itemA;
      order.items.B = itemB;
      order.items.C = itemC;
    }
    editingOrderNumber = null;
    document.getElementById('submitButton').textContent = '注文'; // ボタンを元に戻す
  } else {
    // 新規注文を追加
    const order = {
      number: orderNumber,
      items: { A: itemA, B: itemB, C: itemC }
    };
    orders.push(order);

    // 次の注文番号をセット（1～20の範囲で循環）
    orderNumber = orderNumber >= 20 ? 1 : orderNumber + 1;
    localStorage.setItem('orderNumber', orderNumber);
  }

  saveOrders(); // ローカルストレージに保存
  displayOrders();
  displayConfirmOrders();

  // フォームをリセット
  document.getElementById('orderForm').reset();
}

// 注文を編集する関数
function editOrder(orderNum) {
  const order = orders.find(o => o.number === orderNum);
  if (order) {
    document.getElementById('itemA').value = order.items.A;
    document.getElementById('itemB').value = order.items.B;
    document.getElementById('itemC').value = order.items.C;
    editingOrderNumber = orderNum;
    document.getElementById('submitButton').textContent = '注文を更新'; // ボタンを変更
    showTab('orderTab'); // 注文タブに切り替え
  }
}

// 注文を完了する関数
function completeOrder(orderNum) {
  const index = orders.findIndex(o => o.number === orderNum);
  if (index !== -1) {
    historyOrders.push(orders[index]); // 履歴に保存
    orders.splice(index, 1); // 注文リストから削除
  }
  saveOrders(); // データを保存
  displayOrders(); // 注文表示を更新
  displayConfirmOrders(); // 確認ページを更新
}

// 注文リストを表示
function displayOrders() {
  const orderDisplay = document.getElementById('orderDisplay');
  orderDisplay.innerHTML = '';

  orders.forEach(order => {
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    orderItem.innerHTML = `
      <p>注文番号: ${order.number}</p>
      <p>マルゲリータ: ${order.items.A}枚</p>
      <p>醤油マヨ: ${order.items.B}枚</p>
      <p>チョコバナナ: ${order.items.C}枚</p>
      <button onclick="editOrder(${order.number})">編集</button>
      <button onclick="completeOrder(${order.number})">完了</button>
    `;
    orderDisplay.appendChild(orderItem);
  });
}

// 確認ページに表示
function displayConfirmOrders() {
  const confirmDisplay = document.getElementById('confirmDisplay');
  confirmDisplay.innerHTML = '';

  orders.forEach(order => {
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    orderItem.innerHTML = `
      <p>注文番号: ${order.number}</p>
      <p>マルゲリータ: ${order.items.A}枚</p>
      <p>醤油マヨ: ${order.items.B}枚</p>
      <p>チョコバナナ: ${order.items.C}枚</p>
    `;
    confirmDisplay.appendChild(orderItem);
  });
}

// 履歴を表示
function displayHistory() {
  const historyDisplay = document.getElementById('historyDisplay');
  historyDisplay.innerHTML = '';

  historyOrders.forEach(order => {
    const historyItem = document.createElement('div');
    historyItem.className = 'order-item';
    historyItem.innerHTML = `
      <p>注文番号: ${order.number}</p>
      <p>マルゲリータ: ${order.items.A}枚</p>
      <p>醤油マヨ: ${order.items.B}枚</p>
      <p>チョコバナナ: ${order.items.C}枚</p>
    `;
    historyDisplay.appendChild(historyItem);
  });

  // 合計計算
  const totalA = historyOrders.reduce((sum, order) => sum + order.items.A, 0);
  const totalB = historyOrders.reduce((sum, order) => sum + order.items.B, 0);
  const totalC = historyOrders.reduce((sum, order) => sum + order.items.C, 0);

  document.getElementById('totalDisplay').innerHTML = `
    <p>合計マルゲリータ: ${totalA}枚</p>
    <p>合計醤油マヨ: ${totalB}枚</p>
    <p>合計チョコバナナ: ${totalC}枚</p>
  `;
}

// ローカルストレージに保存する関数
function saveOrders() {
  localStorage.setItem('orders', JSON.stringify(orders));
  localStorage.setItem('historyOrders', JSON.stringify(historyOrders));
}
