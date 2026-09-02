/*

EXONPAY
MY PRODUCTS

*/

/*

SUPABASE

*/

const SUPABASE_URL =
"https://euyvppbbhjrjcbgmdian.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eXZwcGJiaGpyamNiZ21kaWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjIxNjYsImV4cCI6MjEwMzY5ODE2Nn0.BOH9ZGx5I34wzIkl8oGU7_BZ8yN3zWZSqIrBceb6aH0";

/*

SESSION UTILISATEUR

*/

const savedUser =
localStorage.getItem("exonpay_user");

if (!savedUser) {

window.location.replace("login.html");

}

let sessionUser = null;

try {

sessionUser =
    JSON.parse(savedUser);

} catch (error) {

localStorage.removeItem("exonpay_user");

window.location.replace("login.html");

}

/*

ELEMENTS

*/

const loading =
document.getElementById("loading");

const errorState =
document.getElementById("errorState");

const emptyState =
document.getElementById("emptyState");

const productsList =
document.getElementById("productsList");

const totalProducts =
document.getElementById("totalProducts");

const activeProducts =
document.getElementById("activeProducts");

const generatedTotal =
document.getElementById("generatedTotal");

/*

HEADERS

*/

function getHeaders() {

return {

    "apikey":
        SUPABASE_ANON_KEY,

    "Authorization":
        "Bearer " +
        SUPABASE_ANON_KEY,

    "Accept":
        "application/json"

};

}

/*

FORMAT FCFA

*/

function formatMoney(value) {

return Number(
    value || 0
).toLocaleString(
    "fr-FR",
    {
        maximumFractionDigits: 0
    }
);

}

/*

FORMAT DATE

*/

function formatDate(value) {

if (!value) {
    return "--";
}


const date =
    new Date(value);


if (Number.isNaN(
    date.getTime()
)) {

    return value;

}


return date.toLocaleDateString(
    "fr-FR",
    {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }
);

}

/*

FORMAT TYPE

*/

function formatProductType(value) {

if (!value) {
    return "Produit";
}


const normalized =
    value
        .toString()
        .trim()
        .toLowerCase();


const labels = {

    simple:
        "Produit simple",

    special:
        "Produit spécial",

    opportunity:
        "Opportunité",

    opportunite:
        "Opportunité",

    vip:
        "VIP"

};


return labels[
    normalized
] || value;

}

/*

FORMAT STATUT

*/

function getStatusInfo(value) {

const normalized =
    (
        value || ""
    )
    .toString()
    .trim()
    .toLowerCase();


if (
    normalized === "active" ||
    normalized === "actif"
) {

    return {

        label: "Actif",

        className:
            "status-active"

    };

}


if (
    normalized === "completed" ||
    normalized === "complete" ||
    normalized === "completed"
) {

    return {

        label: "Terminé",

        className:
            "status-completed"

    };

}


if (
    normalized === "cancelled" ||
    normalized === "canceled" ||
    normalized === "annule"
) {

    return {

        label: "Annulé",

        className:
            "status-cancelled"

    };

}


if (
    normalized === "pending" ||
    normalized === "en attente"
) {

    return {

        label: "En attente",

        className:
            "status-pending"

    };

}


return {

    label:
        value || "Inconnu",

    className:
        "status-pending"

};

}

/*

CALCUL PROGRESSION

*/

function calculateProgress(product) {

const total =
    Number(
        product.total_revenue ??
        product.revenue_total ??
        product.expected_total_revenue ??
        0
    );


const generated =
    Number(
        product.generated_amount ??
        product.total_generated ??
        product.revenue_generated ??
        product.amount_generated ??
        0
    );


if (
    total <= 0
) {

    return 0;

}


const percentage =
    (
        generated /
        total
    ) * 100;


return Math.min(
    100,
    Math.max(
        0,
        percentage
    )
);

}

/*

CREATION CARTE PRODUIT

*/

function createProductCard(
product
) {

const card =
    document.createElement("article");


card.className =
    "product-card";


/*
-----------------------------------------------------
NOM
-----------------------------------------------------
*/

const name =
    product.product_name ||
    product.name ||
    product.title ||
    "Produit";


/*
-----------------------------------------------------
TYPE
-----------------------------------------------------
*/

const type =
    formatProductType(
        product.product_type ||
        product.type
    );


/*
-----------------------------------------------------
STATUT
-----------------------------------------------------
*/

const status =
    getStatusInfo(
        product.status
    );


/*
-----------------------------------------------------
VALEURS
-----------------------------------------------------
*/

const purchasePrice =
    Number(
        product.purchase_price ??
        product.price ??
        product.amount_paid ??
        0
    );


const dailyRevenue =
    Number(
        product.daily_revenue ??
        product.daily_income ??
        product.revenue_daily ??
        0
    );


const totalRevenue =
    Number(
        product.total_revenue ??
        product.revenue_total ??
        product.expected_total_revenue ??
        0
    );


const generated =
    Number(
        product.generated_amount ??
        product.total_generated ??
        product.revenue_generated ??
        product.amount_generated ??
        0
    );


const duration =
    product.duration_days ??
    product.duration ??
    product.days ??
    "--";


const startDate =
    product.start_date ??
    product.started_at ??
    product.purchase_date ??
    product.created_at;


const endDate =
    product.end_date ??
    product.expires_at ??
    product.expiration_date;


const progress =
    calculateProgress(
        product
    );


/*
-----------------------------------------------------
HTML
-----------------------------------------------------
*/

card.innerHTML = `

    <div class="product-header">

        <div class="product-header-top">

            <div>

                <div class="product-name">
                    ${escapeHtml(name)}
                </div>

                <div class="product-type">
                    ${escapeHtml(type)}
                </div>

            </div>

            <div class="status ${status.className}">
                ${escapeHtml(status.label)}
            </div>

        </div>

    </div>


    <div class="product-info">

        <div class="info-item">

            <div class="info-label">
                Prix d'achat
            </div>

            <div class="info-value">
                ${formatMoney(purchasePrice)} FCFA
            </div>

        </div>


        <div class="info-item">

            <div class="info-label">
                Revenu quotidien
            </div>

            <div class="info-value">
                ${formatMoney(dailyRevenue)} FCFA
            </div>

        </div>


        <div class="info-item">

            <div class="info-label">
                Revenu total prévu
            </div>

            <div class="info-value">
                ${formatMoney(totalRevenue)} FCFA
            </div>

        </div>


        <div class="info-item">

            <div class="info-label">
                Durée
            </div>

            <div class="info-value">
                ${escapeHtml(String(duration))} jours
            </div>

        </div>

    </div>


    <div class="product-dates">

        <div class="date-row">

            <span class="date-label">
                Début
            </span>

            <span class="date-value">
                ${formatDate(startDate)}
            </span>

        </div>


        <div class="date-row">

            <span class="date-label">
                Fin
            </span>

            <span class="date-value">
                ${formatDate(endDate)}
            </span>

        </div>

    </div>


    <div class="progress-section">

        <div class="progress-top">

            <span class="progress-label">
                Revenus générés
            </span>

            <span class="progress-value">
                ${formatMoney(generated)} / ${formatMoney(totalRevenue)} FCFA
            </span>

        </div>

        <div class="progress-bar">

            <div
                class="progress-fill"
                style="width:${progress}%"
            ></div>

        </div>

    </div>

`;


return card;

}

/*

ECHAPPEMENT HTML

*/

function escapeHtml(
value
) {

return String(
    value ?? ""
)
.replace(
    /&/g,
    "&amp;"
)
.replace(
    /</g,
    "&lt;"
)
.replace(
    />/g,
    "&gt;"
)
.replace(
    /"/g,
    "&quot;"
)
.replace(
    /'/g,
    "&#039;"
);

}

/*

CHARGEMENT DES PRODUITS UTILISATEUR

*/

async function loadMyProducts() {

const userId =
    sessionUser &&
    sessionUser.user_id;


if (!userId) {

    loading.style.display =
        "none";

    errorState.style.display =
        "block";

    errorState.textContent =
        "Session utilisateur invalide.";

    return;

}


loading.style.display =
    "block";

errorState.style.display =
    "none";

emptyState.style.display =
    "none";

productsList.innerHTML =
    "";


/*
=====================================================
IMPORTANT

On interroge UNIQUEMENT user_products.

Le filtre user_id garantit que l'on récupère
uniquement les produits de l'utilisateur connecté.
=====================================================
*/

const url =
    SUPABASE_URL +
    "/rest/v1/user_products" +
    "?select=*" +
    "&user_id=eq." +
    encodeURIComponent(userId) +
    "&order=created_at.desc";


try {

    const response =
        await fetch(
            url,
            {
                method: "GET",
                headers:
                    getHeaders()
            }
        );


    const raw =
        await response.text();


    if (!response.ok) {

        console.error(
            "Erreur user_products:",
            raw
        );

        throw new Error(
            "Impossible de récupérer les produits."
        );

    }


    let data = [];


    try {

        data =
            raw
                ? JSON.parse(raw)
                : [];

    } catch {

        throw new Error(
            "Réponse Supabase invalide."
        );

    }


    /*
    -----------------------------------------------------
    AUCUN PRODUIT
    -----------------------------------------------------
    */

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        loading.style.display =
            "none";

        emptyState.style.display =
            "block";

        totalProducts.textContent =
            "0";

        activeProducts.textContent =
            "0";

        generatedTotal.textContent =
            "0 FCFA";

        return;

    }


    /*
    -----------------------------------------------------
    STATISTIQUES
    -----------------------------------------------------
    */

    const active =
        data.filter(
            product =>
                (
                    product.status || ""
                )
                .toString()
                .toLowerCase() ===
                "active"
        );


    const generated =
        data.reduce(
            function(total, product) {

                return total +
                    Number(
                        product.generated_amount ??
                        product.total_generated ??
                        product.revenue_generated ??
                        product.amount_generated ??
                        0
                    );

            },
            0
        );


    totalProducts.textContent =
        data.length;


    activeProducts.textContent =
        active.length;


    generatedTotal.textContent =
        formatMoney(
            generated
        ) +
        " FCFA";


    /*
    -----------------------------------------------------
    AFFICHER LES PRODUITS
    -----------------------------------------------------
    */

    data.forEach(
        function(product) {

            const card =
                createProductCard(
                    product
                );

            productsList.appendChild(
                card
            );

        }
    );


    loading.style.display =
        "none";


} catch (error) {

    console.error(
        "Erreur chargement produits:",
        error
    );


    loading.style.display =
        "none";

    emptyState.style.display =
        "none";

    errorState.style.display =
        "block";

    errorState.textContent =
        error.message ||
        "Impossible de charger vos produits.";

}

}

/*

INITIALISATION

*/

loadMyProducts();

/*

ACTUALISATION

Les données sont relues périodiquement afin que les
revenus générés et les statuts puissent être actualisés.

*/

setInterval(
loadMyProducts,
30000
);