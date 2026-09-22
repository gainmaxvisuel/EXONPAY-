/* =========================================================
   EXONPAY - DEPOSIT.JS
   Nouveau système de dépôt avec preuve de paiement

   Flux :
   Étape 1 : montant + pays
        ↓
   Étape 2 : numéro ayant effectué le paiement
        ↓
   Envoi du dépôt + preuve
        ↓
   Validation manuelle
========================================================= */

const SUPABASE_URL =
    "https://euyvppbbhjrjcbgmdian.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmJiaGpyjcbgmdianIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjIxNjYsImV4cCI6MjEwMzY5ODE2Nn0.BOH9ZG5xI34wzIkl8oGU7_BZ8yN3zWZSqIrBceb6aH0";

const DEPOSIT_FUNCTION =
    SUPABASE_URL +
    "/functions/v1/submit-deposit-wave";


/* =========================================================
   SESSION
========================================================= */

const savedSession =
    localStorage.getItem("exonpay_user");

if (!savedSession) {
    window.location.replace("login.html");
}

let sessionUser = null;

try {
    sessionUser = JSON.parse(savedSession);
} catch (error) {

    console.error("Session invalide :", error);

    localStorage.removeItem("exonpay_user");

    window.location.replace("login.html");
}

if (!sessionUser || !sessionUser.user_id) {

    localStorage.removeItem("exonpay_user");

    window.location.replace("login.html");
}

const CURRENT_USER_ID =
    sessionUser.user_id;


/* =========================================================
   ELEMENTS
========================================================= */

const step1 =
    document.getElementById("step1");

const step2 =
    document.getElementById("step2");

const circle1 =
    document.getElementById("circle1");

const circle2 =
    document.getElementById("circle2");

const amountInput =
    document.getElementById("amount");

const countrySelect =
    document.getElementById("country");

const payerPhoneInput =
    document.getElementById("payerPhone");

const nextButton =
    document.getElementById("nextButton");

const payButton =
    document.getElementById("payButton");

const backButton =
    document.getElementById("backButton");

const message1 =
    document.getElementById("message1");

const message2 =
    document.getElementById("message2");

const summaryAmount =
    document.getElementById("summaryAmount");

const summaryCountry =
    document.getElementById("summaryCountry");

const summaryApi =
    document.getElementById("summaryApi");

const loading =
    document.getElementById("loading");


/* =========================================================
   VARIABLES
========================================================= */

let selectedAmount = null;
let selectedCountryId = null;
let selectedCountryName = null;


/* =========================================================
   HEADERS
========================================================= */

function getHeaders() {

    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization":
            "Bearer " + SUPABASE_ANON_KEY,
        "Accept":
            "application/json"
    };
}


/* =========================================================
   MESSAGES
========================================================= */

function showMessage(
    element,
    text,
    type = "error"
) {

    element.textContent = text;

    element.className =
        "message " + type;
}


function hideMessage(element) {

    element.textContent = "";

    element.className = "message";
}


/* =========================================================
   FORMAT MONTANT
========================================================= */

function formatAmount(amount) {

    return Number(amount)
        .toLocaleString("fr-FR") +
        " XOF";
}


/* =========================================================
   TÉLÉPHONE
========================================================= */

function cleanPhone(phone) {

    return String(phone || "")
        .trim()
        .replace(/\s+/g, "")
        .replace(/-/g, "");
}


/* =========================================================
   CHARGER LES PAYS DEPUIS LA BASE
========================================================= */

async function loadCountries() {

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/countries" +
                "?select=id,name,iso_code,dial_code,currency_code" +
                "&is_active=eq.true" +
                "&order=name.asc",
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );

        const raw =
            await response.text();

        if (!response.ok) {

            console.error(
                "Erreur countries :",
                raw
            );

            throw new Error(
                "Impossible de charger les pays."
            );
        }

        const countries =
            raw ? JSON.parse(raw) : [];

        countrySelect.innerHTML =
            '<option value="">Sélectionner un pays</option>';

        countries.forEach(country => {

            const option =
                document.createElement("option");

            option.value =
                country.id;

            option.textContent =
                country.name +
                " (" +
                country.iso_code.trim() +
                ")";

            countrySelect.appendChild(option);
        });


        /*
         * Présélection du pays du compte
         */
        if (sessionUser.country_id) {

            const option =
                Array.from(
                    countrySelect.options
                ).find(
                    item =>
                        item.value ===
                        sessionUser.country_id
                );

            if (option) {

                countrySelect.value =
                    sessionUser.country_id;
            }
        }

    } catch (error) {

        console.error(error);

        showMessage(
            message1,
            error.message ||
            "Erreur lors du chargement des pays."
        );
    }
}


/* =========================================================
   ÉTAPE 1
========================================================= */

nextButton.addEventListener(
    "click",
    async function() {

        hideMessage(message1);

        const amount =
            Number(amountInput.value);

        const countryId =
            countrySelect.value;


        /* Montant */

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            showMessage(
                message1,
                "Veuillez saisir un montant valide."
            );

            return;
        }


        if (!Number.isInteger(amount)) {

            showMessage(
                message1,
                "Le montant doit être un nombre entier."
            );

            return;
        }


        /* Pays */

        if (!countryId) {

            showMessage(
                message1,
                "Veuillez sélectionner un pays."
            );

            return;
        }


        const option =
            countrySelect.options[
                countrySelect.selectedIndex
            ];


        try {

            nextButton.disabled = true;

            nextButton.textContent =
                "Chargement...";


            selectedAmount =
                amount;

            selectedCountryId =
                countryId;

            selectedCountryName =
                option.textContent;


            summaryAmount.textContent =
                formatAmount(amount);

            summaryCountry.textContent =
                selectedCountryName;

            summaryApi.textContent =
                "Configuration automatique";


            step1.style.display =
                "none";

            step2.style.display =
                "block";

            circle1.classList.add(
                "active"
            );

            circle2.classList.add(
                "active"
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (error) {

            showMessage(
                message1,
                error.message ||
                "Impossible de continuer."
            );

        } finally {

            nextButton.disabled = false;

            nextButton.textContent =
                "Suivant";
        }
    }
);


/* =========================================================
   RETOUR
========================================================= */

backButton.addEventListener(
    "click",
    function() {

        hideMessage(message2);

        step2.style.display =
            "none";

        step1.style.display =
            "block";

        circle2.classList.remove(
            "active"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


/* =========================================================
   CRÉER LE DÉPÔT
========================================================= */

async function submitDeposit() {

    const phone =
        cleanPhone(
            payerPhoneInput.value
        );


    if (!phone) {

        throw new Error(
            "Veuillez saisir le numéro utilisé pour effectuer le paiement."
        );
    }


    if (
        phone.length < 8 ||
        phone.length > 20
    ) {

        throw new Error(
            "Veuillez saisir un numéro de téléphone valide."
        );
    }


    if (
        !selectedAmount ||
        !selectedCountryId
    ) {

        throw new Error(
            "Les informations du dépôt sont incomplètes."
        );
    }


    /*
     * Le mot de passe utilisé par la fonction
     * vient de la session si le login l'y conserve.
     */

    const accountPhone =
        sessionUser.phone ||
        sessionUser.phone_number ||
        "";

    const password =
        sessionUser.password ||
        sessionUser.login_password ||
        localStorage.getItem("exonpay_password") ||
        "";


    if (!accountPhone) {

        throw new Error(
            "Numéro du compte introuvable. Veuillez vous reconnecter."
        );
    }


    if (!password) {

        throw new Error(
            "Authentification introuvable. Veuillez vous reconnecter."
        );
    }


    /*
     * Pour la nouvelle version :
     * la preuve est obligatoire.
     *
     * On récupère automatiquement un input file
     * s'il existe sur la page.
     */

    const proofInput =
        document.querySelector(
            'input[type="file"]'
        );


    if (!proofInput || !proofInput.files.length) {

        throw new Error(
            "Veuillez joindre la preuve de paiement."
        );
    }


    const proof =
        proofInput.files[0];


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (!allowedTypes.includes(proof.type)) {

        throw new Error(
            "La preuve doit être une image JPG, PNG ou WebP."
        );
    }


    if (
        proof.size >
        10 * 1024 * 1024
    ) {

        throw new Error(
            "La preuve ne doit pas dépasser 10 Mo."
        );
    }


    /*
     * FormData
     */

    const formData =
        new FormData();

    formData.append(
        "phone",
        accountPhone
    );

    formData.append(
        "password",
        password
    );

    formData.append(
        "amount",
        String(selectedAmount)
    );

    formData.append(
        "payer_phone",
        phone
    );

    formData.append(
        "country_id",
        selectedCountryId
    );

    formData.append(
        "proof",
        proof,
        proof.name
    );


    /*
     * Envoi au Edge Function
     */

    const response =
        await fetch(
            DEPOSIT_FUNCTION,
            {
                method: "POST",
                headers: {
                    "Accept":
                        "application/json"
                },
                body: formData
            }
        );


    const raw =
        await response.text();

    let data = null;

    try {
        data =
            raw ? JSON.parse(raw) : null;
    } catch {
        data = null;
    }


    if (!response.ok) {

        console.error(
            "submit-deposit-wave :",
            raw
        );

        throw new Error(
            data?.error ||
            data?.message ||
            "Impossible d'envoyer le dépôt."
        );
    }


    return data;
}


/* =========================================================
   BOUTON PAIEMENT
========================================================= */

payButton.addEventListener(
    "click",
    async function() {

        hideMessage(message2);

        try {

            payButton.disabled = true;

            backButton.disabled = true;

            loading.style.display =
                "block";

            loading.textContent =
                "Envoi de votre dépôt...";


            const result =
                await submitDeposit();


            console.log(
                "Dépôt créé :",
                result
            );


            /*
             * Sauvegarde de la référence
             */

            const deposit =
                result.deposit ||
                result;


            if (deposit.deposit_id) {

                localStorage.setItem(
                    "last_deposit_id",
                    deposit.deposit_id
                );
            }


            if (
                deposit.professional_transaction_id
            ) {

                localStorage.setItem(
                    "last_professional_transaction_id",
                    deposit.professional_transaction_id
                );
            }


            /*
             * Après envoi :
             * retour vers la page de confirmation.
             */

            loading.textContent =
                "Dépôt envoyé. En attente de validation...";


            setTimeout(
                function() {

                    /*
                     * Si ta page possède une étape 3/4,
                     * on peut l'afficher ici.
                     *
                     * Sinon on affiche simplement
                     * le message de succès.
                     */

                    showMessage(
                        message2,
                        "Dépôt envoyé avec succès. Votre paiement sera vérifié avant le crédit de votre solde.",
                        "success"
                    );

                    loading.style.display =
                        "none";

                    payButton.textContent =
                        "Dépôt envoyé";

                },
                500
            );


        } catch (error) {

            console.error(
                "Erreur dépôt :",
                error
            );

            showMessage(
                message2,
                error.message ||
                "Impossible d'envoyer le dépôt."
            );

            payButton.disabled =
                false;

            backButton.disabled =
                false;

            loading.style.display =
                "none";
        }
    }
);


/* =========================================================
   CHANGEMENT DE PAYS
========================================================= */

countrySelect.addEventListener(
    "change",
    function() {

        selectedCountryId =
            null;

        selectedCountryName =
            null;
    }
);


/* =========================================================
   INITIALISATION
========================================================= */

loadCountries();
