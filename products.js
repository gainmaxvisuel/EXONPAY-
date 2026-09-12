/* =====================================================
   CONFIGURATION SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://euyvppbbhjrjcbgmdian.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eXZwcGJiaGpyamNiZ21kaWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjIxNjYsImV4cCI6MjEwMzY5ODE2Nn0.BOH9ZGx5I34wzIkl8oGU7_BZ8yN3zWZSqIrBceb6aH0";


/* =====================================================
   SESSION UTILISATEUR
===================================================== */

const sessionUser =
    JSON.parse(
        localStorage.getItem("exonpay_user") || "null"
    );

if (!sessionUser || !sessionUser.user_id) {
    window.location.href = "login.html";
}

const userId =
    sessionUser ? sessionUser.user_id : null;


/* =====================================================
   HEADERS SUPABASE
===================================================== */

function headers() {

    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization":
            "Bearer " + SUPABASE_ANON_KEY,
        "Content-Type":
            "application/json"
    };

}


/* =====================================================
   FORMATAGE ARGENT
===================================================== */

function money(value) {

    const number =
        Number(value || 0);

    return number.toLocaleString(
        "fr-FR"
    ) + " FCFA";

}


/* =====================================================
   MESSAGE D'ERREUR
===================================================== */

function showError(message) {

    const loading =
        document.getElementById("loading");

    const error =
        document.getElementById("error");

    if (loading) {
        loading.style.display = "none";
    }

    if (error) {

        error.style.display = "block";

        error.className =
            "error-message";

        error.textContent =
            message;

    } else {

        alert(message);

    }

}


/* =====================================================
   AJOUT DU STYLE DE LA FENÊTRE DE CONFIRMATION
===================================================== */

function addPurchaseModalStyles() {

    if (
        document.getElementById(
            "exonpay-purchase-modal-style"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "exonpay-purchase-modal-style";

    style.textContent = `

        .exonpay-purchase-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.58);
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 99999;
            box-sizing: border-box;
        }

        .exonpay-purchase-overlay.active {
            display: flex;
        }

        .exonpay-purchase-modal {
            width: 100%;
            max-width: 430px;
            background: #ffffff;
            border-radius: 18px;
            padding: 24px;
            box-sizing: border-box;
            box-shadow:
                0 20px 60px rgba(0, 0, 0, 0.25);
            animation: exonpayModalIn 0.18s ease-out;
        }

        @keyframes exonpayModalIn {
            from {
                opacity: 0;
                transform: translateY(15px) scale(0.97);
            }

            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .exonpay-purchase-icon {
            width: 52px;
            height: 52px;
            margin: 0 auto 14px;
            border-radius: 50%;
            background: #eef4ff;
            color: #155eef;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 25px;
            font-weight: 700;
        }

        .exonpay-purchase-title {
            text-align: center;
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 20px;
        }

        .exonpay-purchase-product {
            text-align: center;
            font-size: 17px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 18px;
        }

        .exonpay-purchase-details {
            background: #f6f7f9;
            border-radius: 12px;
            padding: 14px;
            margin-bottom: 16px;
        }

        .exonpay-purchase-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
            padding: 8px 0;
            font-size: 14px;
            border-bottom: 1px solid #e5e7eb;
        }

        .exonpay-purchase-row:last-child {
            border-bottom: none;
        }

        .exonpay-purchase-label {
            color: #6b7280;
        }

        .exonpay-purchase-value {
            color: #111827;
            font-weight: 600;
            text-align: right;
        }

        .exonpay-purchase-notice {
            background: #eef7ff;
            color: #155eef;
            border-radius: 10px;
            padding: 12px;
            font-size: 13px;
            line-height: 1.5;
            margin-bottom: 20px;
            text-align: center;
        }

        .exonpay-purchase-buttons {
            display: flex;
            gap: 10px;
            width: 100%;
        }

        .exonpay-purchase-cancel,
        .exonpay-purchase-confirm {
            flex: 1;
            min-height: 48px;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
        }

        .exonpay-purchase-cancel {
            background: #eef0f3;
            color: #374151;
        }

        .exonpay-purchase-confirm {
            background: #111827;
            color: #ffffff;
        }

        .exonpay-purchase-confirm:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .exonpay-purchase-success {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.58);
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 100000;
            box-sizing: border-box;
        }

        .exonpay-purchase-success.active {
            display: flex;
        }

        .exonpay-success-box {
            width: 100%;
            max-width: 400px;
            background: #ffffff;
            border-radius: 18px;
            padding: 28px 22px;
            text-align: center;
            box-sizing: border-box;
        }

        .exonpay-success-icon {
            width: 58px;
            height: 58px;
            margin: 0 auto 15px;
            border-radius: 50%;
            background: #eaf8ef;
            color: #16803c;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
        }

        .exonpay-success-title {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 10px;
        }

        .exonpay-success-text {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 20px;
        }

        .exonpay-success-button {
            width: 100%;
            min-height: 48px;
            border: none;
            border-radius: 10px;
            background: #111827;
            color: #ffffff;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
        }

    `;

    document.head.appendChild(style);

}


/* =====================================================
   CRÉATION DE LA FENÊTRE DE CONFIRMATION
===================================================== */

function createPurchaseModal() {

    if (
        document.getElementById(
            "exonpayPurchaseOverlay"
        )
    ) {
        return;
    }

    const overlay =
        document.createElement("div");

    overlay.id =
        "exonpayPurchaseOverlay";

    overlay.className =
        "exonpay-purchase-overlay";

    overlay.innerHTML = `

        <div
            class="exonpay-purchase-modal"
            role="dialog"
            aria-modal="true"
        >

            <div class="exonpay-purchase-icon">
                ✓
            </div>

            <div class="exonpay-purchase-title">
                Confirmer l'achat
            </div>

            <div
                id="exonpayPurchaseProduct"
                class="exonpay-purchase-product"
            ></div>

            <div
                id="exonpayPurchaseDetails"
                class="exonpay-purchase-details"
            ></div>

            <div
                id="exonpayPurchaseNotice"
                class="exonpay-purchase-notice"
            ></div>

            <div class="exonpay-purchase-buttons">

                <button
                    type="button"
                    id="exonpayPurchaseCancel"
                    class="exonpay-purchase-cancel"
                >
                    Annuler
                </button>

                <button
                    type="button"
                    id="exonpayPurchaseConfirm"
                    class="exonpay-purchase-confirm"
                >
                    Confirmer l'achat
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(
        overlay
    );

}


/* =====================================================
   FENÊTRE DE SUCCÈS
===================================================== */

function createSuccessModal() {

    if (
        document.getElementById(
            "exonpaySuccessOverlay"
        )
    ) {
        return;
    }

    const overlay =
        document.createElement("div");

    overlay.id =
        "exonpaySuccessOverlay";

    overlay.className =
        "exonpay-purchase-success";

    overlay.innerHTML = `

        <div class="exonpay-success-box">

            <div class="exonpay-success-icon">
                ✓
            </div>

            <div
                id="exonpaySuccessTitle"
                class="exonpay-success-title"
            >
                Achat effectué
            </div>

            <div
                id="exonpaySuccessText"
                class="exonpay-success-text"
            ></div>

            <button
                type="button"
                id="exonpaySuccessButton"
                class="exonpay-success-button"
            >
                Continuer
            </button>

        </div>
    `;

    document.body.appendChild(
        overlay
    );

}


/* =====================================================
   AFFICHER LA CONFIRMATION
===================================================== */

function showPurchaseConfirmation(product) {

    createPurchaseModal();

    const overlay =
        document.getElementById(
            "exonpayPurchaseOverlay"
        );

    const productName =
        document.getElementById(
            "exonpayPurchaseProduct"
        );

    const details =
        document.getElementById(
            "exonpayPurchaseDetails"
        );

    const notice =
        document.getElementById(
            "exonpayPurchaseNotice"
        );

    const cancelButton =
        document.getElementById(
            "exonpayPurchaseCancel"
        );

    const confirmButton =
        document.getElementById(
            "exonpayPurchaseConfirm"
        );


    productName.textContent =
        product.name;


    details.innerHTML = `

        <div class="exonpay-purchase-row">

            <span class="exonpay-purchase-label">
                Prix
            </span>

            <span class="exonpay-purchase-value">
                ${money(product.price)}
            </span>

        </div>

        <div class="exonpay-purchase-row">

            <span class="exonpay-purchase-label">
                Revenu quotidien
            </span>

            <span class="exonpay-purchase-value">
                ${money(product.daily_income)}
            </span>

        </div>

        <div class="exonpay-purchase-row">

            <span class="exonpay-purchase-label">
                Durée
            </span>

            <span class="exonpay-purchase-value">
                ${product.cycle_days} jours
            </span>

        </div>

        <div class="exonpay-purchase-row">

            <span class="exonpay-purchase-label">
                Revenu total
            </span>

            <span class="exonpay-purchase-value">
                ${money(product.total_income)}
            </span>

        </div>

    `;


    if (
        product.product_type ===
        "daily"
    ) {

        notice.innerHTML =
            "<strong>Produit quotidien</strong><br>" +
            "Votre premier revenu de " +
            money(product.daily_income) +
            " sera disponible 24 heures après l'achat. " +
            "Les revenus suivants seront versés toutes les 24 heures " +
            "pendant " +
            product.cycle_days +
            " jours.";

    } else {

        notice.innerHTML =
            "Le revenu de ce produit sera généré " +
            "selon les conditions indiquées ci-dessus.";

    }


    overlay.classList.add(
        "active"
    );


    /* =================================================
       ANNULER
    ================================================= */

    cancelButton.onclick =
        function(event) {

            event.preventDefault();
            event.stopPropagation();

            overlay.classList.remove(
                "active"
            );

        };


    /* =================================================
       CONFIRMER
    ================================================= */

    confirmButton.onclick =
        async function(event) {

            event.preventDefault();
            event.stopPropagation();

            await executeProductPurchase(
                product
            );

        };

}


/* =====================================================
   EXÉCUTER L'ACHAT
   MÉTHODE purchase_product CONSERVÉE
===================================================== */

async function executeProductPurchase(product) {

    const overlay =
        document.getElementById(
            "exonpayPurchaseOverlay"
        );

    const confirmButton =
        document.getElementById(
            "exonpayPurchaseConfirm"
        );

    if (confirmButton) {

        confirmButton.disabled =
            true;

        confirmButton.textContent =
            "Traitement...";

    }


    try {

        /* =================================================
           MÉTHODE ORIGINALE D'ACHAT
        ================================================= */

        const response =
            await fetch(

                SUPABASE_URL +
                "/rest/v1/rpc/purchase_product",

                {
                    method: "POST",

                    headers: headers(),

                    body: JSON.stringify({

                        p_user_id:
                            userId,

                        p_product_id:
                            product.id

                    })

                }

            );


        const data =
            await response.json();


        /* =================================================
           ERREUR
        ================================================= */

        if (!response.ok) {

            throw new Error(

                data.message ||

                data.error ||

                data.details ||

                "Achat impossible"

            );

        }


        /* Fermer confirmation */

        if (overlay) {

            overlay.classList.remove(
                "active"
            );

        }


        /* =================================================
           MESSAGE DE SUCCÈS
        ================================================= */

        showPurchaseSuccess(
            product
        );

    }

    catch (error) {

        console.error(
            "Erreur achat :",
            error
        );


        if (confirmButton) {

            confirmButton.disabled =
                false;

            confirmButton.textContent =
                "Confirmer l'achat";

        }


        alert(

            "Achat impossible.\n\n" +

            (
                error.message ||
                "Une erreur est survenue."
            )

        );

    }

}


/* =====================================================
   MESSAGE DE SUCCÈS
===================================================== */

function showPurchaseSuccess(product) {

    createSuccessModal();

    const overlay =
        document.getElementById(
            "exonpaySuccessOverlay"
        );

    const title =
        document.getElementById(
            "exonpaySuccessTitle"
        );

    const text =
        document.getElementById(
            "exonpaySuccessText"
        );

    const button =
        document.getElementById(
            "exonpaySuccessButton"
        );


    title.textContent =
        "Achat effectué avec succès";


    if (
        product.product_type ===
        "daily"
    ) {

        text.innerHTML =
            "Vous avez acheté <strong>" +
            product.name +
            "</strong> pour <strong>" +
            money(product.price) +
            "</strong>.<br><br>" +

            "Votre premier revenu de " +
            "<strong>" +
            money(product.daily_income) +
            "</strong> " +
            "sera disponible <strong>24 heures après l'achat</strong>.";

    } else {

        text.innerHTML =
            "Vous avez acheté <strong>" +
            product.name +
            "</strong> pour <strong>" +
            money(product.price) +
            "</strong>.<br><br>" +

            "Votre achat a été enregistré avec succès.";

    }


    overlay.classList.add(
        "active"
    );


    button.onclick =
        function() {

            overlay.classList.remove(
                "active"
            );

            window.location.reload();

        };

}


/* =====================================================
   CRÉATION D'UNE CARTE PRODUIT
===================================================== */

function createProductCard(
    product,
    imageNumber
) {

    const card =
        document.createElement("div");

    card.className =
        "product-card";


    /* IMAGE */

    const image =
        document.createElement("img");

    image.className =
        "product-image";

    image.src =
        "produit" +
        imageNumber +
        ".png";

    image.alt =
        product.name;


    /* INFORMATIONS */

    const info =
        document.createElement("div");

    info.className =
        "product-info";


    /* NOM */

    const name =
        document.createElement("div");

    name.className =
        "product-name";

    name.textContent =
        product.name;


    /* PRIX */

    const price =
        document.createElement("div");

    price.className =
        "product-detail";

    price.innerHTML =
        "<span>Prix</span>" +
        "<span class='product-price'>" +
        money(product.price) +
        "</span>";


    /* REVENU QUOTIDIEN */

    const daily =
        document.createElement("div");

    daily.className =
        "product-detail";

    daily.innerHTML =
        "<span>Revenu quotidien</span>" +
        "<span>" +
        money(product.daily_income) +
        "</span>";


    /* DURÉE */

    const cycle =
        document.createElement("div");

    cycle.className =
        "product-detail";

    cycle.innerHTML =
        "<span>Durée</span>" +
        "<span>" +
        product.cycle_days +
        " jours</span>";


    /* REVENU TOTAL */

    const total =
        document.createElement("div");

    total.className =
        "product-detail";

    total.innerHTML =
        "<span>Revenu total</span>" +
        "<span>" +
        money(product.total_income) +
        "</span>";


    info.appendChild(name);
    info.appendChild(price);
    info.appendChild(daily);
    info.appendChild(cycle);
    info.appendChild(total);


    /* =================================================
       MESSAGE PRODUIT QUOTIDIEN
    ================================================= */

    if (
        product.product_type ===
        "daily"
    ) {

        const notice =
            document.createElement("div");

        notice.className =
            "daily-product-notice";

        notice.innerHTML =
            "Premier revenu après 24 heures<br>" +
            "puis toutes les 24 heures.";

        info.appendChild(notice);

    }


    /* =================================================
       BOUTON ACHETER
    ================================================= */

    if (product.is_active) {

        const button =
            document.createElement("button");

        button.type =
            "button";

        button.className =
            "buy-button";

        button.textContent =
            "Acheter";

        button.onclick =
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                showPurchaseConfirmation(
                    product
                );

            };

        info.appendChild(button);

    } else {

        const button =
            document.createElement("button");

        button.type =
            "button";

        button.className =
            "locked-button";

        button.textContent =
            "Produit indisponible";

        button.disabled =
            true;

        info.appendChild(button);

    }


    card.appendChild(image);

    card.appendChild(info);

    return card;

}


/* =====================================================
   AFFICHER UNE CATÉGORIE
===================================================== */

function showCategory(category) {

    const sections =
        document.querySelectorAll(
            ".section"
        );

    sections.forEach(
        function(section) {

            section.classList.remove(
                "active"
            );

        }
    );


    const buttons =
        document.querySelectorAll(
            ".category-button"
        );

    buttons.forEach(
        function(button) {

            button.classList.remove(
                "active"
            );

        }
    );


    const section =
        document.getElementById(
            "section-" + category
        );

    if (section) {

        section.classList.add(
            "active"
        );

    }


    const button =
        document.querySelector(
            '[data-category="' +
            category +
            '"]'
        );

    if (button) {

        button.classList.add(
            "active"
        );

    }

}


/* =====================================================
   MESSAGE CATÉGORIE VIDE
===================================================== */

function showEmptyCategory(
    container
) {

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const empty =
        document.createElement("div");

    empty.className =
        "empty-category";

    empty.innerHTML =
        '<div class="empty-category-icon">📦</div>' +
        '<div>Aucun produit disponible dans cette catégorie pour le moment.</div>';

    container.appendChild(
        empty
    );

}


/* =====================================================
   CHARGEMENT DES PRODUITS
===================================================== */

async function loadProducts() {

    try {

        const response =
            await fetch(

                SUPABASE_URL +
                "/rest/v1/products" +

                "?select=" +
                "id,name,product_type,price," +
                "daily_income,cycle_days," +
                "total_income,is_active,is_visible" +

                "&is_visible=eq.true" +

                "&order=price.asc",

                {
                    method: "GET",
                    headers: headers()
                }

            );


        if (!response.ok) {

            let errorText =
                "Erreur Supabase";

            try {

                const errorData =
                    await response.json();

                errorText =
                    errorData.message ||
                    errorData.error ||
                    errorData.details ||
                    errorText;

            } catch (e) {}

            throw new Error(
                errorText
            );

        }


        const products =
            await response.json();


        const simpleContainer =
            document.getElementById(
                "products-simple"
            );

        const specialContainer =
            document.getElementById(
                "products-special"
            );

        const opportunityContainer =
            document.getElementById(
                "products-opportunity"
            );

        const dailyContainer =
            document.getElementById(
                "products-daily"
            );


        if (simpleContainer) {
            simpleContainer.innerHTML = "";
        }

        if (specialContainer) {
            specialContainer.innerHTML = "";
        }

        if (opportunityContainer) {
            opportunityContainer.innerHTML = "";
        }

        if (dailyContainer) {
            dailyContainer.innerHTML = "";
        }


        let imageNumber = 1;

        let simpleCount = 0;
        let specialCount = 0;
        let opportunityCount = 0;
        let dailyCount = 0;


        products.forEach(
            function(product) {

                if (
                    product.product_type ===
                    "simple"
                ) {

                    if (simpleContainer) {

                        simpleContainer.appendChild(

                            createProductCard(
                                product,
                                imageNumber
                            )

                        );

                    }

                    simpleCount++;
                    imageNumber++;

                }

                else if (
                    product.product_type ===
                    "special"
                ) {

                    if (specialContainer) {

                        specialContainer.appendChild(

                            createProductCard(
                                product,
                                imageNumber
                            )

                        );

                    }

                    specialCount++;
                    imageNumber++;

                }

                else if (
                    product.product_type ===
                    "opportunity"
                ) {

                    if (opportunityContainer) {

                        opportunityContainer.appendChild(

                            createProductCard(
                                product,
                                imageNumber
                            )

                        );

                    }

                    opportunityCount++;
                    imageNumber++;

                }

                else if (
                    product.product_type ===
                    "daily"
                ) {

                    if (dailyContainer) {

                        dailyContainer.appendChild(

                            createProductCard(
                                product,
                                imageNumber
                            )

                        );

                    }

                    dailyCount++;
                    imageNumber++;

                }

            }
        );


        if (
            simpleContainer &&
            simpleCount === 0
        ) {

            showEmptyCategory(
                simpleContainer
            );

        }


        if (
            specialContainer &&
            specialCount === 0
        ) {

            showEmptyCategory(
                specialContainer
            );

        }


        if (
            opportunityContainer &&
            opportunityCount === 0
        ) {

            showEmptyCategory(
                opportunityContainer
            );

        }


        if (
            dailyContainer &&
            dailyCount === 0
        ) {

            showEmptyCategory(
                dailyContainer
            );

        }


        const loading =
            document.getElementById(
                "loading"
            );

        if (loading) {

            loading.style.display =
                "none";

        }


        showCategory(
            "simple"
        );

    }

    catch (error) {

        console.error(
            "Erreur chargement produits :",
            error
        );

        showError(
            "Impossible de charger les produits. " +
            "Vérifiez votre connexion et réessayez."
        );

    }

}


/* =====================================================
   DÉMARRAGE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        addPurchaseModalStyles();

        createPurchaseModal();

        createSuccessModal();

        loadProducts();

    }
);
