const SUPABASE_URL =
    "https://euyvppbbhjrjcbgmdian.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eXZwcGJiaGpyamNiZ21kaWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjIxNjYsImV4cCI6MjEwMzY5ODE2Nn0.BOH9ZGx5I34wzIkl8oGU7_BZ8yN3zWZSqIrBceb6aH0";


let products = [];


/* =========================================================
   SESSION
========================================================= */

function getSessionUser(){

    try{

        const raw =
            localStorage.getItem("exonpay_user");

        if(!raw){
            return null;
        }

        return JSON.parse(raw);

    }catch(error){

        console.error(
            "Session invalide:",
            error
        );

        return null;
    }
}


/* =========================================================
   HEADERS
========================================================= */

function headers(){

    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization":
            "Bearer " + SUPABASE_ANON_KEY,
        "Content-Type":
            "application/json"
    };
}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatMoney(value){

    const number =
        Number(value || 0);

    return number.toLocaleString(
        "fr-FR"
    ) + " XOF";
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value){

    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}


/* =========================================================
   PRODUCT TYPE
========================================================= */

function formatProductType(type){

    const types = {

        simple:
            "Produit Simple",

        special:
            "Investissement",

        opportunity:
            "Opportunité",

        daily:
            "Quotidien"

    };

    return types[type] ||
        type ||
        "Produit";
}


/* =========================================================
   STATUS
========================================================= */

function getStatusInfo(status){

    const value =
        String(status || "")
            .toLowerCase();

    if(value === "active"){

        return {
            text:"Actif",
            className:"status-active"
        };

    }

    if(value === "completed"){

        return {
            text:"Terminé",
            className:"status-completed"
        };

    }

    if(value === "paused"){

        return {
            text:"Suspendu",
            className:"status-paused"
        };

    }

    return {
        text:status || "Actif",
        className:"status-active"
    };
}


/* =========================================================
   PAID DAYS
========================================================= */

function getPaidDays(product){

    const value =
        Number(
            product.income_credited || 0
        );

    return Math.max(
        0,
        Math.floor(value)
    );
}


/* =========================================================
   DURATION
========================================================= */

function getDuration(product){

    const duration =
        Number(product.cycle_days || 0);

    return duration > 0
        ? duration
        : 0;
}


/* =========================================================
   DAILY INCOME
========================================================= */

function getDailyIncome(product){

    return Number(
        product.daily_income || 0
    );
}


/* =========================================================
   TOTAL INCOME
========================================================= */

function getTotalIncome(product){

    const directTotal =
        Number(
            product.total_income || 0
        );

    if(directTotal > 0){
        return directTotal;
    }

    return (
        getDailyIncome(product) *
        getDuration(product)
    );
}


/* =========================================================
   GENERATED
========================================================= */

function getGeneratedAmount(product){

    const generated =
        Number(
            product.generated_amount || 0
        );

    return Math.max(
        0,
        generated
    );
}


/* =========================================================
   PROGRESS
========================================================= */

function calculateProgress(product){

    const total =
        getTotalIncome(product);

    const generated =
        getGeneratedAmount(product);

    if(total <= 0){
        return 0;
    }

    return Math.min(
        100,
        Math.max(
            0,
            (generated / total) * 100
        )
    );
}


/* =========================================================
   NEXT INCOME
========================================================= */

function getNextIncomeInfo(product){

    const started =
        new Date(product.started_at);

    const duration =
        getDuration(product);

    const paidDays =
        getPaidDays(product);

    const daily =
        getDailyIncome(product);

    if(
        !product.started_at ||
        !duration ||
        paidDays >= duration
    ){

        return {
            finished:true,
            timestamp:null,
            amount:0
        };
    }

    const nextTimestamp =
        started.getTime() +
        (
            (paidDays + 1) *
            24 *
            60 *
            60 *
            1000
        );

    return {
        finished:false,
        timestamp:nextTimestamp,
        amount:daily
    };
}


/* =========================================================
   COUNTDOWN
========================================================= */

function formatCountdown(timestamp){

    const now =
        Date.now();

    let difference =
        timestamp - now;

    if(difference <= 0){

        return "Traitement imminent";
    }

    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );

    difference %=
        (1000 * 60 * 60 * 24);

    const hours =
        Math.floor(
            difference /
            (1000 * 60 * 60)
        );

    difference %=
        (1000 * 60 * 60);

    const minutes =
        Math.floor(
            difference /
            (1000 * 60)
        );

    difference %=
        (1000 * 60);

    const seconds =
        Math.floor(
            difference / 1000
        );

    if(days > 0){

        return (
            days + "j " +
            String(hours).padStart(2,"0") + "h " +
            String(minutes).padStart(2,"0") + "m"
        );
    }

    return (
        String(hours).padStart(2,"0") + ":" +
        String(minutes).padStart(2,"0") + ":" +
        String(seconds).padStart(2,"0")
    );
}


/* =========================================================
   DATE
========================================================= */

function formatDate(date){

    if(!date){
        return "-";
    }

    const d =
        new Date(date);

    if(Number.isNaN(d.getTime())){
        return "-";
    }

    return d.toLocaleDateString(
        "fr-FR",
        {
            day:"2-digit",
            month:"2-digit",
            year:"numeric"
        }
    );
}


/* =========================================================
   CARD HTML
========================================================= */

function createProductCard(product,index){

    const status =
        getStatusInfo(product.status);

    const daily =
        getDailyIncome(product);

    const total =
        getTotalIncome(product);

    const generated =
        getGeneratedAmount(product);

    const duration =
        getDuration(product);

    const paidDays =
        getPaidDays(product);

    const remainingDays =
        Math.max(
            0,
            duration - paidDays
        );

    const remainingIncome =
        Math.max(
            0,
            total - generated
        );

    const progress =
        calculateProgress(product);

    const next =
        getNextIncomeInfo(product);

    const nextTimestamp =
        next.timestamp || "";

    const nextAmount =
        next.amount || 0;

    const countdown =
        next.finished
            ? "Cycle terminé"
            : formatCountdown(
                next.timestamp
            );

    return `

        <article
            class="product-card"
            data-index="${index}"
            data-next="${nextTimestamp}"
        >

            <div class="card-pattern">

                <img
                    class="pattern1"
                    src="logo.png"
                    alt=""
                >

                <img
                    class="pattern2"
                    src="logo.png"
                    alt=""
                >

                <img
                    class="pattern3"
                    src="logo.png"
                    alt=""
                >

            </div>


            <div class="product-top">

                <div>

                    <div class="product-label">
                        Produit EXONPAY
                    </div>

                    <div class="product-name">
                        ${escapeHtml(
                            product.product_name ||
                            "Produit"
                        )}
                    </div>

                    <div class="product-type">
                        ${escapeHtml(
                            formatProductType(
                                product.product_type
                            )
                        )}
                    </div>

                </div>


                <div
                    class="status ${status.className}"
                >
                    ${escapeHtml(
                        status.text
                    )}
                </div>

            </div>


            <div class="chip"></div>


            <div class="product-values">

                <div class="value-box">

                    <div class="value-label">
                        Prix d'achat
                    </div>

                    <div class="value-number">
                        ${formatMoney(
                            product.purchase_price
                        )}
                    </div>

                </div>


                <div class="value-box">

                    <div class="value-label">
                        Revenu quotidien
                    </div>

                    <div class="value-number">
                        ${formatMoney(
                            daily
                        )}
                    </div>

                </div>

            </div>


            <div class="countdown">

                <div>

                    <div class="countdown-label">
                        PROCHAIN REVENU
                    </div>

                    <div
                        class="countdown-value countdown-text"
                    >
                        ${countdown}
                    </div>

                </div>

                <div
                    class="countdown-value"
                    style="text-align:right"
                >
                    ${next.finished
                        ? "—"
                        : formatMoney(nextAmount)
                    }
                </div>

            </div>


            <div class="product-info">

                <div class="info-item">

                    <div class="info-label">
                        GÉNÉRÉ
                    </div>

                    <div class="info-value">
                        ${formatMoney(
                            generated
                        )}
                    </div>

                </div>


                <div class="info-item">

                    <div class="info-label">
                        JOURS
                    </div>

                    <div class="info-value">
                        ${paidDays}/${duration}
                    </div>

                </div>


                <div class="info-item">

                    <div class="info-label">
                        RESTANT
                    </div>

                    <div class="info-value">
                        ${remainingDays} j
                    </div>

                </div>

            </div>


            <div class="progress-area">

                <div class="progress-head">

                    <div class="progress-label">
                        Progression du cycle
                    </div>

                    <div class="progress-percent">
                        ${progress.toFixed(1)}%
                    </div>

                </div>

                <div class="progress">

                    <div
                        class="progress-bar"
                        style="width:${progress}%"
                    ></div>

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts(){

    const sessionUser =
        getSessionUser();

    if(
        !sessionUser ||
        !sessionUser.user_id
    ){

        window.location.href =
            "login.html";

        return;
    }

    const loading =
        document.getElementById(
            "loading"
        );

    const grid =
        document.getElementById(
            "products-grid"
        );

    const empty =
        document.getElementById(
            "empty"
        );

    try{

        const url =
            SUPABASE_URL +
            "/rest/v1/user_products" +
            "?select=*" +
            "&user_id=eq." +
            encodeURIComponent(
                sessionUser.user_id
            ) +
            "&order=created_at.desc";

        const response =
            await fetch(
                url,
                {
                    method:"GET",
                    headers:headers()
                }
            );

        const data =
            await response.json();

        if(!response.ok){

            throw new Error(
                data.message ||
                data.error ||
                "Impossible de charger les produits."
            );
        }

        products =
            Array.isArray(data)
                ? data
                : [];

        loading.style.display =
            "none";

        updateSummary();

        if(products.length === 0){

            grid.innerHTML = "";

            empty.style.display =
                "block";

            return;
        }

        empty.style.display =
            "none";

        grid.innerHTML =
            products
                .map(
                    createProductCard
                )
                .join("");

    }catch(error){

        console.error(
            "Erreur produits:",
            error
        );

        loading.textContent =
            "Impossible de charger vos produits.";

        loading.style.color =
            "#dc2626";
    }
}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary(){

    const totalProducts =
        products.length;

    const activeProducts =
        products.filter(
            product =>
                String(
                    product.status || ""
                ).toLowerCase()
                === "active"
        ).length;

    const generatedTotal =
        products.reduce(
            (sum,product) =>
                sum +
                getGeneratedAmount(
                    product
                ),
            0
        );

    document.getElementById(
        "total-products"
    ).textContent =
        totalProducts;

    document.getElementById(
        "active-products"
    ).textContent =
        activeProducts;

    document.getElementById(
        "generated-total"
    ).textContent =
        formatMoney(
            generatedTotal
        );
}


/* =========================================================
   UPDATE COUNTDOWNS
========================================================= */

function updateCountdowns(){

    const cards =
        document.querySelectorAll(
            ".product-card"
        );

    cards.forEach(card => {

        const timestamp =
            Number(
                card.dataset.next
            );

        if(!timestamp){
            return;
        }

        const countdown =
            card.querySelector(
                ".countdown-text"
            );

        if(!countdown){
            return;
        }

        countdown.textContent =
            formatCountdown(
                timestamp
            );
    });
}


/* =========================================================
   INITIAL LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProducts();

        setInterval(
            updateCountdowns,
            1000
        );

        setInterval(
            loadProducts,
            30000
        );

    }
);