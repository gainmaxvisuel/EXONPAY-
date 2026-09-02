/*
=========================================================
EXONPAY
TRANSACTIONS
=========================================================
*/


/*
=========================================================
SUPABASE
=========================================================
*/

const SUPABASE_URL =
    "https://euyvppbbhjrjcbgmdian.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eXZwcGJiaGpyamNiZ21kaWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjIxNjYsImV4cCI6MjEwMzY5ODE2Nn0.BOH9ZGx5I34wzIkl8oGU7_BZ8yN3zWZSqIrBceb6aH0";


/*
=========================================================
SESSION UTILISATEUR
=========================================================
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

    console.error(
        "Session invalide:",
        error
    );

    localStorage.removeItem(
        "exonpay_user"
    );

    window.location.replace(
        "login.html"
    );

}


/*
=========================================================
ELEMENTS
=========================================================
*/

const professionalId =
    document.getElementById(
        "professionalId"
    );

const typeFilter =
    document.getElementById(
        "typeFilter"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );

const loading =
    document.getElementById(
        "loading"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const transactionsContainer =
    document.getElementById(
        "transactions"
    );

const message =
    document.getElementById(
        "message"
    );


/*
=========================================================
AFFICHER L'ID PROFESSIONNEL
=========================================================
*/

professionalId.textContent =
    sessionUser &&
    sessionUser.professional_id
        ? sessionUser.professional_id
        : "--";


/*
=========================================================
HEADERS SUPABASE
=========================================================
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
=========================================================
MESSAGE
=========================================================
*/

function showMessage(
    text,
    type = ""
) {

    message.textContent =
        text;

    message.className =
        "message " + type;

}


/*
=========================================================
FORMAT MONTANT
=========================================================
*/

function formatMoney(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(
        "fr-FR",
        {
            maximumFractionDigits: 0
        }
    ) + " FCFA";

}


/*
=========================================================
FORMAT DATE
=========================================================
*/

function formatDate(
    value
) {

    if (!value) {
        return "--";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleString(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/*
=========================================================
LIBELLES DES TYPES
=========================================================
*/

function formatTransactionType(
    type
) {

    const labels = {

        deposit:
            "Rechargement",

        product_purchase:
            "Achat de produit",

        product_income:
            "Revenu produit",

        commission:
            "Commission",

        withdrawal:
            "Retrait",

        transfer:
            "Transfert"

    };


    return labels[type] ||
        type ||
        "Transaction";

}


/*
=========================================================
LIBELLES DES STATUTS
=========================================================
*/

function formatStatus(
    status
) {

    const normalized =
        String(
            status || ""
        ).toLowerCase();


    if (
        normalized ===
        "completed"
    ) {

        return {
            label: "Terminée",
            className:
                "status-success"
        };

    }


    if (
        normalized ===
        "pending"
    ) {

        return {
            label: "En attente",
            className:
                "status-pending"
        };

    }


    if (
        normalized ===
        "failed"
    ) {

        return {
            label: "Échouée",
            className:
                "status-failed"
        };

    }


    return {

        label:
            status || "Inconnu",

        className:
            "status-other"

    };

}


/*
=========================================================
ECHAPPER LE HTML
=========================================================

Sécurité importante :
les données provenant de la base ne doivent pas
être injectées directement dans innerHTML.
=========================================================
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
=========================================================
AFFICHER UNE TRANSACTION
=========================================================
*/

function renderTransaction(
    transaction
) {

    const status =
        formatStatus(
            transaction.status
        );


    const title =
        formatTransactionType(
            transaction.transaction_type
        );


    const description =
        transaction.description ||
        title;


    const amount =
        formatMoney(
            transaction.amount
        );


    const transactionId =
        transaction.professional_transaction_id ||
        transaction.id ||
        "--";


    const date =
        formatDate(
            transaction.created_at
        );


    const wallet =
        transaction.wallet_type ||
        "";


    /*
    Déterminer si le montant est un crédit
    ou un débit selon le type.
    */

    const creditTypes = [

        "deposit",

        "product_income",

        "commission"

    ];


    const isCredit =
        creditTypes.includes(
            transaction.transaction_type
        );


    const amountPrefix =
        isCredit
            ? "+"
            : "-";


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "transaction-card";


    card.innerHTML = `

        <div class="transaction-top">

            <div>

                <div class="transaction-title">
                    ${escapeHtml(title)}
                </div>

                <div class="transaction-date">
                    ${escapeHtml(date)}
                </div>

            </div>


            <div class="transaction-amount">

                ${amountPrefix}
                ${escapeHtml(amount)}

            </div>

        </div>


        <div
            style="
                margin-top:8px;
                color:#6b7280;
                font-size:13px;
                line-height:1.4;
            "
        >

            ${escapeHtml(description)}

        </div>


        <div class="transaction-bottom">

            <div class="transaction-id">

                ID :
                ${escapeHtml(transactionId)}

                ${
                    wallet
                        ? " · " +
                          escapeHtml(wallet)
                        : ""
                }

            </div>


            <div
                class="status ${status.className}"
            >

                ${escapeHtml(status.label)}

            </div>

        </div>

    `;


    transactionsContainer.appendChild(
        card
    );

}


/*
=========================================================
AFFICHER LES TRANSACTIONS
=========================================================
*/

function renderTransactions(
    data
) {

    transactionsContainer.innerHTML =
        "";

    emptyState.style.display =
        "none";


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        emptyState.style.display =
            "block";

        return;

    }


    data.forEach(
        function(transaction) {

            renderTransaction(
                transaction
            );

        }
    );

}


/*
=========================================================
CHARGER LES TRANSACTIONS
=========================================================
*/

async function loadTransactions() {

    const userId =
        sessionUser &&
        sessionUser.user_id;


    if (!userId) {

        loading.style.display =
            "none";

        showMessage(
            "Session utilisateur invalide.",
            "error"
        );

        return;

    }


    loading.style.display =
        "block";

    emptyState.style.display =
        "none";

    transactionsContainer.innerHTML =
        "";

    showMessage("");


    /*
    =====================================================
    TABLE REELLE DE LA BASE :

    public.transactions

    On récupère uniquement les transactions
    appartenant à l'utilisateur connecté.
    =====================================================
    */

    let url =
        SUPABASE_URL +
        "/rest/v1/transactions" +
        "?select=" +
        [
            "id",
            "professional_transaction_id",
            "user_id",
            "transaction_type",
            "wallet_type",
            "amount",
            "balance_before",
            "balance_after",
            "reference_id",
            "related_transaction_id",
            "description",
            "status",
            "created_at"
        ].join(",") +
        "&user_id=eq." +
        encodeURIComponent(
            userId
        ) +
        "&order=created_at.desc";


    /*
    -----------------------------------------------------
    FILTRE TYPE
    -----------------------------------------------------
    */

    const selectedType =
        typeFilter.value;


    if (selectedType) {

        url +=
            "&transaction_type=eq." +
            encodeURIComponent(
                selectedType
            );

    }


    /*
    -----------------------------------------------------
    FILTRE STATUT
    -----------------------------------------------------
    */

    const selectedStatus =
        statusFilter.value;


    if (selectedStatus) {

        url +=
            "&status=eq." +
            encodeURIComponent(
                selectedStatus
            );

    }


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
                "Erreur transactions:",
                raw
            );


            let errorMessage =
                "Impossible de récupérer les transactions.";


            try {

                const errorData =
                    JSON.parse(raw);


                errorMessage =
                    errorData.message ||
                    errorData.details ||
                    errorData.hint ||
                    errorMessage;

            } catch {

                // réponse non JSON

            }


            throw new Error(
                errorMessage
            );

        }


        let data = [];


        try {

            data =
                raw
                    ? JSON.parse(raw)
                    : [];

        } catch {

            data = [];

        }


        /*
        -----------------------------------------------------
        FIN CHARGEMENT
        -----------------------------------------------------
        */

        loading.style.display =
            "none";


        /*
        -----------------------------------------------------
        AFFICHAGE
        -----------------------------------------------------
        */

        renderTransactions(
            data
        );


    } catch (error) {

        console.error(
            "Erreur chargement transactions:",
            error
        );


        loading.style.display =
            "none";


        transactionsContainer.innerHTML =
            "";


        emptyState.style.display =
            "none";


        showMessage(
            error.message ||
            "Impossible de charger les transactions.",
            "error"
        );

    }

}


/*
=========================================================
FILTRES
=========================================================
*/

typeFilter.addEventListener(
    "change",
    function() {

        loadTransactions();

    }
);


statusFilter.addEventListener(
    "change",
    function() {

        loadTransactions();

    }
);


/*
=========================================================
CHARGEMENT INITIAL
=========================================================
*/

loadTransactions();


/*
=========================================================
ACTUALISATION AUTOMATIQUE
=========================================================

Toutes les 30 secondes.
=========================================================
*/

setInterval(
    loadTransactions,
    30000
);