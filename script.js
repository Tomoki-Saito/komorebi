// ---- ここから：公開用に足した部分 ----
// アプリの中では、予約を「お店の保存場所」が預かっていました。公開したページには、その保存場所がありません。
// 代わりに、このページを開いたブラウザーの中に予約を残します。ほかの人のブラウザーには届きません。
var shopStore = (function () {
  var KEY = 'komorebi-reservations'
  function read() {
    try {
      var value = JSON.parse(localStorage.getItem(KEY) || '[]')
      return Array.isArray(value) ? value : []
    } catch (error) {
      return []
    }
  }
  return {
    add: function (item) {
      var items = read()
      if (items.length >= 50) throw new Error('予約を残せるのは 50 件までです。')
      items.push(item)
      try {
        localStorage.setItem(KEY, JSON.stringify(items))
      } catch (error) {
        throw new Error('このブラウザーでは、予約を残せませんでした。')
      }
      return items.length
    },
    list: function () {
      return read()
    },
  }
})()
// ---- ここまで：公開用に足した部分 ----

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

// 今日の日付を「2030-04-01」の形の文字で返します。
function todayText() {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return today.getFullYear() + '-' + month + '-' + day
}

// 日付の欄に、今日の日付を入れておきます。
const reserveDate = document.getElementById('reserve-date')
reserveDate.value = todayText()

// 「予約する」を押したら、入力された内容を受け付けます。
const reserveButton = document.getElementById('reserve-button')
const reserveMessage = document.getElementById('reserve-message')
reserveButton.addEventListener('click', function () {
  const guest = document.getElementById('reserve-name').value
  const date = reserveDate.value
  const people = document.getElementById('reserve-people').value

  // 名前が空のときは、受け付けません。
  if (guest === '') {
    reserveMessage.textContent = 'お名前を入力してください。'
    return
  }

  // 今日より前の日付は、受け付けません。
  if (date < todayText()) {
    reserveMessage.textContent = '今日か、今日より後の日付を選んでください。'
    return
  }

  // 人数は 1〜8 名だけ受け付けます。
  if (people < 1 || people > 8) {
    reserveMessage.textContent = '1 回のご予約は、1〜8 名でお願いします。'
    return
  }

  // 受け付けた予約を、お店の保存場所に預けます。入力欄の値は文字なので、人数は Number() で数に直します。
  shopStore.add({ name: guest, date: date, people: Number(people) })
  reserveMessage.textContent = guest + ' 様、' + date + ' に ' + people + ' 名でご予約を受け付けました。（これまでのご予約：' + shopStore.list().length + ' 件）ご来店をお待ちしています。'
})

// 保存してある予約を取り出して、店長用の一覧に並べます。
const saved = shopStore.list()
const reserveList = document.getElementById('reserve-list')
for (const item of saved) {
  const li = document.createElement('li')
  li.textContent = item.date + ' ' + item.name + ' さん ' + item.people + ' 名'
  reserveList.appendChild(li)
}

// 予約の一覧を受け取って、人数の合計を返します。
function sumPeople(list) {
  let total = 0
  for (const item of list) {
    // 人数が文字で入っていても足せるように、Number() で数に直します。
    total = total + Number(item.people)
  }
  return total
}

// 予約の組数と、合計の人数を表示します。
const reserveCount = document.getElementById('reserve-count')
reserveCount.textContent = '全部で ' + saved.length + ' 組、合計 ' + sumPeople(saved) + ' 名'

// ここから下は、テストです。ページを開くたびに動いて、結果をコンソールに出します。
// 実際の結果と、期待する結果が同じなら ✓、違えば ✗ を出します。
function expectEqual(label, actual, expected) {
  if (actual === expected) {
    console.log('✓ ' + label)
  } else {
    console.log('✗ ' + label + '（結果は ' + actual + '、期待は ' + expected + '）')
  }
}

// テストを、この中に並べます。
function runTests() {
  expectEqual('2 名と 4 名で、合計 6 名', sumPeople([{ people: 2 }, { people: 4 }]), 6)
  expectEqual('人数が文字でも、数として足す', sumPeople([{ people: 3 }, { people: '2' }]), 5)
  expectEqual('予約が 0 件なら、合計 0 名', sumPeople([]), 0)
}
runTests()
