// ==========================================================================
// 🚀 1. 設定你的 GAS API 網址與安全暗號
// ==========================================================================
const GAS_URL = "https://script.google.com/macros/s/AKfycbxRiFJIqtXrecqqm6eAhW5svFkyNiHXIAZQCpR8_bSdK2x4-WmGhP5tdIhoAfMERaxCWA/exec";

// 🔒 與 GAS 後台對齊的安全暗號（若之後在 GAS 修改了暗號，記得這裡也要同步修改）
const API_KEY = "melodyKOKOKO123"; 

// 取得 HTML 中的核心元件
const streakDaysEl = document.getElementById('streak-days');
const totalCountEl = document.getElementById('total-count');
const fetchBtn = document.getElementById('fetch-btn');
const cardContainer = document.getElementById('card-container');

// ==========================================================================
// 📊 2. 網頁初始載入：去 Google Sheets 撈取打卡數據
// ==========================================================================
function loadDashboardData() {
    // 呼叫 GAS，帶上功能參數並「附上安全暗號」
    fetch(`${GAS_URL}?action=dashboard&apiKey=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            // 檢查後端是否回傳權限錯誤
            if (data.error) {
                console.error("🔒 安全驗證失敗:", data.message);
                streakDaysEl.innerText = "🔑";
                totalCountEl.innerText = "🔑";
                return;
            }
            // 順利拿到資料後，動態更新畫面的數字
            streakDaysEl.innerText = data.streakDays || 0;
            totalCountEl.innerText = data.totalCount || 0;
        })
        .catch(err => {
            console.error("❌ 撈取儀表板數據失敗:", err);
            streakDaysEl.innerText = "!";
            totalCountEl.innerText = "!";
        });
}

// 網頁一打開，立刻執行
loadDashboardData();

// ==========================================================================
// 📖 3. 點擊按鈕：動態生成 5 張可 3D 翻轉的職場句型卡
// ==========================================================================
fetchBtn.addEventListener('click', () => {
    // 改變按鈕文字狀態，營造載入中的質感
    fetchBtn.disabled = true;
    fetchBtn.innerHTML = "<span>🔄 正在從雲端盲抽句型...</span>";
    
    // 每次點擊，先把舊的卡片清空
    cardContainer.innerHTML = "";

    // 呼叫 GAS 的卡片模式，同樣「附上安全暗號」
    fetch(`${GAS_URL}?action=cards&apiKey=${API_KEY}`)
        .then(response => response.json())
        .then(cards => {
            
            // 檢查是否因為暗號錯誤或其他原因被後端拒絕
            if (cards.error) {
                alert(`驗證失敗: ${cards.message || "請檢查 API Key 設定"}`);
                return;
            }

            // 檢查是否順利拿到陣列資料
            if (!Array.isArray(cards)) {
                alert("句型庫似乎空空的或找不到喔！請先確保試算表有『句型庫』分頁。");
                return;
            }

            // 用迴圈把 5 筆句型資料依序「生出」對應的 3D HTML 結構
            cards.forEach((item, index) => {
                
                // 創建最外層的 3D 舞台
                const stage = document.createElement('div');
                stage.className = 'card-stage';
                
                // 設定一點點微幅的登場延遲動畫（Delay），讓卡片有一階一階彈出的高級感
                stage.style.animation = `fadeInUp 0.4s ease forwards ${index * 0.1}s`;
                stage.style.opacity = '0'; // 配合動畫初始狀態
                
                // 塞入正反面 HTML 結構（完美對齊 style.css 的類別名稱）
                stage.innerHTML = `
                    <div class="card-inner">
                        <div class="card-front">
                            <span>📖 ${item.sentence}</span>
                        </div>
                        <div class="card-back">
                            <span>💡 ${item.meaning}</span>
                        </div>
                    </div>
                `;

                // ✨ 關鍵核心：幫這張「剛出生」的卡片綁定手指點擊翻轉事件
                const cardInner = stage.querySelector('.card-inner');
                cardInner.addEventListener('click', () => {
                    cardInner.classList.toggle('is-flipped');
                });

                // 將組裝好的卡片舞台，塞進大盒子裡
                cardContainer.appendChild(stage);
            });
        })
        .catch(err => {
            console.error("❌ 撈取句型卡失敗:", err);
            alert("連線到 Google Sheets 失敗，請檢查網路或 GAS URL");
        })
        .finally(() => {
            // 還原按鈕原本的英姿
            fetchBtn.disabled = false;
            fetchBtn.innerHTML = "<span>📖 探索今日職場句型 (隨機 5 個)</span>";
        });
});

// 補充一個精緻的進場小動畫 CSS 注入（讓卡片吐出來時由下往上飄）
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(styleSheet);

// ==========================================================================
// 🤖 4. PWA 服務註冊
// ==========================================================================
// 註冊 PWA Service Worker 管家
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('✅ PWA Service Worker 註冊成功！'))
            .catch(err => console.log('❌ 註冊失敗:', err));
    });
}