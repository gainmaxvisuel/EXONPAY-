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
   AFFICHER MESSAGE D'ERREUR
===================================================== */

function showError(message) {

    const loading =
        document.getElementById("loading");

    const error =
        document.getElementById("error");

    loading.style.display = "none";

    error.style.display = "block";

    error.className = "error-message";

    error.textContent = message;

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


    const info =
        document.createElement("div");

    info.className =
        "product-info";


    const name =
        document.createElement("div");

    name.className =
        "product-name";

    name.textContent =
        product.name;


    const price =
        document.createElement("div");

    price.className =
        "product-detail";

    price.innerHTML =
        "<span>Prix</span>" +
        "<span class='product-price'>" +
        money(product.price) +
        "</span>";


    const daily =
        document.createElement("div");

    daily.className =
        "product-detail";

    daily.innerHTML =
        "<span>Revenu quotidien</span>" +
        "<span>" +
        money(product.daily_income) +
        "</span>";


    const cycle =
        document.createElement("div");

    cycle.className =
        "product-detail";

    cycle.innerHTML =
        "<span>Durée</span>" +
        "<span>" +
        product.cycle_days +
        " jours</span>";


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


    /* =========================
       BOUTON
    ========================= */

    if (product.is_active) {

        const button =
            document.createElement("button");

        button.className =
            "buy-button";

        button.textContent =
            "Acheter";

        button.onclick =
            function() {

                buyProduct(product);

            };

        info.appendChild(button);

    } else {

        const button =
            document.createElement("button");

        button.className =
            "locked-button";

        button.textContent =
            "🔒 Produit indisponible";

        button.disabled = true;

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

    container.innerHTML = "";

    const empty =
        document.createElement("div");

    empty.className =
        "empty-category";

    empty.innerHTML =
        '<div class="empty-category-icon">📦</div>' +
        '<div>Aucun produit disponible dans cette catégorie pour le moment.</div>';

    container.appendChild(empty);

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
                "?select=id,name,product_type,price,daily_income,cycle_days,total_income,is_active,is_visible" +
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


        /* =========================
           NETTOYAGE
        ========================= */

        document.getElementById(
            "products-simple"
        ).innerHTML = "";

        document.getElementById(
            "products-special"
        ).innerHTML = "";

        document.getElementById(
            "products-opportunity"
        ).innerHTML = "";


        /* =========================
           COMPTEUR IMAGE GLOBAL
        ========================= */

        let imageNumber = 1;


        /* =========================
           RÉPARTITION
        ========================= */

        products.forEach(
            function(product) {

                if (
                    product.product_type ===
                    "simple"
                ) {

                    const container =
                        document.getElementById(
                            "products-simple"
                        );

                    container.appendChild(
                        createProductCard(
                            product,
                            imageNumber
                        )
                    );

                    imageNumber++;

                }

                else if (
                    product.product_type ===
                    "special"
                ) {

                    const container =
                        document.getElementById(
                            "products-special"
                        );

                    container.appendChild(
                        createProductCard(
                            product,
                            imageNumber
                        )
                    );

                    imageNumber++;

                }

                else if (
                    product.product_type ===
                    "opportunity"
                ) {

                    const container =
                        document.getElementById(
                            "products-opportunity"
                        );

                    container.appendChild(
                        createProductCard(
                            product,
                            imageNumber
                        )
                    );

                    imageNumber++;

                }

            }
        );


        /* =========================
           CATÉGORIES VIDES
        ========================= */

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


        if (
            simpleContainer.children.length === 0
        ) {

            showEmptyCategory(
                simpleContainer
            );

        }


        if (
            specialContainer.children.length === 0
        ) {

            showEmptyCategory(
                specialContainer
            );

        }


        if (
            opportunityContainer.children.length === 0
        ) {

            showEmptyCategory(
                opportunityContainer
            );

        }


        document.getElementById(
            "loading"
        ).style.display = "none";


        showCategory("simple");

    }

    catch (error) {

        console.error(
            "Erreur chargement produits :",
            error
        );

        showError(
            "Impossible de charger les produits. Vérifiez votre connexion et réessayez."
        );

    }

}


/* =====================================================
   ACHAT PRODUIT
===================================================== */

async function buyProduct(product) {

    const confirmation =
        confirm(
            "Confirmer l'achat ?\n\n" +

            "Produit : " +
            product.name +
            "\n" +

            "Montant : " +
            money(product.price) +
            "\n" +

            "Durée : " +
            product.cycle_days +
            " jours\n" +

            "Revenu total : " +
            money(product.total_income) +
            "\n\n" +

            "Le revenu total sera payé à la fin du cycle."
        );


    if (!confirmation) {
        return;
    }


    try {

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


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                data.details ||
                "Achat impossible"
            );

        }


        alert(
            "✅ Achat effectué avec succès !\n\n" +
            product.name +
            "\n\n" +
            "Montant : " +
            money(product.price)
        );


        window.location.reload();

    }

    catch (error) {

        console.error(
            "Erreur achat :",
            error
        );

        alert(
            "❌ " +
            (
                error.message ||
                "Impossible d'effectuer l'achat."
            )
        );

    }

}


/* =====================================================
   DÉMARRAGE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadProducts();

    }
);