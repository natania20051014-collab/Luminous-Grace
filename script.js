// JavaScript Document

/*----------------------------------------------------*/
/* スライド（トップイメージ）の初期化 (エラー対策済み) */
/*----------------------------------------------------*/

// 要素が存在する場合のみSwiperを初期化し、エラーによるスクリプト停止を防ぐ
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
/* カウンター（バッグ）関数群 (DOMContentLoadedの外側で定義) */
/*----------------------------------------------------*/

const STORAGE_KEY = 'luminousGraceCart';

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
 * カートの内容をページとヘッダーバッジに反映させる（統合された関数）
 */
function updateDisplay() {
    const cart = loadCart();
    const totalCount = getCartTotalCount(cart);

    // --- 1. ヘッダーのカート点数バッジの更新 ---
    const cartCountElement = document.querySelector('.cart-count'); 
    if (cartCountElement) {
        cartCountElement.textContent = totalCount;
        // 点数が1点以上の場合は表示、0点の場合は非表示
        cartCountElement.style.display = totalCount > 0 ? 'block' : 'none';
    }
    
    // --- 2. bag.htmlの表示を更新 ---
    // (A) かっこ内の数字を更新 (ID: cart-count)
    const mainCartCountElement = document.getElementById('cart-count');
    if (mainCartCountElement) {
        mainCartCountElement.textContent = totalCount;
    }
    
    // (B) メインのテキストを更新 (ID: cart-text)
    const cartTextElement = document.getElementById('cart-text');
    if (cartTextElement) {
        let newInfoText = "";
        if (totalCount === 0) {
            newInfoText = "現在、買い物かごには商品が入っておりません。お買い物を続けるには下の 「お買い物を続ける」 をクリックしてください。";
        } else {
            newInfoText = `買い物かごには現在、${totalCount}点の商品が入っています。`;
        }
        cartTextElement.textContent = newInfoText;
    }
    
    // ... (カートアイテム一覧表示のロジックなど、他の表示更新処理もここに統合する) ...
}


/*----------------------------------------------------*/
/* メニュー/検索トグル処理 および DOM操作のイベントリスナー */
/*----------------------------------------------------*/
document.addEventListener('DOMContentLoaded', function() {
    // DOM要素の取得
    const globalNav = document.querySelector('.global-nav');
    const body = document.body;
    const menuToggle = document.querySelector('.menu-toggle');
    const searchToggle = document.querySelector('.search-toggle');
    const searchOverlay = document.getElementById('search-overlay'); // 検索窓全体
    const searchCloseToggle = document.querySelector('.search-close-toggle'); // 検索を閉じるボタン

    // --- 補助関数 ---
    function closeSearch() {
        if (searchOverlay && searchOverlay.classList.contains('is-active')) {
            searchOverlay.classList.remove('is-active');
            if (searchToggle) {
                searchToggle.setAttribute('aria-expanded', 'false');
            }
            // closeSearchが呼ばれたとき、必ずスクロールロックを更新
            updateScrollLock(); 
        }
    }
    
    function closeMenu() {
        if (globalNav && globalNav.classList.contains('is-open')) {
            globalNav.classList.remove('is-open');
            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'false');
            }
            // closeMenuが呼ばれたとき、必ずスクロールロックを更新
            updateScrollLock(); 
        }
    }
    
    function updateScrollLock() {
        const isMenuOpen = globalNav ? globalNav.classList.contains('is-open') : false;
        const isSearchOpen = searchOverlay ? searchOverlay.classList.contains('is-active') : false;
        
        // メニューまたは検索のどちらかが開いていれば no-scroll を適用
        if (isMenuOpen || isSearchOpen) {
            body.classList.add('no-scroll');
        } else {
            body.classList.remove('no-scroll');
        }
    }


    // --- メニュー開閉イベント ---
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            // 検索窓が開いていたら閉じる
            closeSearch();
            
            // メニューの開閉
            globalNav.classList.toggle('is-open');

            // aria-expanded 属性を更新
            const isExpanded = this.getAttribute('aria-expanded') === 'true' || false;
            this.setAttribute('aria-expanded', !isExpanded);
            
            // スクロールロックの更新
            updateScrollLock();
        });
    }

    // --- 検索窓開閉イベント ---
    if (searchToggle) {
        searchToggle.addEventListener('click', function(event) {
            event.preventDefault();
            
            // 検索窓の開閉
            const isOpen = searchOverlay.classList.toggle('is-active');

            // メニューが開いていたら閉じる
            if (isOpen) {
                closeMenu();
            }

            this.setAttribute('aria-expanded', isOpen);
            
            // スクロールロックの更新
            updateScrollLock();
            
            // 開いた場合、入力フィールドにフォーカス
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
            
            // 検索窓を閉じる
            closeSearch();
            
            // スクロールロックの更新はcloseSearch内で処理される
        });
    }

    
    // --- ⭐️ カート機能のイベント設定 ⭐️ ---
    
    // ページ読み込み時
    updateDisplay(); 

    // 「カートに追加」ボタンのイベント設定
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId || 'default-product'; // IDがない場合は仮のIDを使用
            updateCartItem(productId, 1);
        });
    });

    // 「バッグから削除」ボタンのイベント設定
    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId || 'default-product';
            updateCartItem(productId, -1);
        });
    });

    // --- ⭐️ カートのリセット機能 ⭐️ ---
    const resetCartButton = document.getElementById('reset-cart-btn');

    if (resetCartButton) {
        resetCartButton.addEventListener('click', function() {
            if (confirm('本当にカートの中身をすべてリセットしますか？この操作は元に戻せません。')) {
                // ローカルストレージからカートデータを完全に削除
                localStorage.removeItem(STORAGE_KEY);
                
                // 表示を更新して、バッジの数字を0にする
                updateDisplay();
                
                alert('カートをリセットしました。');
            }
        });
    }
});


/*----------------------------------------------------*/
/* 検索キーワードによるページ遷移の制御（追加） */
/*----------------------------------------------------*/
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-input');

if (searchForm) {
    searchForm.addEventListener('submit', function(event) {
        // フォームのデフォルトの送信動作（Google検索に飛ぶ動作）をキャンセル
        event.preventDefault(); 
        
        // ユーザーが入力したキーワードを取得し、前後のスペースを削除して小文字に変換
        const keyword = searchInput.value.trim().toLowerCase();
        let destinationUrl = null;

        // キーワードに基づいてリダイレクト先を決定
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
                destinationUrl = 'eyeshadow.html'; // あなたのファイル名に合わせる
                break;
            // 必要に応じて、さらにキーワードと対応するURLを追加...
            // 例: case 'バッグ': destinationUrl = 'bag.html'; break;
        }

        if (destinationUrl) {
            // キーワードが一致した場合、指定されたページに遷移
            window.location.href = destinationUrl;
            
            // 遷移後、検索オーバーレイを閉じる（ユーザー体験向上のため）
            closeSearch(); 
            
        } else {
            // キーワードが一致しない場合（デフォルトの検索動作）

            // 1. Google検索に飛ばす処理をしたい場合は、ここで実行します。
            //    ただし、この場合、HTMLの <form> を一旦 Google検索（前々回の修正）に戻す必要があります。
            //
            // 2. または、検索結果がない旨のメッセージを表示します。
            alert(`「${keyword}」に一致する特定の商品ページは見つかりませんでした。`);
        }
    });
}