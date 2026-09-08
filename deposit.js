const SUPABASE_URL = "https://euyvppbbhjrjcbgmdian.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eXZwcGJiaGpyamNiZ21kaWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjIxNjYsImV4cCI6MjEwMzY5ODE2Nn0.BOH9ZGx5I34wzIkl8oGU7_BZ8yN3zWZSqIrBceb6aH0";

let USER_ID = null;
let sessionUser = null;

let minimumDeposit = 3000;
let selectedMethod = "orange";

let currentUSSD = "";

const amountInput = document.getElementById("amount");
const payerPhoneInput = document.getElementById("payerPhone");
const otpInput = document.getElementById("otp");

const minimumInfo = document.getElementById("minimumInfo");
const pageLoading = document.getElementById("pageLoading");

const orangeMethod = document.getElementById("orangeMethod");
const moovMethod = document.getElementById("moovMethod");

const otpCard = document.getElementById("otpCard");

const instructionTitle =
    document.getElementById("instructionTitle");

const instructionText =
    document.getElementById("instructionText");

const ussdBox =
    document.getElementById("ussdBox");

const ussdCode =
    document.getElementById("ussdCode");

const submitBtn =
    document.getElementById("submitBtn");

const statusBox =
    document.getElementById("status");

const transactionBox =
    document.getElementById("transactionBox");

const transactionId =
    document.getElementById("transactionId");


function getHeaders() {
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + SUPABASE_ANON_KEY,
        "Accept": "application/json"
    };
}


function formatMoney(value) {
    return Number(value || 0).toLocaleString("fr-FR");
}


function showStatus(message, type = "info") {
    statusBox.className = "status " + type;
    statusBox.textContent = message;
}


function clearStatus() {
    statusBox.className = "status";
    statusBox.textContent = "";
}


function getSessionUser() {

    try {
        const raw = localStorage.getItem("exonpay_user");

        if (!raw) {
            return null;
        }

        return JSON.parse(raw);

    } catch (error) {

        console.error(
            "Erreur lecture session:",
            error
        );

        return null;
    }
}


function normalizeCountry(country) {

    return String(country || "")
        .trim()
        .toLowerCase();
}


function getCountryCode() {

    if (!sessionUser) {
        return "";
    }

    const country = normalizeCountry(
        sessionUser.country_name
    );

    const mapping = {
        "burkina faso": "BF",
        "côte d'ivoire": "CI",
        "cote d'ivoire": "CI",
        "togo": "TG",
        "bénin": "BJ",
        "benin": "BJ"
    };

    return mapping[country] || "";
}


async function loadMinimumDeposit() {

    try {

        const url =
            SUPABASE_URL +
            "/rest/v1/platform_settings" +
            "?select=setting_value,setting_type,is_active" +
            "&setting_key=eq.minimum_deposit" +
            "&is_active=eq.true" +
            "&limit=1";

        const response = await fetch(url, {
            method: "GET",
            headers: getHeaders()
        });

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Erreur paramètres:",
                errorText
            );

            throw new Error(
                "Impossible de récupérer le minimum de dépôt."
            );
        }

        const data = await response.json();

        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {
            throw new Error(
                "Le paramètre minimum_deposit est introuvable."
            );
        }

        const value =
            Number(data[0].setting_value);

        if (
            !Number.isFinite(value) ||
            value <= 0
        ) {
            throw new Error(
                "La valeur du dépôt minimum est invalide."
            );
        }

        minimumDeposit = value;

        amountInput.min = String(
            minimumDeposit
        );

        minimumInfo.textContent =
            "Montant minimum : " +
            formatMoney(minimumDeposit) +
            " XOF.";

    } catch (error) {

        console.error(error);

        /*
         * Valeur de secours uniquement si le paramètre
         * ne peut pas être récupéré.
         *
         * La fonction SQL create_deposit doit elle aussi
         * utiliser le paramètre de la base.
         */
        minimumDeposit = 3000;

        amountInput.min =
            String(minimumDeposit);

        minimumInfo.textContent =
            "Montant minimum : " +
            formatMoney(minimumDeposit) +
            " XOF.";
    }
}


function updateUSSD() {

    const amount =
        Number(amountInput.value);

    const countryCode =
        getCountryCode();

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        ussdBox.style.display = "none";
        currentUSSD = "";
        return;
    }

    let code = "";

    /*
     * BURKINA FASO
     */

    if (countryCode === "BF") {

        if (selectedMethod === "orange") {

            code =
                "*144*4*6*" +
                amount +
                "#";

        } else {

            code =
                "*555*2*1*51382699*" +
                amount +
                "#";
        }
    }

    /*
     * AUTRES PAYS
     *
     * Aucun code USSD spécifique n'a été fourni
     * pour ces pays. On affiche donc les instructions
     * générales sans inventer de code.
     */

    else {

        code = "";
    }

    currentUSSD = code;

    if (code) {

        ussdBox.style.display = "block";
        ussdCode.textContent = code;

    } else {

        ussdBox.style.display = "none";
        ussdCode.textContent = "—";
    }
}


function selectMethod(method) {

    selectedMethod = method;

    if (method === "orange") {

        orangeMethod.classList.add("active");
        moovMethod.classList.remove("active");

        instructionTitle.textContent =
            "Orange Money";

        instructionText.textContent =
            "Entrez le montant puis utilisez le code affiché pour effectuer votre paiement. Après le paiement, saisissez l'OTP reçu.";

        otpCard.style.display = "block";

    } else {

        orangeMethod.classList.remove("active");
        moovMethod.classList.add("active");

        instructionTitle.textContent =
            "Moov Money";

        instructionText.textContent =
            "Entrez le montant puis utilisez le code affiché pour effectuer votre paiement. Aucun OTP n'est demandé pour Moov Money.";

        otpCard.style.display = "none";

        otpInput.value = "";
    }

    updateUSSD();
}


async function copyUSSD() {

    if (!currentUSSD) {

        showStatus(
            "Le code de paiement n'est pas encore disponible.",
            "error"
        );

        return;
    }

    try {

        await navigator.clipboard.writeText(
            currentUSSD
        );

        showStatus(
            "Code de paiement copié.",
            "success"
        );

    } catch (error) {

        showStatus(
            "Impossible de copier automatiquement le code.",
            "error"
        );
    }
}


function proceedPayment() {

    if (!currentUSSD) {

        showStatus(
            "Le code de paiement n'est pas disponible pour ce pays.",
            "error"
        );

        return;
    }

    /*
     * On essaie d'ouvrir l'application téléphone
     * avec le code USSD.
     *
     * Certains téléphones/navigateurs peuvent
     * refuser l'ouverture automatique.
     */

    const telUrl =
        "tel:" +
        encodeURIComponent(currentUSSD);

    window.location.href = telUrl;
}


function validateForm() {

    const amount =
        Number(amountInput.value);

    const payerPhone =
        payerPhoneInput.value.trim();

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showStatus(
            "Veuillez entrer un montant valide.",
            "error"
        );

        return false;
    }

    if (amount < minimumDeposit) {

        showStatus(
            "Le dépôt minimum est de " +
            formatMoney(minimumDeposit) +
            " XOF.",
            "error"
        );

        return false;
    }

    if (
        payerPhone.length < 8 ||
        payerPhone.length > 20
    ) {

        showStatus(
            "Veuillez entrer un numéro de téléphone valide.",
            "error"
        );

        return false;
    }

    if (selectedMethod === "orange") {

        const otp =
            otpInput.value.trim();

        if (!/^[0-9]{6}$/.test(otp)) {

            showStatus(
                "L'OTP Orange Money doit contenir exactement 6 chiffres.",
                "error"
            );

            return false;
        }
    }

    return true;
}


async function createDeposit() {

    clearStatus();

    if (!USER_ID) {

        showStatus(
            "Votre session utilisateur est introuvable. Veuillez vous reconnecter.",
            "error"
        );

        return;
    }

    if (!validateForm()) {
        return;
    }

    const amount =
        Number(amountInput.value);

    const payerPhone =
        payerPhoneInput.value.trim();

    const otp =
        selectedMethod === "orange"
            ? otpInput.value.trim()
            : null;

    const paymentMethod =
        selectedMethod === "orange"
            ? "Orange Money"
            : "Moov Money";

    submitBtn.disabled = true;

    submitBtn.textContent =
        "Création du dépôt...";

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/rpc/create_deposit",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization":
                        "Bearer " +
                        SUPABASE_ANON_KEY,
                    "Accept":
                        "application/json"
                },

                body: JSON.stringify({
                    p_user_id: USER_ID,
                    p_amount: amount,
                    p_payer_phone: payerPhone,
                    p_payment_method:
                        paymentMethod,
                    p_otp: otp
                })
            }
        );

        const raw =
            await response.text();

        let data = null;

        try {
            data = raw
                ? JSON.parse(raw)
                : null;
        } catch {
            data = raw;
        }

        if (!response.ok) {

            console.error(
                "Erreur create_deposit:",
                data
            );

            let message =
                "Impossible de créer le dépôt.";

            if (
                data &&
                typeof data === "object"
            ) {

                message =
                    data.message ||
                    data.hint ||
                    data.details ||
                    data.error ||
                    message;
            }

            throw new Error(message);
        }

        let deposit = data;

        if (Array.isArray(data)) {
            deposit = data[0];
        }

        if (!deposit) {

            throw new Error(
                "La réponse du serveur est invalide."
            );
        }

        transactionBox.style.display =
            "block";

        transactionId.textContent =
            deposit.professional_transaction_id ||
            "Transaction créée";

        showStatus(
            "Votre demande de dépôt a été créée avec succès. Elle est maintenant en attente de validation.",
            "success"
        );

        amountInput.disabled = true;
        payerPhoneInput.disabled = true;
        otpInput.disabled = true;

        orangeMethod.style.pointerEvents =
            "none";

        moovMethod.style.pointerEvents =
            "none";

        submitBtn.textContent =
            "Dépôt envoyé";

    } catch (error) {

        console.error(error);

        showStatus(
            error.message ||
            "Une erreur est survenue lors de la création du dépôt.",
            "error"
        );

        submitBtn.disabled = false;

        submitBtn.textContent =
            "J'ai effectué le paiement";
    }
}


async function initializePage() {

    sessionUser =
        getSessionUser();

    if (!sessionUser) {

        pageLoading.textContent =
            "Session expirée. Redirection...";

        setTimeout(() => {
            window.location.href =
                "index.html";
        }, 1200);

        return;
    }

    USER_ID =
        sessionUser.user_id;

    if (!USER_ID) {

        pageLoading.textContent =
            "Utilisateur introuvable. Redirection...";

        setTimeout(() => {
            window.location.href =
                "index.html";
        }, 1200);

        return;
    }

    /*
     * Récupération du numéro enregistré
     * dans la session.
     */

    if (sessionUser.phone_number) {

        payerPhoneInput.value =
            sessionUser.phone_number;
    }

    await loadMinimumDeposit();

    selectMethod("orange");

    pageLoading.style.display =
        "none";
}


amountInput.addEventListener(
    "input",
    updateUSSD
);

amountInput.addEventListener(
    "change",
    updateUSSD
);


otpInput.addEventListener(
    "input",
    function () {

        this.value =
            this.value
                .replace(/\D/g, "")
                .slice(0, 6);
    }
);


initializePage();