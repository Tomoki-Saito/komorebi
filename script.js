// お店の情報を、ここにまとめます。
const phone = '03-0000-5678'
const hours = '11:00〜15:00'

// 電話番号を、ページの 3 か所に表示します。
document.getElementById('phone-header').textContent = phone
document.getElementById('phone-reserve').textContent = phone
document.getElementById('phone-footer').textContent = phone

// 営業時間を表示します。
document.getElementById('hours').textContent = hours

// メニューのデータです。1 品ごとに、名前と値段を持っています。
const menu = [
  { name: '日替わり定食', price: 750 },
  { name: '焼き魚定食', price: 850 },
  { name: 'からあげ定食', price: 800 },
  { name: '季節の小鉢定食', price: 1080 },
]

// 値上げした後の値段を返します。
function raisedPrice(price) {
  return price + 100
}

// 税込の値段を返します（消費税 10%）。
// 小数の 1.1 を掛けると小さなずれが出るので、整数の 110 を掛けてから 100 で割ります。
function priceWithTax(price) {
  return price * 110 / 100
}

// メニューを 1 品ずつ取り出して、ページに並べます。
const menuList = document.getElementById('menu-list')
for (const item of menu) {
  const price = raisedPrice(item.price)
  const li = document.createElement('li')
  li.textContent = item.name + ' ' + price + ' 円（税込 ' + priceWithTax(price) + ' 円）'
  menuList.appendChild(li)
}

// 今が営業中かどうかを返します。営業時間は 11:00〜15:00、定休日は日曜です。
function isOpen(now) {
  const day = now.getDay()
  const hour = now.getHours()
  // 日曜（0）は定休日です。
  if (day === 0) {
    return false
  }
  // 15 時ちょうどは、もう閉まっています。
  if (hour >= 11 && hour < 15) {
    return true
  }
  return false
}

// 今の日時で調べて、結果を表示します。
const now = new Date()
const openStatus = document.getElementById('open-status')
if (isOpen(now)) {
  openStatus.textContent = 'ただいま営業中です'
} else {
  openStatus.textContent = 'ただいま準備中です'
}

// ボタンを押すたびに、メニューを開いたり閉じたりします。
const menuButton = document.getElementById('menu-button')
menuButton.addEventListener('click', function () {
  if (menuList.hidden) {
    menuList.hidden = false
    menuButton.textContent = 'メニューを閉じる'
  } else {
    menuList.hidden = true
    menuButton.textContent = 'メニューを見る'
  }
})
