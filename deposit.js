const SUPABASE_URL =
    "https://euyvppbbhjrjcbgmdian.supabase.co";

const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmJiaGpyjcbgmdianIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjIxNjYsImV4cCI6MjEwMzY5ODE2Nn0.BOH9ZG5xI34wzIkl8oGU7_BZ8yN3zWZSqIrBceb6aH0";

const FUNCTION_URL =
    SUPABASE_URL +
    "/functions/v1/submit-deposit-wave";

const headers = {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + SUPABASE_KEY
};


/* =========================
   SESSION
========================= */

let sessionUser;

try {
    sessionUser = JSON.parse(
        localStorage.getItem("exonpay_user")
    );
} catch (e) {
    sessionUser = null;
}

if (!sessionUser?.user_id) {
    window.location.href = "login.html";
}


/* =========================
   ELEMENTS
========================= */

const amount = document.getElementById("amount");
const country = document.getElementById("country");
const payerPhone = document.getElementById("payerPhone");
const proof = document.getElementById("proof");

const nextButton = document.getElementById("nextButton");
const payButton = document.getElementById("payButton");
const backButton = document.getElementById("backButton");

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");

const circle1 = document.getElementById("circle1");
const circle2 = document.getElementById("circle2");

const message1 = document.getElementById("message1");
const message2 = document.getElementById("message2");

const summaryAmount =
    document.getElementById("summaryAmount");

const summaryCountry =
    document.getElementById("summaryCountry");

const summaryApi =
    document.getElementById("summaryApi");

const paymentMethod =
    document.getElementById("paymentMethod");

const receiverNumber =
    document.getElementById("receiverNumber");

const loading =
    document.getElementById("loading");


let selectedCountryId = null;
let selectedAmount = 0;


/* =========================
   MESSAGE
========================= */

function message(element, text, type = "error") {
    element.textContent = text;
    element.className = "message " + type;
}


/* =========================
   CHARGER LES PAYS
========================= */

async function loadCountries() {

    try {

        const url =
            SUPABASE_URL +
            "/rest/v1/countries" +
            "?select=id,name,iso_code,dial_code,currency_code" +
            "&is_active=eq.true" +
            "&order=name.asc";

        const response =
            await fetch(url, {
                headers
            });

        if (!response.ok) {

            const error =
                await response.text();

            console.error(
                "Erreur countries:",
                error
            );

            throw new Error(
                "Impossible de charger les pays."
            );
        }

        const countries =
            await response.json();

        country.innerHTML =
            '<option value="">Sélectionner un pays</option>';

        countries.forEach(item => {

            const option =
                document.createElement("option");

            option.value = item.id;

            option.textContent =
                item.name +
                " (" +
                item.iso_code.trim() +
                ")";

            country.appendChild(option);
        });

        /*
         * S'il n'y a qu'un seul pays actif,
         * il est automatiquement sélectionné.
         */

        if (countries.length === 1) {

            country.value =
                countries[0].id;

            selectedCountryId =
                countries[0].id;
        }

    } catch (error) {

        console.error(error);

        message(
            message1,
            error.message
        );
    }
}


/* =========================
   CHARGER CONFIGURATION
========================= */

async function loadPaymentSettings() {

    try {

        const url =
            SUPABASE_URL +
            "/rest/v1/platform_settings" +
            "?select=setting_key,setting_value" +
            "&setting_key=in.(deposit_payment_method,deposit_receiver_number)" +
            "&is_active=eq.true";

        const response =
            await fetch(url, {
                headers
            });

        if (!response.ok) {
            throw new Error(
                "Impossible de charger la configuration du paiement."
            );
        }

        const settings =
            await response.json();

        const config = {};

        settings.forEach(item => {
            config[item.setting_key] =
                item.setting_value;
        });

        paymentMethod.textContent =
            config.deposit_payment_method || "-";

        receiverNumber.textContent =
            config.deposit_receiver_number || "-";

        summaryApi.textContent =
            config.deposit_payment_method || "-";

    } catch (error) {

        console.error(error);

        paymentMethod.textContent = "-";
        receiverNumber.textContent = "-";
        summaryApi.textContent = "-";
    }
}


/* =========================
   ÉTAPE 1
========================= */

nextButton.addEventListener(
    "click",
    function () {

        message1.textContent = "";

        const value =
            Number(amount.value);

        if (!Number.isFinite(value) || value <= 0) {

            message(
                message1,
                "Veuillez saisir un montant valide."
            );

            return;
        }

        if (!country.value) {

            message(
                message1,
                "Veuillez sélectionner un pays."
            );

            return;
        }

        selectedAmount = value;
        selectedCountryId = country.value;

        const option =
            country.options[
                country.selectedIndex
            ];

        summaryAmount.textContent =
            value.toLocaleString("fr-FR") +
            " XOF";

        summaryCountry.textContent =
            option.textContent;

        step1.style.display = "none";
        step2.style.display = "block";

        circle1.classList.add("active");
        circle2.classList.add("active");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


/* =========================
   RETOUR
========================= */

backButton.addEventListener(
    "click",
    function () {

        step2.style.display = "none";
        step1.style.display = "block";

        circle2.classList.remove("active");

        message2.textContent = "";
    }
);


/* =========================
   ENVOYER LE DÉPÔT
========================= */

payButton.addEventListener(
    "click",
    async function () {

        message2.textContent = "";

        const phone =
            payerPhone.value
                .trim()
                .replace(/\s+/g, "");

        if (!phone) {

            message(
                message2,
                "Veuillez saisir le numéro ayant effectué le paiement."
            );

            return;
        }

        if (!proof.files.length) {

            message(
                message2,
                "Veuillez joindre la preuve de paiement."
            );

            return;
        }

        const file =
            proof.files[0];

        const allowed = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowed.includes(file.type)) {

            message(
                message2,
                "La preuve doit être une image JPG, PNG ou WebP."
            );

            return;
        }

        if (file.size > 10 * 1024 * 1024) {

            message(
                message2,
                "La preuve ne doit pas dépasser 10 Mo."
            );

            return;
        }


        /*
         * Le Edge Function utilise les informations
         * du compte déjà présentes dans la session.
         */

        const accountPhone =
            sessionUser.phone ||
            sessionUser.phone_number;

        const password =
            sessionUser.password ||
            localStorage.getItem(
                "exonpay_password"
            );

        if (!accountPhone || !password) {

            message(
                message2,
                "Session expirée. Veuillez vous reconnecter."
            );

            return;
        }


        const form =
            new FormData();

        form.append(
            "phone",
            accountPhone
        );

        form.append(
            "password",
            password
        );

        form.append(
            "amount",
            String(selectedAmount)
        );

        form.append(
            "payer_phone",
            phone
        );

        form.append(
            "country_id",
            selectedCountryId
        );

        form.append(
            "proof",
            file
        );


        payButton.disabled = true;
        backButton.disabled = true;

        loading.style.display = "block";
        loading.textContent =
            "Envoi du dépôt...";


        try {

            const response =
                await fetch(
                    FUNCTION_URL,
                    {
                        method: "POST",
                        body: form
                    }
                );

            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Impossible d'envoyer le dépôt."
                );
            }


            loading.textContent =
                "Dépôt envoyé avec succès.";

            message(
                message2,
                "Votre dépôt est en attente de vérification. Votre solde sera crédité après validation.",
                "success"
            );

            payButton.textContent =
                "Dépôt envoyé";

        } catch (error) {

            console.error(
                "Erreur dépôt:",
                error
            );

            message(
                message2,
                error.message
            );

            payButton.disabled = false;
            backButton.disabled = false;

            loading.style.display = "none";
        }
    }
);


/* =========================
   INITIALISATION
========================= */

loadCountries();
loadPaymentSettings();
