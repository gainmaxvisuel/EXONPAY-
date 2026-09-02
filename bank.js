/*
=========================================================
EXONPAY
BANK ACCOUNT
=========================================================
*/

const SUPABASE_URL =
    "https://euyvppbbhjrjcbgmdian.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eXZwcGJiaGpyamNiZ21kaWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjIxNjYsImV4cCI6MjEwMzY5ODE2Nn0.BOH9ZGx5I34wzIkl8oGU7_BZ8yN3zWZSqIrBceb6aH0";


/*
=========================================================
SESSION
=========================================================
*/

const savedUser =
    localStorage.getItem("exonpay_user");

if (!savedUser) {
    window.location.replace("login.html");
}

let sessionUser = null;

try {

    sessionUser = JSON.parse(savedUser);

} catch (error) {

    localStorage.removeItem("exonpay_user");

    window.location.replace("login.html");
}


/*
=========================================================
ELEMENTS
=========================================================
*/

const bankCardWrapper =
    document.getElementById("bankCardWrapper");

const emptyCard =
    document.getElementById("emptyCard");

const accountInfo =
    document.getElementById("accountInfo");

const formCard =
    document.getElementById("formCard");

const createButton =
    document.getElementById("createButton");

const editButton =
    document.getElementById("editButton");

const cancelButton =
    document.getElementById("cancelButton");

const bankForm =
    document.getElementById("bankForm");

const formTitle =
    document.getElementById("formTitle");

const country =
    document.getElementById("country");

const operator =
    document.getElementById("operator");

const prefix =
    document.getElementById("prefix");

const phone =
    document.getElementById("phone");

const recipientName =
    document.getElementById("recipientName");

const transactionPassword =
    document.getElementById("transactionPassword");

const saveButton =
    document.getElementById("saveButton");

const message =
    document.getElementById("message");


/*
=========================================================
PAYS
=========================================================
*/

const prefixes = {

    BF: "+226",

    BJ: "+229",

    CI: "+225",

    TG: "+228"

};


const countryNames = {

    BF: "Burkina Faso",

    BJ: "Bénin",

    CI: "Côte d’Ivoire",

    TG: "TOGO"

};


/*
=========================================================
OPERATEURS
=========================================================
*/

const operatorsByCountry = {

    BF: [
        {
            value: "orange money",
            label: "Orange Money"
        },
        {
            value: "moov money",
            label: "Moov Money"
        },
        {
            value: "wave",
            label: "Wave"
        }
    ],

    BJ: [
        {
            value: "mtn mobile money",
            label: "MTN Mobile Money"
        },
        {
            value: "moov money",
            label: "Moov Money"
        },
        {
            value: "wave",
            label: "Wave"
        }
    ],

    CI: [
        {
            value: "orange money",
            label: "Orange Money"
        },
        {
            value: "mtn money",
            label: "MTN Money"
        },
        {
            value: "moov money",
            label: "Moov Money"
        },
        {
            value: "wave",
            label: "Wave"
        }
    ]

    
        TG: [
        {
            value: "MTN",
            label: "MTN"
        },
        {
            value: "moov money",
            label: "Moov Money"
        },
        {
            value: "wave",
            label: "Wave"
        }
    ],

};


/*
=========================================================
HEADERS
=========================================================
*/

function getHeaders() {

    return {

        "Content-Type":
            "application/json",

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

    message.textContent = text;

    message.className =
        "message " + type;

}


/*
=========================================================
OPERATEURS
=========================================================
*/

function updateOperators(
    selectedOperator = ""
) {

    const countryCode =
        country.value;

    operator.innerHTML = "";

    if (!countryCode) {

        operator.disabled = true;

        const option =
            document.createElement("option");

        option.value = "";

        option.textContent =
            "Sélectionner d'abord le pays";

        operator.appendChild(option);

        prefix.value = "+226";

        return;
    }

    operator.disabled = false;

    const firstOption =
        document.createElement("option");

    firstOption.value = "";

    firstOption.textContent =
        "Sélectionner un opérateur";

    operator.appendChild(firstOption);

    const operators =
        operatorsByCountry[countryCode] || [];

    operators.forEach(
        function(item) {

            const option =
                document.createElement("option");

            option.value =
                item.value;

            option.textContent =
                item.label;

            operator.appendChild(option);

        }
    );

    prefix.value =
        prefixes[countryCode] || "+226";

    if (selectedOperator) {

        operator.value =
            selectedOperator
                .toString()
                .trim()
                .toLowerCase();

    }
}


/*
=========================================================
PAYS
=========================================================
*/

country.addEventListener(
    "change",
    function() {

        updateOperators();

        phone.value = "";

        showMessage("");

    }
);


/*
=========================================================
OUVRIR FORMULAIRE
=========================================================
*/

function openForm(
    editMode = false
) {

    formCard.style.display =
        "block";

    formTitle.textContent =
        editMode
            ? "Modifier le compte bancaire"
            : "Créer un compte bancaire";

    if (!editMode) {

        bankForm.reset();

        updateOperators();

    }

    setTimeout(
        function() {

            formCard.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        },
        50
    );
}


/*
=========================================================
FERMER FORMULAIRE
=========================================================
*/

function closeForm() {

    formCard.style.display =
        "none";

    showMessage("");
}


/*
=========================================================
BOUTON CREER
=========================================================
*/

createButton.addEventListener(
    "click",
    function() {

        openForm(false);

    }
);


/*
=========================================================
BOUTON MODIFIER
=========================================================
*/

editButton.addEventListener(
    "click",
    function() {

        openForm(true);

    }
);


/*
=========================================================
ANNULER
=========================================================
*/

cancelButton.addEventListener(
    "click",
    function() {

        closeForm();

    }
);


/*
=========================================================
DETERMINER PAYS
=========================================================
*/

function findCountryCode(
    dialCode
) {

    if (dialCode === "+226") {
        return "BF";
    }

    if (dialCode === "+229") {
        return "BJ";
    }

    if (dialCode === "+225") {
        return "CI";
    }

    if (dialCode === "+228") {
        return "TG";
    }

    return "";

}


/*
=========================================================
OPERATEUR AFFICHAGE
=========================================================
*/

function formatOperator(
    value
) {

    if (!value) {
        return "--";
    }

    const normalized =
        value
            .toString()
            .trim()
            .toLowerCase();

    const labels = {

        "orange money":
            "Orange Money",

        "moov money":
            "Moov Money",

        "wave":
            "Wave",

        "mtn money":
            "MTN Money",

        "mtn mobile money":
            "MTN Mobile Money"

    };

    return labels[normalized] || value;
}


/*
=========================================================
NUMERO CARTE
=========================================================

On ne montre pas le numéro complet.

On utilise les 4 derniers chiffres du numéro
de téléphone comme identifiant visuel.
=========================================================
*/

function formatCardNumber(
    phoneNumber
) {

    if (!phoneNumber) {

        return "•••• •••• •••• ••••";

    }

    const digits =
        phoneNumber
            .toString()
            .replace(/\D/g, "");

    const lastFour =
        digits.slice(-4);

    return (
        "•••• •••• •••• " +
        lastFour
    );
}


/*
=========================================================
AFFICHER COMPTE
=========================================================
*/

function showAccount(
    account
) {

    bankCardWrapper.style.display =
        "block";

    emptyCard.style.display =
        "none";


    /*
    -----------------------------------------------
    BENEFICIAIRE
    -----------------------------------------------
    */

    const recipient =
        account.recipient_name ||
        account.account_name ||
        "--";


    document.getElementById(
        "cardRecipient"
    ).textContent =
        recipient;


    /*
    -----------------------------------------------
    OPERATEUR
    -----------------------------------------------
    */

    document.getElementById(
        "cardOperator"
    ).textContent =
        formatOperator(
            account.operator
        );


    /*
    -----------------------------------------------
    PAYS
    -----------------------------------------------
    */

    const dialCode =
        account.dial_code ||
        account.country_dial_code ||
        sessionUser.dial_code ||
        "";

    const countryCode =
        findCountryCode(
            dialCode
        );


    document.getElementById(
        "cardCountry"
    ).textContent =

        account.country_name ||
        countryNames[countryCode] ||
        "--";


    /*
    -----------------------------------------------
    TELEPHONE
    -----------------------------------------------
    */

    const accountPhone =
        account.phone_number ||
        "";

    document.getElementById(
        "cardPhone"
    ).textContent =

        dialCode
            ? dialCode + " " + accountPhone
            : accountPhone || "--";


    /*
    -----------------------------------------------
    NUMERO CARTE
    -----------------------------------------------
    */

    document.getElementById(
        "cardNumber"
    ).textContent =
        formatCardNumber(
            accountPhone
        );


    /*
    -----------------------------------------------
    STATUT
    -----------------------------------------------
    */

    document.getElementById(
        "cardStatus"
    ).textContent =
        account.is_active === false
            ? "Inactif"
            : "Actif";


    /*
    -----------------------------------------------
    PREPARER MODIFICATION
    -----------------------------------------------
    */

    recipientName.value =
        account.recipient_name ||
        account.account_name ||
        "";

    country.value =
        countryCode;

    updateOperators(
        account.operator || ""
    );

    phone.value =
        accountPhone;

    transactionPassword.value =
        "";

}


/*
=========================================================
ETAT VIDE
=========================================================
*/

function showEmptyState() {

    bankCardWrapper.style.display =
        "none";

    emptyCard.style.display =
        "block";

    formCard.style.display =
        "none";

}


/*
=========================================================
CHARGER COMPTE BANCAIRE
=========================================================
*/

async function loadBankAccount() {

    const userId =
        sessionUser &&
        sessionUser.user_id;


    if (!userId) {

        console.error(
            "user_id absent de la session."
        );

        return;

    }


    const url =
        SUPABASE_URL +
        "/rest/v1/bank_accounts" +
        "?select=*" +
        "&user_id=eq." +
        encodeURIComponent(userId) +
        "&is_active=eq.true" +
        "&limit=1";


    try {

        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        const raw =
            await response.text();


        if (!response.ok) {

            console.error(
                "Erreur bank_accounts:",
                raw
            );

            showEmptyState();

            return;
        }


        const data =
            raw
                ? JSON.parse(raw)
                : [];


        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {

            showEmptyState();

            return;
        }


        showAccount(
            data[0]
        );


    } catch (error) {

        console.error(
            "Erreur chargement compte:",
            error
        );

        showEmptyState();

    }
}


/*
=========================================================
VALIDATION OPERATEUR
=========================================================
*/

function isAllowedOperator(
    countryCode,
    operatorValue
) {

    const operators =
        operatorsByCountry[
            countryCode
        ] || [];


    return operators.some(
        function(item) {

            return (
                item.value.toLowerCase() ===
                operatorValue.toLowerCase()
            );

        }
    );
}


/*
=========================================================
ENREGISTREMENT
=========================================================
*/

bankForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        showMessage("");


        const userId =
            sessionUser &&
            sessionUser.user_id;


        const countryCode =
            country.value;


        const operatorValue =
            operator.value.trim();


        const recipient =
            recipientName.value.trim();


        const phoneNumber =
            phone.value.trim();


        const transactionPasswordValue =
            transactionPassword.value;


        if (!userId) {

            showMessage(
                "Session utilisateur invalide.",
                "error"
            );

            return;

        }


        if (!countryCode) {

            showMessage(
                "Veuillez sélectionner votre pays.",
                "error"
            );

            return;

        }


        if (!operatorValue) {

            showMessage(
                "Veuillez sélectionner votre opérateur.",
                "error"
            );

            return;

        }


        if (
            !isAllowedOperator(
                countryCode,
                operatorValue
            )
        ) {

            showMessage(
                "Cet opérateur n'est pas autorisé dans ce pays.",
                "error"
            );

            return;

        }


        if (!recipient) {

            showMessage(
                "Le nom du bénéficiaire est obligatoire.",
                "error"
            );

            return;

        }


        if (
            !/^[0-9]+$/.test(
                phoneNumber
            )
        ) {

            showMessage(
                "Le numéro doit contenir uniquement des chiffres.",
                "error"
            );

            return;

        }


        if (
            !transactionPasswordValue ||
            transactionPasswordValue.length < 4
        ) {

            showMessage(
                "Le mot de passe de transaction doit contenir au moins 4 caractères.",
                "error"
            );

            return;

        }


        saveButton.disabled = true;
        cancelButton.disabled = true;

        saveButton.textContent =
            "Enregistrement…";


        try {

            const response =
                await fetch(

                    SUPABASE_URL +
                    "/rest/v1/rpc/save_payout_account",

                    {
                        method: "POST",

                        headers: getHeaders(),

                        body:
                            JSON.stringify({

                                p_user_id:
                                    userId,

                                p_recipient_name:
                                    recipient,

                                p_operator:
                                    operatorValue,

                                p_country_dial_code:
                                    prefixes[
                                        countryCode
                                    ],

                                p_phone_number:
                                    phoneNumber,

                                p_transaction_password:
                                    transactionPasswordValue

                            })

                    }
                );


            const raw =
                await response.text();


            let data = null;


            try {

                data =
                    raw
                        ? JSON.parse(raw)
                        : null;

            } catch {

                data = null;

            }


            if (!response.ok) {

                console.error(
                    "save_payout_account:",
                    raw
                );


                let errorMessage =
                    "Impossible d'enregistrer le compte bancaire.";


                if (
                    data &&
                    typeof data === "object"
                ) {

                    errorMessage =
                        data.message ||
                        data.details ||
                        data.hint ||
                        errorMessage;

                }


                throw new Error(
                    errorMessage
                );

            }


            showMessage(
                "Compte bancaire enregistré avec succès.",
                "success"
            );


            transactionPassword.value =
                "";


            await loadBankAccount();


            closeForm();


        } catch (error) {

            console.error(
                "Erreur enregistrement:",
                error
            );


            showMessage(
                error.message ||
                "Une erreur est survenue.",
                "error"
            );


        } finally {

            saveButton.disabled =
                false;

            cancelButton.disabled =
                false;

            saveButton.textContent =
                "Enregistrer";

        }

    }
);


/*
=========================================================
INITIALISATION
=========================================================
*/

updateOperators();

loadBankAccount();
