/* =========================================================
   EXONPAY - DEPOSIT.JS

   SESSION UTILISATEUR :
   localStorage → exonpay_user

   FLUX :

   Étape 1 :
   montant + pays

        ↓

   Étape 2 :
   numéro de téléphone

        ↓

   country_id

        ↓

   payment_api_keys

        ↓

   clé API correspondant au pays

        ↓

   create_deposit()

        ↓

   WestPay
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://euyvppbbhjrjcbgmdian.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eXZwcGJiaGpyamNiZ21kaWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjIxNjYsImV4cCI6MjEwMzY5ODE2Nn0.BOH9ZGx5I34wzIkl8oGU7_BZ8yN3zWZSqIrBceb6aH0";


/* =========================================================
   WESTPAY
========================================================= */

/*
   Pour les tests uniquement.

   Tu peux laisser les clés ici comme secours,
   mais la priorité est donnée à la table
   payment_api_keys.
*/

const WESTPAY_API_KEYS = {

    BF: "BFA-E941378690268B23055E9E8616676C3C64E10C7B",

    TG: "TGO-DA61A75EEC4BAC83CC18E6CE38C3121F5E4E7893",

    BJ: "BEN-10F615974C4075AEDB48CE04A1E80FC07A24B0AF",

    CI: "CIV-732506A56813A5FA321B06AA6F32E08EF22C5CEF"

};


/*
   Merchant slug WestPay.
*/

const WESTPAY_MERCHANT_SLUG =
    "shell";


/*
   Page vers laquelle WestPay retourne
   après le paiement.
*/

const WESTPAY_SUCCESS_URL =
    window.location.origin +
    "/payment-success.html";


/*
   Checkout WestPay.
*/

const WESTPAY_CHECKOUT_URL =
    "https://checkout1.westpay.cfd/pay";


/* =========================================================
   SESSION UTILISATEUR
========================================================= */

/*
   C'EST ICI QUE SE TROUVAIT LE PROBLÈME AVANT.

   login.html enregistre :

   localStorage.setItem(
       "exonpay_user",
       JSON.stringify(...)
   );

   Donc nous devons récupérer exactement
   cette même clé.
*/

const savedSession =
    localStorage.getItem("exonpay_user");


/*
   Pas de session = retour connexion.
*/

if (!savedSession) {

    window.location.replace(
        "login.html"
    );

}


/*
   Lecture de la session.
*/

let sessionUser = null;


try {

    sessionUser =
        JSON.parse(savedSession);

} catch (error) {

    console.error(
        "Session invalide :",
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
   Vérification de l'identifiant utilisateur.
*/

if (
    !sessionUser ||
    !sessionUser.user_id
) {

    console.error(
        "Session sans user_id :",
        sessionUser
    );

    localStorage.removeItem(
        "exonpay_user"
    );

    window.location.replace(
        "login.html"
    );

}


/*
   ID UTILISATEUR RÉEL.
*/

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
   VARIABLES DU DÉPÔT
========================================================= */

let selectedAmount = null;

let selectedCountryId = null;

let selectedCountryName = null;

let selectedCountryIso = null;

let selectedApiKey = null;


/* =========================================================
   HEADERS SUPABASE
========================================================= */

function getSupabaseHeaders() {

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

    element.className =
        "message";

}


/* =========================================================
   FORMAT MONTANT
========================================================= */

function formatAmount(amount) {

    return Number(
        amount
    ).toLocaleString(
        "fr-FR"
    ) + " XOF";

}


/* =========================================================
   NETTOYER TÉLÉPHONE
========================================================= */

function cleanPhone(phone) {

    return String(phone || "")
        .trim()
        .replace(/\s+/g, "")
        .replace(/-/g, "");

}


/* =========================================================
   CHARGER LES PAYS
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

                    headers:
                        getSupabaseHeaders()

                }

            );


        const raw =
            await response.text();


        if (!response.ok) {

            console.error(
                "Erreur countries:",
                raw
            );

            throw new Error(
                "Impossible de charger les pays."
            );

        }


        const countries =
            raw
                ? JSON.parse(raw)
                : [];


        countrySelect.innerHTML =
            '<option value="">Sélectionner un pays</option>';


        countries.forEach(
            function(country) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    country.id;


                option.textContent =
                    country.name +
                    " (" +
                    country.iso_code.trim() +
                    ")";


                option.dataset.iso =
                    country.iso_code
                        .trim()
                        .toUpperCase();


                option.dataset.name =
                    country.name;


                option.dataset.dial =
                    country.dial_code;


                countrySelect.appendChild(
                    option
                );

            }
        );


        /*
           Si le pays de la session existe,
           on peut le présélectionner.
        */

        if (sessionUser.country_id) {

            const option =
                Array.from(
                    countrySelect.options
                ).find(
                    function(item) {

                        return item.value ===
                            sessionUser.country_id;

                    }
                );


            if (option) {

                countrySelect.value =
                    sessionUser.country_id;

            }

        }


    } catch (error) {

        console.error(
            error
        );

        showMessage(
            message1,
            error.message ||
            "Erreur lors du chargement des pays."
        );

    }

}


/* =========================================================
   RÉCUPÉRER LA CLÉ API DU PAYS
========================================================= */

async function getCountryApiKey(
    countryId,
    isoCode
) {

    /*
       PRIORITÉ :

       payment_api_keys
       ↓
       country_id
       ↓
       api_key
    */

    try {

        const response =
            await fetch(

                SUPABASE_URL +
                "/rest/v1/payment_api_keys" +
                "?select=api_key,is_active" +
                "&country_id=eq." +
                encodeURIComponent(
                    countryId
                ) +
                "&is_active=eq.true" +
                "&limit=1",

                {
                    method: "GET",

                    headers:
                        getSupabaseHeaders()

                }

            );


        const raw =
            await response.text();


        if (response.ok) {

            const data =
                raw
                    ? JSON.parse(raw)
                    : [];


            if (
                Array.isArray(data) &&
                data.length > 0 &&
                data[0].api_key
            ) {

                console.log(
                    "Clé API trouvée dans payment_api_keys pour :",
                    isoCode
                );


                return data[0].api_key;

            }

        } else {

            console.warn(
                "payment_api_keys inaccessible :",
                raw
            );

        }

    } catch (error) {

        console.warn(
            "Erreur récupération clé :",
            error
        );

    }


    /*
       FALLBACK TEST.

       Si la table n'est pas accessible
       depuis le frontend, on prend la clé
       correspondant directement au code pays.
    */

    if (
        WESTPAY_API_KEYS[isoCode]
    ) {

        console.log(
            "Utilisation de la clé de test pour :",
            isoCode
        );


        return WESTPAY_API_KEYS[
            isoCode
        ];

    }


    throw new Error(
        "Aucune clé API disponible pour " +
        isoCode +
        "."
    );

}


/* =========================================================
   ÉTAPE 1
========================================================= */

nextButton.addEventListener(
    "click",
    async function() {

        hideMessage(message1);


        const amount =
            Number(
                amountInput.value
            );


        const countryId =
            countrySelect.value;


        /*
           Vérification montant.
        */

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


        /*
           Montant entier.
        */

        if (
            !Number.isInteger(amount)
        ) {

            showMessage(
                message1,
                "Le montant doit être un nombre entier."
            );

            return;

        }


        /*
           Minimum actuel de ta fonction
           create_deposit = 3000 XOF
           selon ton code fourni.
        */

        if (
            amount < 3000
        ) {

            showMessage(
                message1,
                "Le dépôt minimum est de 3000 XOF."
            );

            return;

        }


        /*
           Vérification pays.
        */

        if (!countryId) {

            showMessage(
                message1,
                "Veuillez sélectionner un pays."
            );

            return;

        }


        const selectedOption =
            countrySelect.options[
                countrySelect.selectedIndex
            ];


        const iso =
            selectedOption.dataset.iso;


        const name =
            selectedOption.dataset.name;


        if (!iso) {

            showMessage(
                message1,
                "Code pays introuvable."
            );

            return;

        }


        try {

            nextButton.disabled =
                true;

            nextButton.textContent =
                "Chargement...";


            /*
               Récupération AUTOMATIQUE
               de la clé correspondant au pays.
            */

            const apiKey =
                await getCountryApiKey(
                    countryId,
                    iso
                );


            /*
               Sauvegarde temporaire
               pour l'étape 2.
            */

            selectedAmount =
                amount;

            selectedCountryId =
                countryId;

            selectedCountryName =
                name;

            selectedCountryIso =
                iso;

            selectedApiKey =
                apiKey;


            /*
               Résumé.
            */

            summaryAmount.textContent =
                formatAmount(
                    amount
                );


            summaryCountry.textContent =
                name;


            summaryApi.textContent =
                "Configuration " +
                iso;


            /*
               Passage à l'étape 2.
            */

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

            console.error(
                error
            );


            showMessage(
                message1,
                error.message ||
                "Impossible de préparer le paiement."
            );

        } finally {

            nextButton.disabled =
                false;

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

        hideMessage(
            message2
        );


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

async function createDeposit() {

    /*
       IMPORTANT :

       On utilise maintenant :

       sessionUser.user_id

       et NON :

       localStorage.getItem("user_id")
    */

    if (
        !CURRENT_USER_ID
    ) {

        throw new Error(
            "Identifiant utilisateur introuvable dans la session."
        );

    }


    const phone =
        cleanPhone(
            payerPhoneInput.value
        );


    /*
       Appel de TA fonction actuelle :

       create_deposit(
           p_user_id,
           p_amount,
           p_country_id,
           p_payer_phone
       )
    */

    const response =
        await fetch(

            SUPABASE_URL +
            "/rest/v1/rpc/create_deposit",

            {
                method: "POST",

                headers:
                    getSupabaseHeaders(),

                body:
                    JSON.stringify({

                        p_user_id:
                            CURRENT_USER_ID,

                        p_amount:
                            selectedAmount,

                        p_country_id:
                            selectedCountryId,

                        p_payer_phone:
                            phone

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
            "create_deposit:",
            raw
        );


        throw new Error(

            (
                data &&
                typeof data === "object"
            )

                ? (
                    data.message ||
                    data.details ||
                    data.hint ||
                    "Erreur lors de la création du dépôt."
                )

                : "Erreur lors de la création du dépôt."

        );

    }


    /*
       La fonction RETURNS TABLE,
       donc normalement Supabase retourne
       un tableau.
    */

    const deposit =
        Array.isArray(data)
            ? data[0]
            : data;


    if (!deposit) {

        throw new Error(
            "Aucune donnée de dépôt retournée."
        );

    }


    return deposit;

}


/* =========================================================
   CONSTRUIRE LE CHECKOUT WESTPAY
========================================================= */

function buildWestPayUrl(
    deposit
) {

    /*
       Le checkout WestPay reçoit :

       merchant
       amount
       country
       redirect
    */

    const paymentUrl =
        new URL(
            WESTPAY_CHECKOUT_URL
        );


    paymentUrl.searchParams.set(
        "merchant",
        WESTPAY_MERCHANT_SLUG
    );


    paymentUrl.searchParams.set(
        "amount",
        String(
            selectedAmount
        )
    );


    paymentUrl.searchParams.set(
        "country",
        selectedCountryName
    );


    /*
       URL de retour.
    */

    const redirectUrl =
        new URL(
            WESTPAY_SUCCESS_URL,
            window.location.origin
        );


    redirectUrl.searchParams.set(
        "deposit_id",
        deposit.deposit_id
    );


    redirectUrl.searchParams.set(
        "transaction_id",
        deposit.professional_transaction_id
    );


    redirectUrl.searchParams.set(
        "amount",
        String(
            selectedAmount
        )
    );


    paymentUrl.searchParams.set(
        "redirect",
        redirectUrl.toString()
    );


    return paymentUrl.toString();

}


/* =========================================================
   PAIEMENT
========================================================= */

payButton.addEventListener(
    "click",
    async function() {

        hideMessage(
            message2
        );


        const phone =
            cleanPhone(
                payerPhoneInput.value
            );


        /*
           Téléphone obligatoire.
        */

        if (!phone) {

            showMessage(
                message2,
                "Veuillez saisir le numéro utilisé pour le paiement."
            );

            return;

        }


        /*
           Validation basique.
        */

        if (
            phone.length < 8 ||
            phone.length > 30
        ) {

            showMessage(
                message2,
                "Veuillez saisir un numéro de téléphone valide."
            );

            return;

        }


        if (
            !selectedCountryId ||
            !selectedAmount
        ) {

            showMessage(
                message2,
                "Les informations du dépôt sont incomplètes."
            );

            return;

        }


        if (
            !selectedApiKey
        ) {

          
            showMessage(
                message2,
                "La clé API du pays est introuvable."
            );

            return;

        }


        try {

            payButton.disabled =
                true;

            backButton.disabled =
                true;

            loading.style.display =
                "block";


            /*
               1.
               Création du dépôt EXONPAY.
            */

            loading.textContent =
                "Création de votre dépôt...";


            const deposit =
                await createDeposit();


            console.log(
                "Dépôt EXONPAY créé :",
                deposit
            );


            /*
               2.
               Sauvegarde temporaire.
            */

            localStorage.setItem(
                "last_deposit_id",
                deposit.deposit_id
            );


            localStorage.setItem(
                "last_professional_transaction_id",
                deposit.professional_transaction_id
            );


            localStorage.setItem(
                "last_deposit_country",
                selectedCountryIso
            );


            localStorage.setItem(
                "last_deposit_amount",
                String(selectedAmount)
            );


            /*
               3.
               Préparation du checkout.
            */

            loading.textContent =
                "Redirection vers le paiement...";


            const paymentUrl =
                buildWestPayUrl(
                    deposit
                );


            console.log(
                "Pays sélectionné :",
                selectedCountryIso
            );


            /*
               Pour les tests :

               on montre dans la console que
               la clé correspondant au pays
               a bien été récupérée.

               On ne l'affiche PAS dans la page.
            */

            console.log(
                "Clé API sélectionnée pour le pays :",
                selectedCountryIso
            );


            /*
               4.
               Redirection.
            */

            window.location.href =
                paymentUrl;


        } catch (error) {

            console.error(
                "Erreur paiement :",
                error
            );


            showMessage(
                message2,
                error.message ||
                "Impossible de préparer le paiement."
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

        selectedCountryIso =
            null;

        selectedApiKey =
            null;

    }
);


/* =========================================================
   INITIALISATION
========================================================= */

loadCountries();
