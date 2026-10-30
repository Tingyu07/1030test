
/* =========================================================
   API 設定
   ========================================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbyjD4GIuTHJLo6wdPZmBmZLR8iJFYIBvwF6_nXqelDGJEzMHqps-bZGG3gmWilnz9_v/exec";


/* =========================================================
   STATE
   ========================================================= */

const state = {
    services: [],
    cart: new Map(),
    admin: false
};


/* =========================================================
   DOM
   ========================================================= */

const menuGrid =
    document.querySelector(".menu-grid");

const cartItems =
    document.querySelector(".cart-items");

const cartCount =
    document.querySelector(".cart-count");

const cartTotal =
    document.querySelector(".cart-total strong");

const serviceCount =
    document.querySelector(".service-count");

const customerName =
    document.querySelector("#customerName");

const orderButton =
    document.querySelector(".customer-area .primary-button");

const adminToggle =
    document.querySelector(".admin-toggle");

const adminPanelWrap =
    document.querySelector(".admin-panel-wrap");

const adminForm =
    document.querySelector(".admin-form");

const addServiceButton =
    document.querySelector(".form-submit .primary-button");

const loadingOverlay =
    document.querySelector(".loading-overlay");

const loadingLabel =
    document.querySelector(".loading-label");

const toast =
    document.querySelector(".toast");


/* =========================================================
   API 檢查
   ========================================================= */

function apiReady() {

    return (
        API_URL &&
        !API_URL.includes("請貼上你的_") &&
        /^https?:\/\//i.test(API_URL)
    );

}


/* =========================================================
   HTML 防護
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   金額格式
   ========================================================= */

function money(value) {

    return new Intl.NumberFormat(
        "zh-TW",
        {
            style: "currency",
            currency: "TWD",
            maximumFractionDigits: 0
        }
    ).format(Number(value) || 0);

}


/* =========================================================
   Loading
   ========================================================= */

function showLoading(text = "處理中...") {

    loadingLabel.textContent = text;

    loadingOverlay.classList.add("show");

}


function hideLoading() {

    loadingOverlay.classList.remove("show");

}


/* =========================================================
   Toast
   ========================================================= */

let toastTimer;


function showToast(
    message,
    type = "success"
) {

    clearTimeout(toastTimer);

    toast.textContent = message;

    toast.className =
        "toast show" +
        (type === "error" ? " error" : "");

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3200);

}


/* =========================================================
   預設圖片
   ========================================================= */

function fallbackSVG() {

    return `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 800 480">

            <defs>

                <linearGradient
                    id="g"
                    x1="0"
                    x2="1">

                    <stop
                        stop-color="#edf8f6" />

                    <stop
                        offset="1"
                        stop-color="#b9e8e2" />

                </linearGradient>

            </defs>

            <rect
                width="800"
                height="480"
                fill="url(#g)" />

            <circle
                cx="400"
                cy="205"
                r="78"
                fill="#fff"
                fill-opacity=".65" />

            <text
                x="400"
                y="230"
                text-anchor="middle"
                font-size="74"
                fill="#155e63">
                ♥
            </text>

            <text
                x="400"
                y="335"
                text-anchor="middle"
                font-family="Arial"
                font-size="30"
                font-weight="700"
                fill="#28585b">
                PET MEDICAL SERVICE
            </text>

        </svg>
    `;

}


/* =========================================================
   Service 資料標準化
   ========================================================= */

function normalizeService(raw, index) {

    return {

        id:
            String(
                raw.id ??
                raw.ID ??
                index + 1
            ).trim(),

        name:
            String(
                raw.name ??
                raw["名稱"] ??
                "未命名服務"
            ),

        category:
            String(
                raw.category ??
                raw["分類"] ??
                "檢測"
            ),

        description:
            String(
                raw.description ??
                raw["描述"] ??
                ""
            ),

        price:
            Number(
                raw.price ??
                raw["價格"] ??
                0
            ) || 0,

        image:
            String(
                raw.image ??
                raw.imageUrl ??
                raw["圖片網址"] ??
                ""
            ).trim()

    };

}


/* =========================================================
   Render Services
   ========================================================= */

function renderServices() {

    serviceCount.textContent =
        `${state.services.length} 項服務`;


    if (!state.services.length) {

        menuGrid.innerHTML = `
            <div class="state-card">

                目前沒有服務項目。

                <br>

                管理員可切換模式後新增服務。

            </div>
        `;

        return;

    }


    menuGrid.innerHTML =
        state.services
            .map((service, index) => {

                const image =
                    service.image ||
                    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                        fallbackSVG()
                    )}`;


                return `

                    <article
                        class="service-card"
                        style="animation-delay:${-(index % 4) * 0.8}s">

                        <button
                            class="delete-service"
                            type="button"
                            data-delete-id="${escapeHTML(service.id)}"
                            title="刪除服務"
                            aria-label="刪除 ${escapeHTML(service.name)}">

                            ⌫

                        </button>


                        <div class="service-image-wrap">

                            <img
                                class="service-image"
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(service.name)}">

                        </div>


                        <div class="service-body">

                            <div class="service-topline">

                                <div class="service-name">
                                    ${escapeHTML(service.name)}
                                </div>

                                <span class="category-badge">
                                    ${escapeHTML(service.category)}
                                </span>

                            </div>


                            <div class="service-desc">

                                ${escapeHTML(
                                    service.description ||
                                    "暫無服務說明"
                                )}

                            </div>


                            <div class="service-bottom">

                                <div class="price">
                                    ${money(service.price)}
                                </div>

                                <button
                                    class="add-button"
                                    type="button"
                                    data-add-id="${escapeHTML(service.id)}">

                                    加入服務項目

                                </button>

                            </div>

                        </div>

                    </article>

                `;

            })
            .join("");


    /*
     * 不使用 HTML inline onerror
     * 改由 JavaScript 統一處理圖片錯誤
     */

    const images =
        menuGrid.querySelectorAll(".service-image");


    images.forEach(image => {

        image.addEventListener(
            "error",
            () => {

                image.onerror = null;

                image.src =
                    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                        fallbackSVG()
                    )}`;

            }
        );

    });

}


/* =========================================================
   Render Cart
   ========================================================= */

function renderCart() {

    const entries =
        [...state.cart.entries()];


    const totalQty =
        entries.reduce(
            (total, [, quantity]) =>
                total + quantity,
            0
        );


    cartCount.textContent =
        totalQty;


    if (!entries.length) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                尚未加入服務項目

                <br>

                請從左側選擇需要的服務。

            </div>

        `;

        cartTotal.textContent =
            money(0);

        return;

    }


    let total = 0;


    cartItems.innerHTML =
        entries
            .map(([id, quantity]) => {

                const service =
                    state.services.find(
                        item => item.id === id
                    );


                if (!service) {

                    return "";

                }


                const subtotal =
                    service.price * quantity;


                total += subtotal;


                return `

                    <div class="cart-item">

                        <div class="cart-item-top">

                            <div class="cart-item-name">
                                ${escapeHTML(service.name)}
                            </div>

                            <div class="cart-item-subtotal">
                                ${money(subtotal)}
                            </div>

                        </div>


                        <div class="qty-row">

                            <span class="unit-price">
                                單價 ${money(service.price)}
                            </span>


                            <div class="qty-controls">

                                <button
                                    class="qty-btn"
                                    type="button"
                                    data-cart-action="minus"
                                    data-id="${escapeHTML(id)}">

                                    −

                                </button>


                                <span class="qty-value">
                                    ${quantity}
                                </span>


                                <button
                                    class="qty-btn"
                                    type="button"
                                    data-cart-action="plus"
                                    data-id="${escapeHTML(id)}">

                                    ＋

                                </button>

                            </div>

                        </div>

                    </div>

                `;

            })
            .join("");


    cartTotal.textContent =
        money(total);

}


/* =========================================================
   加入購物車
   ========================================================= */

function addToCart(id) {

    state.cart.set(
        id,
        (state.cart.get(id) || 0) + 1
    );

    renderCart();

    showToast("已加入服務項目");

}


/* =========================================================
   修改數量
   ========================================================= */

function changeQty(id, delta) {

    const next =
        (state.cart.get(id) || 0) +
        delta;


    if (next <= 0) {

        state.cart.delete(id);

    } else {

        state.cart.set(
            id,
            next
        );

    }


    renderCart();

}


/* =========================================================
   GET API
   ========================================================= */

async function fetchServices() {

    if (!apiReady()) {

        menuGrid.innerHTML = `

            <div class="state-card">

                尚未設定 API_URL。

                <br>

                請先設定 Apps Script Web App 網址。

            </div>

        `;

        showToast(
            "請先設定 API_URL",
            "error"
        );

        return;

    }


    showLoading(
        "正在載入服務資料..."
    );


    try {

        const response =
            await fetch(
                `${API_URL}?action=read`,
                {
                    method: "GET"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        if (result.status !== "success") {

            throw new Error(
                result.message ||
                "讀取服務資料失敗"
            );

        }


        state.services =
            (
                Array.isArray(result.data)
                    ? result.data
                    : []
            )
            .map(normalizeService);


        const validIds =
            new Set(
                state.services.map(
                    service => service.id
                )
            );


        for (const id of state.cart.keys()) {

            if (!validIds.has(id)) {

                state.cart.delete(id);

            }

        }


        renderServices();

        renderCart();

    } catch (error) {

        console.error(error);


        menuGrid.innerHTML = `

            <div class="state-card">

                讀取服務資料失敗

                <br>

                ${escapeHTML(error.message)}

            </div>

        `;


        showToast(
            error.message ||
            "讀取服務資料失敗",
            "error"
        );

    } finally {

        hideLoading();

    }

}


/* =========================================================
   POST API
   ========================================================= */

async function postJSON(
    payload,
    loadingText
) {

    if (!apiReady()) {

        showToast(
            "請先設定 API_URL",
            "error"
        );

        throw new Error(
            "API_URL 尚未設定"
        );

    }


    showLoading(
        loadingText
    );


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        if (result.status !== "success") {

            throw new Error(
                result.message ||
                "後端處理失敗"
            );

        }


        return result;

    } finally {

        hideLoading();

    }

}


/* =========================================================
   管理員模式
   ========================================================= */

adminToggle.addEventListener(
    "click",
    () => {

        state.admin =
            !state.admin;


        document.body.classList.toggle(
            "admin-mode",
            state.admin
        );


        adminPanelWrap.classList.toggle(
            "open",
            state.admin
        );


        adminToggle.classList.toggle(
            "active",
            state.admin
        );


        adminToggle.textContent =
            state.admin
                ? "離開管理員模式"
                : "切換為管理員模式";

    }
);


/* =========================================================
   Service Click
   ========================================================= */

menuGrid.addEventListener(
    "click",
    async event => {

        const addButton =
            event.target.closest(
                "[data-add-id]"
            );


        if (addButton) {

            addToCart(
                addButton.dataset.addId
            );

            return;

        }


        const deleteButton =
            event.target.closest(
                "[data-delete-id]"
            );


        if (!deleteButton) {

            return;

        }


        const id =
            deleteButton.dataset.deleteId;


        const service =
            state.services.find(
                item => item.id === id
            );


        const confirmed =
            window.confirm(
                `確定要刪除「${service?.name || id}」嗎？\n` +
                "刪除後將同步移除 Google 試算表中的資料。"
            );


        if (!confirmed) {

            return;

        }


        try {

            const result =
                await postJSON(
                    {
                        action: "delete",
                        id: id
                    },
                    "正在刪除服務項目..."
                );


            showToast(
                result.message ||
                "服務項目已刪除"
            );


            await fetchServices();

        } catch (error) {

            console.error(error);


            showToast(
                error.message ||
                "刪除失敗",
                "error"
            );

        }

    }
);


/* =========================================================
   Cart Click
   ========================================================= */

cartItems.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-cart-action]"
            );


        if (!button) {

            return;

        }


        changeQty(
            button.dataset.id,

            button.dataset.cartAction === "plus"
                ? 1
                : -1
        );

    }
);


/* =========================================================
   Admin Form
   ========================================================= */

adminForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (!adminForm.checkValidity()) {

            adminForm.reportValidity();

            return;

        }


        const formData =
            new FormData(adminForm);


        const payload = {

            action: "add",

            name:
                String(
                    formData.get("name") || ""
                ).trim(),

            category:
                String(
                    formData.get("category") || ""
                ).trim(),

            description:
                String(
                    formData.get("description") || ""
                ).trim(),

            price:
                Number(
                    formData.get("price") || 0
                ),

            imageUrl:
                String(
                    formData.get("image") || ""
                ).trim()

        };


        addServiceButton.disabled =
            true;


        try {

            const result =
                await postJSON(
                    payload,
                    "正在新增服務項目..."
                );


            showToast(
                result.message ||
                "服務項目新增成功"
            );


            adminForm.reset();


            await fetchServices();

        } catch (error) {

            console.error(error);


            showToast(
                error.message ||
                "新增服務項目失敗",
                "error"
            );

        } finally {

            addServiceButton.disabled =
                false;

        }

    }
);


/* =========================================================
   Order
   ========================================================= */

orderButton.addEventListener(
    "click",
    async () => {

        const name =
            customerName.value.trim();


        if (!name) {

            customerName.focus();

            showToast(
                "請先輸入顧客姓名",
                "error"
            );

            return;

        }


        if (!state.cart.size) {

            showToast(
                "請至少加入一項服務",
                "error"
            );

            return;

        }


        const items =
            [...state.cart.entries()]
                .map(([id, quantity]) => {

                    const service =
                        state.services.find(
                            item => item.id === id
                        );


                    return {

                        id: id,

                        name:
                            service?.name || "",

                        category:
                            service?.category || "",

                        price:
                            service?.price || 0,

                        quantity: quantity,

                        subtotal:
                            (service?.price || 0) *
                            quantity

                    };

                });


        const total =
            items.reduce(
                (sum, item) =>
                    sum + item.subtotal,
                0
            );


        orderButton.disabled =
            true;


        try {

            const result =
                await postJSON(
                    {
                        action: "order",

                        customerName: name,

                        items: items,

                        total: total
                    },

                    "正在送出服務選項..."
                );


            showToast(
                result.message ||
                "服務選項送出成功"
            );


            state.cart.clear();

            customerName.value = "";

            renderCart();

        } catch (error) {

            console.error(error);


            showToast(
                error.message ||
                "送出失敗",
                "error"
            );

        } finally {

            orderButton.disabled =
                false;

        }

    }
);


/* =========================================================
   初始化
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderCart();

        fetchServices();

    }
);