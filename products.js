/* =========================================================
EXONPAY - PRODUCTS.JS
========================================================= */

const SUPABASE_URL =
"https://euyvppbbhjrjcbgmdian.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJleHV5dnBwYmJocmpjYmdtZGlhbiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg4MTIyMTY2LCJleHAiOjIxMDM2OTgxNjZ9.BOH9ZGx5I34wzIkl8oGU7_BZ8yN3zWZSqIrBceb6aH0";

/* =========================================================
SESSION
========================================================= */

const savedUser =
localStorage.getItem("exonpay_user");

if (!savedUser) {

window.location.replace("login.html");

throw new Error(
    "Session utilisateur introuvable."
);

}

let sessionUser;

try {

sessionUser =
    JSON.parse(savedUser);

} catch (error) {

localStorage.removeItem(
    "exonpay_user"
);

window.location.replace(
    "login.html"
);

throw new Error(
    "Session utilisateur invalide."
);

}

const userId =
sessionUser?.user_id;

if (!userId) {

showLoadingError(
    "Session utilisateur invalide. Veuillez vous reconnecter."
);

throw new Error(
    "user_id absent."
);

}

/* =========================================================
HEADERS
========================================================= */

function headers() {

return {

    "apikey":
        SUPABASE_ANON_KEY,

    "Authorization":
        "Bearer " +
        SUPABASE_ANON_KEY,

    "Content-Type":
        "application/json",

    "Accept":
        "application/json"

};

}

/* =========================================================
MESSAGE
========================================================= */

function showMessage(text) {

const box =
    document.getElementById("message");

if (!box) return;

box.textContent =
    text;

box.style.display =
    "block";

clearTimeout(
    window.messageTimer
);

window.messageTimer =
    setTimeout(() => {

        box.style.display =
            "none";

    }, 4500);

}

/* =========================================================
ERREUR
========================================================= */

function showLoadingError(text) {

const loading =
    document.getElementById("loading");

if (!loading) return;

loading.classList.add("error");

loading.textContent =
    text;

}

/* =========================================================
FORMAT FCFA
========================================================= */

function money(value) {

return Number(value || 0)
    .toLocaleString(
        "fr-FR",
        {
            maximumFractionDigits: 0
        }
    ) + " FCFA";

}

/* =========================================================
NOM DES CATÉGORIES
========================================================= */

function categoryName(type) {

const value =
    String(type || "")
    .trim()
    .toLowerCase();

if (value === "simple") {
    return "Produits simples";
}

if (value === "special") {
    return "Produits spéciaux";
}

if (value === "opportunity") {
    return "Opportunités";
}

return value
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : "Autres produits";

}

/* =========================================================
ID HTML
========================================================= */

function categoryId(type) {

return String(type || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-");

}

/* =========================================================
DESCRIPTION
========================================================= */

function categoryDescription(type) {

const value =
    String(type || "")
    .trim()
    .toLowerCase();

if (value === "simple") {

    return "Découvrez les produits simples disponibles.";

}

if (value === "special") {

    return "Découvrez les produits spéciaux disponibles.";

}

if (value === "opportunity") {

    return "Découvrez les opportunités actuellement disponibles.";

}

return "Découvrez les produits disponibles dans cette catégorie.";

}

/* =========================================================
CARTE PRODUIT
========================================================= */

function createProductCard(
product,
imageNumber
) {

const card =
    document.createElement("article");

card.className =
    "product-card";


/* IMAGE */

const imageBox =
    document.createElement("div");

imageBox.className =
    "product-image";


const image =
    document.createElement("img");

image.src =
    "produit" +
    imageNumber +
    ".png";

image.alt =
    product.name || "Produit";


image.onerror =
    function() {

        this.style.display =
            "none";

    };


imageBox.appendChild(image);


/* INFORMATIONS */

const info =
    document.createElement("div");

info.className =
    "product-info";


const name =
    document.createElement("div");

name.className =
    "product-name";

name.textContent =
    product.name || "Produit";


const price =
    document.createElement("div");

price.className =
    "product-price";

price.textContent =
    money(product.price);


const daily =
    document.createElement("div");

daily.className =
    "product-row";

daily.innerHTML = `
    <span class="product-label">
        Revenu journalier
    </span>

    <span class="product-value">
        ${money(product.daily_income)}
    </span>
`;


const days =
    document.createElement("div");

days.className =
    "product-row";

days.innerHTML = `
    <span class="product-label">
        Durée du cycle
    </span>

    <span class="product-value">
        ${Number(product.cycle_days || 0)} jours
    </span>
`;


const total =
    document.createElement("div");

total.className =
    "product-row";

total.innerHTML = `
    <span class="product-label">
        Revenu total
    </span>

    <span class="product-value">
        ${money(product.total_income)}
    </span>
`;


/* BOUTON */

const buy =
    document.createElement("button");

buy.type =
    "button";

buy.className =
    "buy-button";


if (product.is_active === true) {

    buy.textContent =
        "Acheter";

    buy.addEventListener(
        "click",
        () => {

            buyProduct(
                product,
                buy
            );

        }
    );

} else {

    buy.textContent =
        "🔒 Produit indisponible";

    buy.disabled =
        true;

    buy.classList.add(
        "locked-button"
    );

}


/* ASSEMBLAGE */

info.appendChild(name);
info.appendChild(price);
info.appendChild(daily);
info.appendChild(days);
info.appendChild(total);
info.appendChild(buy);

card.appendChild(imageBox);
card.appendChild(info);

return card;

}

/* =========================================================
CRÉER LA NAVIGATION
========================================================= */

function createCategoryNavigation(
categories,
activeType
) {

const navigation =
    document.getElementById(
        "categories-navigation"
    );

navigation.innerHTML = "";


categories.forEach(type => {

    const button =
        document.createElement("button");

    button.type =
        "button";

    button.className =
        "category-button";

    if (type === activeType) {

        button.classList.add(
            "active"
        );

    }

    button.textContent =
        categoryName(type);


    button.addEventListener(
        "click",
        () => {

            showCategory(type);

        }
    );


    navigation.appendChild(
        button
    );

});

}

/* =========================================================
AFFICHER UNE CATÉGORIE
========================================================= */

function showCategory(type) {

const sections =
    document.querySelectorAll(
        ".section"
    );

sections.forEach(section => {

    if (
        section.dataset.type ===
        type
    ) {

        section.classList.add(
            "active"
        );

    } else {

        section.classList.remove(
            "active"
        );

    }

});


const buttons =
    document.querySelectorAll(
        ".category-button"
    );

buttons.forEach(button => {

    button.classList.toggle(
        "active",
        button.dataset.type === type
    );

});

}

/* =========================================================
CRÉER UNE SECTION
========================================================= */

function createCategorySection(
type,
products
) {

const section =
    document.createElement("section");

section.className =
    "section";

section.dataset.type =
    type;


const title =
    document.createElement("h2");

title.className =
    "section-title";

title.textContent =
    categoryName(type);


const description =
    document.createElement("p");

description.className =
    "section-description";

description.textContent =
    categoryDescription(type);


const productsBox =
    document.createElement("div");

productsBox.className =
    "products";


if (!products.length) {

    const empty =
        document.createElement("div");

    empty.className =
        "empty-category";

    empty.textContent =
        "Aucun produit disponible dans cette catégorie.";

    productsBox.appendChild(
        empty
    );

} else {

    products.forEach(
        (product, index) => {

            productsBox.appendChild(
                createProductCard(
                    product,
                    index + 1
                )
            );

        }
    );

}


section.appendChild(title);

section.appendChild(
    description
);

section.appendChild(
    productsBox
);


return section;

}

/* =========================================================
ORDRE DES CATÉGORIES
========================================================= */

function sortCategories(categories) {

const order = [
    "simple",
    "special",
    "opportunity"
];

return categories.sort(
    (a, b) => {

        const indexA =
            order.indexOf(a);

        const indexB =
            order.indexOf(b);

        if (indexA === -1 && indexB === -1) {
            return a.localeCompare(b);
        }

        if (indexA === -1) {
            return 1;
        }

        if (indexB === -1) {
            return -1;
        }

        return indexA - indexB;

    }
);

}

/* =========================================================
CHARGEMENT DES PRODUITS
========================================================= */

async function loadProducts() {

const loading =
    document.getElementById("loading");

const container =
    document.getElementById(
        "categories-container"
    );


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

        const errorText =
            await response.text();

        throw new Error(
            "Erreur Supabase : " +
            response.status +
            " " +
            errorText
        );

    }


    const products =
        await response.json();


    if (!Array.isArray(products)) {

        throw new Error(
            "Réponse Supabase invalide."
        );

    }


    container.innerHTML = "";

    loading.style.display =
        "none";


    if (!products.length) {

        loading.style.display =
            "block";

        loading.classList.add(
            "error"
        );

        loading.textContent =
            "Aucun produit visible actuellement.";

        return;

    }


    /* GROUPER PAR TYPE */

    const grouped = {};


    products.forEach(product => {

        const type =
            String(
                product.product_type || ""
            )
            .trim()
            .toLowerCase();


        if (!type) return;


        if (!grouped[type]) {

            grouped[type] = [];

        }


        grouped[type].push(
            product
        );

    });


    let categories =
        Object.keys(grouped);


    categories =
        sortCategories(
            categories
        );


    if (!categories.length) {

        loading.style.display =
            "block";

        loading.classList.add(
            "error"
        );

        loading.textContent =
            "Aucune catégorie de produit disponible.";

        return;

    }


    /* CRÉER LES SECTIONS */

    categories.forEach(type => {

        const section =
            createCategorySection(
                type,
                grouped[type]
            );

        container.appendChild(
            section
        );

    });


    /* PREMIÈRE CATÉGORIE */

    const firstCategory =
        categories[0];


    createCategoryNavigation(
        categories,
        firstCategory
    );


    /* AJOUTER LE TYPE SUR LES BOUTONS */

    const buttons =
        document.querySelectorAll(
            ".category-button"
        );


    buttons.forEach(
        (button, index) => {

            button.dataset.type =
                categories[index];

        }
    );


    showCategory(
        firstCategory
    );


} catch (error) {

    console.error(
        "Erreur chargement produits :",
        error
    );


    loading.style.display =
        "block";


    showLoadingError(
        "Impossible de charger les produits. Vérifiez votre connexion et réessayez."
    );

}

}

/* =========================================================
ACHAT PRODUIT
========================================================= */

async function buyProduct(
product,
button
) {

if (!product?.id) {

    showMessage(
        "Produit invalide."
    );

    return;

}


if (product.is_active !== true) {

    showMessage(
        "Ce produit est indisponible."
    );

    return;

}


const confirmed =
    confirm(
        "Confirmer l'achat ?\n\n" +
        "Produit : " +
        product.name +
        "\n" +
        "Montant : " +
        money(product.price) +
        "\n" +
        "Cycle : " +
        Number(product.cycle_days || 0) +
        " jours\n" +
        "Revenu total : " +
        money(product.total_income) +
        "\n\n" +
        "Le revenu total sera versé à la fin du cycle."
    );


if (!confirmed) return;


button.disabled =
    true;

button.textContent =
    "Traitement...";


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

        let errorMessage =
            "Achat impossible.";


        if (data?.message) {

            errorMessage =
                data.message;

        } else if (data?.error) {

            errorMessage =
                data.error;

        } else if (data?.details) {

            errorMessage =
                data.details;

        }


        throw new Error(
            errorMessage
        );

    }


    showMessage(
        "Achat confirmé : " +
        product.name +
        "."
    );


    button.textContent =
        "Acheté";


} catch (error) {

    console.error(
        "Erreur achat :",
        error
    );


    showMessage(
        error.message ||
        "Impossible de terminer l'achat."
    );


    button.disabled =
        false;

    button.textContent =
        "Acheter";

}

}

/* =========================================================
DÉMARRAGE
========================================================= */

document.addEventListener(
"DOMContentLoaded",
() => {

    loadProducts();

}

);
