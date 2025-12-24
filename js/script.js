AOS.init({
    duration: 800,
    easing: 'ease-out-cube',
    once: true,
});

if (document.getElementById('orderForm')) {

    const el = {
        inputName: document.getElementById('inputName'),
        previewName: document.getElementById('previewName'),
        inputQty: document.getElementById('inputQty'),
        totalDisplay: document.getElementById('sum-total'),
        cardPreview: document.getElementById('cardPreview'),
        btnSubmit: document.getElementById('btn-submit'),
        orderForm: document.getElementById('orderForm'),
        modelRadios: document.querySelectorAll('input[name="cardModel"]')
    };

    // --- MISE À JOUR DU CALCUL (Modèle + Quantité + Remise) ---
    function updateCalculations() {
        if (!el.inputQty || !el.totalDisplay) return;

        // 1. Récupérer le prix du modèle sélectionné
        const selectedModel = document.querySelector('input[name="cardModel"]:checked');
        let unitPrice = parseInt(selectedModel.value);
        
        // 2. Gérer la quantité
        let qty = parseInt(el.inputQty.value) || 1;
        
        // 3. Calculer la remise sur volume
        let discount = 0;
        if (qty >= 100) discount = 0.30;
        else if (qty >= 50) discount = 0.20;
        else if (qty >= 10) discount = 0.10;

        const totalFinal = (unitPrice * qty) * (1 - discount);
        el.totalDisplay.innerText = Math.round(totalFinal).toLocaleString() + " GNF";

        // 4. Petit bonus : changer l'aspect de la carte si c'est Pro
        if (selectedModel.id === "modelPro") {
            el.cardPreview.classList.add('metal-effect');
        } else {
            el.cardPreview.classList.remove('metal-effect');
        }
    }

    // Écouteurs pour le changement de modèle
    el.modelRadios.forEach(radio => {
        radio.addEventListener('change', updateCalculations);
    });

    // --- MISE À JOUR APERÇU NOM ---
    el.inputName?.addEventListener('input', (e) => {
        el.previewName.innerText = e.target.value.toUpperCase() || "VOTRE NOM ICI";
    });

    // --- GESTION QUANTITÉ ---
    document.getElementById('btnPlus')?.addEventListener('click', () => {
        el.inputQty.value = parseInt(el.inputQty.value) + 1;
        updateCalculations();
    });

    document.getElementById('btnMinus')?.addEventListener('click', () => {
        if (parseInt(el.inputQty.value) > 1) {
            el.inputQty.value = parseInt(el.inputQty.value) - 1;
            updateCalculations();
        }
    });

    el.inputQty?.addEventListener('input', updateCalculations);

    // --- GESTION COULEURS ---
    const thumbs = document.querySelectorAll('.thumb-preview');
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', function() {
            thumbs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            if (this.dataset.color) el.cardPreview.style.backgroundColor = this.dataset.color;
        });
    });

    // --- VALIDATION ET MODALE ---
    el.btnSubmit?.addEventListener('click', function(e) {
        if (el.orderForm.checkValidity()) {
            e.preventDefault();
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
        } else {
            el.orderForm.reportValidity();
        }
    });

    updateCalculations();
}