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
  document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');

  if (tabId === 'historyTab') {
    displayHistory(); // 履歴タブが表示されるときに更新
  }
}

// 注文を追加または編集する関数
async function addOrUpdateOrder() {
  const itemA = parseInt(document.getElementById('itemA').value) || 0;
  const itemB = parseInt(document.getElementById('itemB').value) || 0;
  const itemC = parseInt(document.getElementById('itemC').value) || 0;

  if (!itemA && !itemB && !itemC) {
    alert("少なくとも1つの商品を注文してください。");
    return;
  }

  // 新規注文をFirestoreに追加
  const order = {
    items: { A: itemA, B: itemB, C: itemC },
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  await db.collection("orders").add(order); // Firestoreに保存

  displayOrders();
  displayConfirmOrders();
  document.getElementById('orderForm').reset();
}

// 注文を編集する関数
function editOrder(orderNum) {
  const order = orders.find(o => o.number === orderNum);
  if (order) {
    document.getElementById('itemA').value = order.items.A;
    document.getElementById('itemB').value = order.items.B;
    document.getElementById('itemC').value = order.items.C;
    editingOrderNumber = orderNum; // 編集中の注文番号を記録
    document.getElementById('submitButton').textContent = '更新'; // ボタンのテキストを変更
  }
}

// ローカルストレージに保存する関数
function saveOrders() {
  localStorage.setItem('orders', JSON.stringify(orders));
  localStorage.setItem('historyOrders', JSON.stringify(historyOrders));
  localStorage.setItem('orderNumber', orderNumber);  // 注文番号も保存
}

// 全注文を注文ページに表示する関数
async function displayOrders() {
  const orderDisplay = document.getElementById('orderDisplay');
  orderDisplay.innerHTML = ''; // 前の内容をクリア

  const snapshot = await db.collection("orders").orderBy("timestamp").get();
  snapshot.forEach(doc => {
    const order = doc.data();
    const orderDiv = document.createElement('div');
    orderDiv.className = 'order-item';
    orderDiv.innerHTML = `
      <p>注文番号: ${doc.id}</p>
      <p>マルゲリータ: ${order.items.A}個</p>
      <p>醤油マヨ: ${order.items.B}個</p>
      <p>チョコバナナ: ${order.items.C}個</p>
      <button onclick="editOrder('${doc.id}')">編集</button>
      <button onclick="completeOrder('${doc.id}')">提供完了</button>
    `;
    orderDisplay.appendChild(orderDiv);
  });
}

// 確認ページに注文内容を表示する関数
function displayConfirmOrders() {
  const confirmDisplay = document.getElementById('confirmDisplay');
  confirmDisplay.innerHTML = ''; // 前の内容をクリア

  orders.forEach(order => {
    const confirmDiv = document.createElement('div');
    confirmDiv.className = 'order-item';
    confirmDiv.id = `confirm-${order.number}`;
    confirmDiv.innerHTML = `
      <p>注文番号: ${order.number}</p>
      <p>マルゲリータ: ${order.items.A}個</p>
      <p>醤油マヨ: ${order.items.B}個</p>
      <p>チョコバナナ: ${order.items.C}個</p>
      <button onclick="editOrder(${order.number})">編集</button>
      <button onclick="completeOrder(${order.number})">提供完了</button>
    `;
    confirmDisplay.appendChild(confirmDiv);
  });
}

// 注文を完了し、リストから削除し履歴に追加する関数
function completeOrder(orderNum) {
  const index = orders.findIndex(o => o.number === orderNum);
  if (index !== -1) {
    historyOrders.push(orders[index]); // 履歴に保存
    orders.splice(index, 1); // 配列から削除
  }

  saveOrders(); // ローカルストレージに保存

  document.getElementById(`order-${orderNum}`).remove();
  document.getElementById(`confirm-${orderNum}`).remove();
}

// 履歴ページに注文内容と集計を表示する関数
function displayHistory() {
  const historyDisplay = document.getElementById('historyDisplay');
  historyDisplay.innerHTML = ''; // 前の内容をクリア

  // 集計用の変数
  let totalA = 0;
  let totalB = 0;
  let totalC = 0;

  historyOrders.forEach(order => {
    totalA += order.items.A;
    totalB += order.items.B;
    totalC += order.items.C;

    const historyDiv = document.createElement('div');
    historyDiv.className = 'order-item';
    historyDiv.innerHTML = `
      <p>注文番号: ${order.number}</p>
      <p>マルゲリータ: ${order.items.A}個</p>
      <p>醤油マヨ: ${order.items.B}個</p>
      <p>チョコバナナ: ${order.items.C}個</p>
    `;
    historyDisplay.appendChild(historyDiv);
  });

  // 集計結果を表示
  const totalDisplay = document.getElementById('totalDisplay');
  totalDisplay.innerHTML = `
    <h3>注文数集計</h3>
    <p>マルゲリータ: ${totalA}個</p>
    <p>醤油マヨ: ${totalB}個</p>
    <p>チョコバナナ: ${totalC}個</p>
  `;
}