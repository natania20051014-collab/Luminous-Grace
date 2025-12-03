// JavaScript Document

/*----------------------------------------------------*/
/* グローバル変数と関数 (メニュー/検索の開閉) */
/*----------------------------------------------------*/
// DOMContentLoadedの後に実行されるよう、グローバル関数から呼び出し可能にする

const globalNav = document.querySelector('.global-nav');
const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const searchOverlay = document.getElementById('search-overlay'); // 検索オーバーレイ
const searchToggle = document.querySelector('.search-toggle');

/**
 * スクロールロックの状況を更新する
 * メニューまたは検索のどちらかが開いていれば body に no-scroll を適用
 */
function updateScrollLock() {
    const isMenuOpen = globalNav ? globalNav.classList.contains('is-open') : false;
    const isSearchOpen = searchOverlay ? searchOverlay.classList.contains('is-active') : false;
    
    if (isMenuOpen || isSearchOpen) {
        body.classList.add('no-scroll');
    } else {
        body.classList.remove('no-scroll');
    }
}

/**
 * 検索オーバーレイを閉じる
 */
function closeSearch() {
    if (searchOverlay && searchOverlay.classList.contains('is-active')) {
        searchOverlay.classList.remove('is-active');
        if (searchToggle) {
            searchToggle.setAttribute('aria-expanded', 'false');
        }
        updateScrollLock(); // スクロールロックを解除
    }
}

/**
 * グローバルメニューを閉じる
 */
function closeMenu() {
    if (globalNav && globalNav.classList.contains('is-open')) {
        globalNav.classList.remove('is-open');
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        updateScrollLock(); // スクロールロックを解除
    }
}


/*----------------------------------------------------*/
/* スライダーの初期化 */
/*----------------------------------------------------*/

// 要素が存在する場合のみSwiperを初期化し、エラーによるスクリプト中断を回避
const swiperTopElement = document.querySelector(".swiper__top");
if (swiperTopElement) {
    const swiper__top = new Swiper(swiperTopElement, {
        speed: 750,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        loop: true,
        loopAdditionalSlides: 2,
        pagination: {
            el: ".swiper-pagination"
        },
    });
}

const mySwiperElement = document.querySelector('.card01 .swiper');
if (mySwiperElement) {
    const mySwiper = new Swiper(mySwiperElement, {
        slidesPerView: 1,
        spaceBetween: 24,
        grabCursor: true,

        // ナビゲーション矢印の設定
        navigation: {
            nextEl: '.swiper-pick-next',
            prevEl: '.swiper-pick-prev',
        },

        breakpoints: {
            600: {
                slidesPerView: 2,
            },
            1025: {
                slidesPerView: 4,
                spaceBetween: 32,
            }
        },
    });
}


/*----------------------------------------------------*/
/* カート機能関連変数・関数 */
/*----------------------------------------------------*/

const STORAGE_KEY = 'luminousGraceCart';

// 商品IDと情報を紐づけるデータオブジェクト
const productData = {
    // === リップ商品 (lips.html) ===
    'lip-01': { name: 'ルミナス グロウ リップスティック', image: 'images/lip_01.webp', price: 1650, unit: '円', category: 'リップスティック' },
    'lip-02': { name: 'リップスティックA', image: 'images/lip_02.webp', price: 1430, unit: '円', category: 'リップスティック' },
    'lip-03': { name: 'リップスティックB', image: 'images/lip_03.webp', price: 1430, unit: '円', category: 'リップスティック' },
    'lip-04': { name: 'リップスティックC', image: 'images/lip_04.webp', price: 1540, unit: '円', category: 'リップスティック' },
    
    // === チーク商品 (cheek.html) ===
    'cheek-01': { name: 'ルミナス・ジュエルチーク', image: 'images/cheek_01.webp', price: 1650, unit: '円', category: 'チーク' },
    'cheek-02': { name: 'チークカラーA', image: 'images/cheek_02.webp', price: 1430, unit: '円', category: 'チーク' },
    'cheek-03': { name: 'チークカラーB', image: 'images/cheek_03.webp', price: 1320, unit: '円', category: 'チーク' },
    'cheek-04': { name: 'チークカラーC', image: 'images/cheek_04.webp', price: 1430, unit: '円', category: 'チーク' },
    
    // === アイシャドウ商品 (eyeshadow.html) ===
    'eye-01': { name: 'シルキー　アイシャドウ', image: 'images/eyeshadow_01.webp', price: 1650, unit: '円', category: 'アイシャドウ' },
    'eye-02': { name: 'アイシャドウA', image: 'images/eyeshadow_02.webp', price: 1650, unit: '円', category: 'アイシャドウ' },
    'eye-03': { name: 'アイシャドウB', image: 'images/eyeshadow_03.webp', price: 1540, unit: '円', category: 'アイシャドウ' },
    'eye-04': { name: 'アイシャドウC', image: 'images/eyeshadow_04.webp', price: 1540, unit: '円', category: 'アイシャドウ' },

    // === ギフト商品 (gift.html) ===
    'gift-01': { name: 'ギフト　リップ', image: 'images/gift_01.webp', price: 1430, unit: '円', category: 'ギフト' },
    'gift-02': { name: 'ギフト　チーク ', image: 'images/gift_02.webp', price: 1430, unit: '円', category: 'ギフト' },
    'gift-03': { name: 'ギフト　アイシャドウ', image: 'images/gift_03.webp', price: 1540, unit: '円', category: 'ギフト' },

    // === ピックアップ商品 (pickup.html) ===
    'pick-01': { name: 'ルミナス・ドリーム・ジェム', image: 'images/pick_01.webp', price: 1650, unit: '円', category: 'マスカラ' },
    'pick-02': { name: 'ルミナス・エアーマスカラ', image: 'images/pick_02.webp', price: 1540, unit: '円', category: 'リップグロス' },
    'pick-03': { name: 'プリズムジュエル・リップグロス', image: 'images/pick_03.webp', price: 1650, unit: '円', category: 'リップグロス' },

    // === デフォルト (予備) ===
    'default-product': { name: '未登録の商品', image: 'images/default_product.webp', price: 0, unit: '円', category: 'その他' }
};

/**
 * 金額をカンマ区切りでフォーマットするヘルパー関数
 */
function formatPrice(price) {
    return price.toLocaleString('ja-JP');
}

function loadCart() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function getCartTotalCount(cart) {
    let total = 0;
    for (const quantity of Object.values(cart)) {
        total += quantity;
    }
    return total;
}

/**
 * カートのアイテム数量を増減する（+1 または -1）
 */
function updateCartItem(productId, change) {
    let cart = loadCart();
    const currentQuantity = cart[productId] || 0;
    let newQuantity = currentQuantity + change;
    
    if (newQuantity < 0) {
        newQuantity = 0;
    }

    if (newQuantity > 0) {
        cart[productId] = newQuantity;
    } else {
        delete cart[productId];
    }
    
    saveCart(cart);
    updateDisplay();
}

/**
 * カートの情報をヘッダーとバッグページに反映させる関数
 * * 合計点数/合計金額の表示を更新
 * * bag.htmlの商品リスト表示を更新
 */

function updateDisplay() {
    const cart = loadCart();
    const totalCount = getCartTotalCount(cart);
    let totalPrice = 0; // 合計金額を計算するための変数

    // --- 1. ヘッダーのカート点数バッジの更新 ---
    const cartCountElement = document.querySelector('.cart-count'); 
    if (cartCountElement) {
        cartCountElement.textContent = totalCount;
        cartCountElement.style.display = totalCount > 0 ? 'block' : 'none';
    }

    // --- 2. bag.htmlの表示を更新 ---
    const mainCartCountElement = document.getElementById('cart-count');
    const cartTextElement = document.getElementById('cart-text');
    const itemsContainer = document.getElementById('cart-items-container'); // 商品リストのコンテナ
    const totalSummaryElement = document.getElementById('cart-total-price'); // 合計金額の要素
    const totalSummarySection = document.getElementById('cart-total-summary-section'); // 合計金額のセクション

    let itemsHtml = ''; // 商品リストのHTMLを格納する変数
    
    // (A) 商品リストのHTMLを動的に生成
    if (itemsContainer) {
        const cartItemsArray = Object.entries(cart);
        
        // カートが空の場合は合計金額セクションを非表示にする
        if (totalSummarySection) {
             totalSummarySection.style.display = cartItemsArray.length === 0 ? 'none' : 'block';
        }
        
        // カートアイテムがない場合
        if (cartItemsArray.length === 0) {
            itemsContainer.innerHTML = '';
        } else {
            for (const [productId, quantity] of cartItemsArray) {
                // productData[productId] が存在しない場合に備えてフォールバック
                const product = productData[productId] || productData['default-product']; 
                
                const itemTotal = product.price * quantity;
                totalPrice += itemTotal; // 合計金額に加算

                // 💡 修正済み: HTMLの表示順を「名前 → カテゴリー → 価格」に変更
                itemsHtml += `
                    <div class="cart-item-flex-container" data-product-id="${productId}">
                        
                        <div class="cart-item-image">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        
                        <div class="cart-item-info">
                            <p class="cart-item-name"><strong>${product.name}</strong></p>
                            <p class="cart-item-category">${product.category || 'カテゴリー不明'}</p>
                            <p class="cart-item-price">${formatPrice(product.price)}${product.unit} / 個</p>
                        </div>
                        
                        <div class="cart-item-quantity-control">
                            <button class="quantity-minus-btn" data-product-id="${productId}">-</button>
                            <span class="quantity-display">${quantity}</span>
                            <button class="quantity-plus-btn" data-product-id="${productId}">+</button>
                        </div>
                        
                        <div class="cart-item-actions">
                            <p class="cart-item-subtotal">小計: ${formatPrice(itemTotal)}${product.unit}</p>
                            <button class="remove-item-btn" data-product-id="${productId}">削除</button>
                        </div>
                    </div>
                `;
            }
        }

        itemsContainer.innerHTML = itemsHtml; // HTMLコンテナにリストを挿入
    }
    
    // (B) メインのテキストを更新 (ID: cart-text)
    if (cartTextElement) {
        if (totalCount === 0) {
            cartTextElement.textContent = "現在、買い物かごには商品が入っておりません。お買い物を続けるには下の 「お買い物を続ける」 をクリックしてください。";
        } else {
            cartTextElement.textContent = `買い物かごには現在、合計 ${totalCount}点の商品が入っています。`;
        }
    }
    
    // (C) 合計点数の更新 (ID: cart-count)
    if (mainCartCountElement) {
        mainCartCountElement.textContent = totalCount;
    }
    
    // (D) 合計金額の表示を更新
    if (totalSummaryElement) {
        totalSummaryElement.textContent = formatPrice(totalPrice);
    }
    
    // (E) 数量変更/削除ボタンのイベントリスナーを再設定 (動的に生成されるため)
    document.querySelectorAll('.quantity-plus-btn').forEach(button => {
        button.addEventListener('click', () => updateCartItem(button.dataset.productId, 1));
    });
    document.querySelectorAll('.quantity-minus-btn').forEach(button => {
        button.addEventListener('click', () => updateCartItem(button.dataset.productId, -1));
    });
    
    // 削除ボタンのイベントリスナー（.remove-item-btn）
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            let cart = loadCart();
            delete cart[productId];
            saveCart(cart);
            updateDisplay(); // 表示を更新
        });
    });
}


/*----------------------------------------------------*/
/* DOM構築後のイベントリスナー (DOMContentLoaded) */
/*----------------------------------------------------*/
document.addEventListener('DOMContentLoaded', function() {
    // DOM構築後 のみ有効な要素を変数に格納
    const searchCloseToggle = document.querySelector('.search-close-toggle'); // 検索を閉じるボタン

    // --- メニュー開閉イベント ---
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            // 検索ウィンドウが開いていれば閉じる
            closeSearch();
            
            // メニューの開閉
            globalNav.classList.toggle('is-open');

            // aria-expanded 属性を更新
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            
            // スクロールロックの更新
            updateScrollLock();
        });
    }

    // --- 検索開閉イベント ---
    if (searchToggle) {
        searchToggle.addEventListener('click', function(event) {
            event.preventDefault();
            
            // 検索ウィンドウの開閉
            const isOpen = searchOverlay.classList.toggle('is-active');

            // メニューが開いていれば閉じる
            if (isOpen) {
                closeMenu();
            }

            this.setAttribute('aria-expanded', isOpen);
            
            // スクロールロックの更新
            updateScrollLock();
            
            // 開いている場合は検索フィールドにフォーカス
            if (isOpen) {
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
    }

    // --- 閉じるボタンイベント ---
    if (searchCloseToggle) {
        searchCloseToggle.addEventListener('click', function(event) {
            event.preventDefault();
            
            // 検索ウィンドウを閉じる (グローバル関数 closeSearch を呼び出す)
            closeSearch();
        });
    }

    
    // --- ** カート関連のイベントリスナー設定 ** ---
    
    // ページ読み込み時
    updateDisplay(); 

    // 「カートに追加」ボタンのイベントリスナー (静的HTMLのボタン)
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId || 'default-product'; // IDがない場合は予備のIDを使用
            updateCartItem(productId, 1);
        });
    });

    // 「カートから削除」ボタンのイベントリスナー (静的HTMLのボタン)
    // NOTE: updateDisplay内で動的に生成される削除ボタンとは別に、商品詳細ページなどで使用されている可能性を考慮して残します。
    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId || 'default-product';
            updateCartItem(productId, -1);
        });
    });

    // --- ** カートのリセット機能 ** ---
    const resetCartButton = document.getElementById('reset-cart-btn');

    if (resetCartButton) {
        resetCartButton.addEventListener('click', function() {
            if (confirm('本当にカートの中身をすべて消去してリセットしますか？この操作は元に戻せません。')) {
                // ローカルストレージからカートのデータを完全に削除
                localStorage.removeItem(STORAGE_KEY);
                
                // 表示を更新して、アイテムの数を0にする
                updateDisplay();
                
                alert('カートをリセットしました。');
            }
        });
    }
});


/*----------------------------------------------------*/
/* 検索キーワードによるページ遷移の制御 */
/*----------------------------------------------------*/
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-input');

if (searchForm) {
    searchForm.addEventListener('submit', function(event) {
        // フォームのデフォルトの送信処理（Google検索に飛ばす処理）をキャンセル
        event.preventDefault(); 
        
        // ユーザーが入力したキーワードを取得し、前後の空白と大文字を小文字に変換
        const keyword = searchInput.value.trim().toLowerCase();
        let destinationUrl = null;

        // キーワードに対応するURLを決定
        switch (keyword) {
            case 'リップ':
            case 'りっぷ':
            case 'lip':
                destinationUrl = 'lips.html';
                break;
            case 'チーク':
            case 'ちーく':
            case 'cheek':
                destinationUrl = 'cheek.html';
                break;
            case 'アイシャドウ':
            case 'あいしゃどう':
            case 'eyeshadow':
                destinationUrl = 'eyeshadow.html';
                break;

            case 'ギフト':
            case 'ぎふと':
            case 'gift':
                destinationUrl = 'gift.html';
                break;

            case 'ピックアップ':
            case 'ぴっくあっぷ':
            case 'pickup':
             　　destinationUrl = 'pickup.html';
                break;
            // 必要に応じて、さらにキーワードと対応するURLを追加...
            // 例: case 'バッグ': destinationUrl = 'bag.html'; break;
        }

        if (destinationUrl) {
            // キーワードが一致した場合に、該当するページに遷移
            window.location.href = destinationUrl;
            
            // 遷移後に検索オーバーレイを閉じる (グローバル関数 closeSearch を呼び出す)
            closeSearch(); 
            
        } else {
            // キーワードが一致しない場合（デフォルトの検索処理）
            alert(`「${keyword}」に一致する特別な商品ページは見つかりませんでした。`);
        }
    });
}