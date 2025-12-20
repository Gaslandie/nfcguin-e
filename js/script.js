AOS.init({
  duration: 800,
  easing: 'ease-out-cube',
  once: true,
});

// État de la commande (State)
let orderState = {
  cardPrice: 150000,
  deliveryPrice: 0,
  isDevis: false
};

const inputs = {
  name: document.getElementById('inputName'),
  summaryName: document.getElementById('sum-name'),
  summaryModel: document.getElementById('sum-model'),
  summaryTotal: document.getElementById('sum-total'),
  summaryColor: document.getElementById('sum-color'),
  summaryDelivery: document.getElementById('sum-delivery')
};

// Fonction de calcul globale
function updateTotal() {
  if (orderState.isDevis) {
    inputs.summaryTotal.innerText = "Sur Devis";
  } else {
    const total = orderState.cardPrice + orderState.deliveryPrice;
    inputs.summaryTotal.innerText = total.toLocaleString() + " GNF";
  }
}

// 1. Gestion du Nom + Activation Étape 2
inputs.name.addEventListener('input', (e) => {
  inputs.summaryName.innerText = e.target.value || "—";
  if (e.target.value.length > 2) {
    document.getElementById('step2-indicator').classList.add('active');
  } else {
    document.getElementById('step2-indicator').classList.remove('active');
  }
});

// 2. Gestion du Modèle
document.querySelectorAll('input[name="cardType"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const logoArea = document.getElementById('logoUploadArea');
    const btn = document.getElementById('btn-submit');

    if (e.target.value === "Devis") {
      orderState.isDevis = true;
      inputs.summaryModel.innerText = "Bankaï Entreprise";
      btn.innerText = "DEMANDER UN DEVIS";
      logoArea.classList.remove('d-none');
    } else {
      orderState.isDevis = false;
      orderState.cardPrice = parseInt(e.target.value);
      inputs.summaryModel.innerText = e.target.id === "typePremium" ? "Bankaï Premium" : "Bankaï Standard";
      btn.innerText = "CONFIRMER LA COMMANDE";

      // Affichage logo si Premium
      e.target.id === "typePremium" ? logoArea.classList.remove('d-none') : logoArea.classList.add('d-none');
    }
    updateTotal();
  });
});

// 3. Gestion des Couleurs
document.querySelectorAll('.color-option').forEach(opt => {
  opt.addEventListener('click', function () {
    document.querySelector('.color-option.active').classList.remove('active');
    this.classList.add('active');
    inputs.summaryColor.innerText = this.dataset.color;
  });
});

// 4. Gestion de la Livraison + Activation Étape 3
document.querySelectorAll('input[name="deliveryMethod"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    orderState.deliveryPrice = parseInt(e.target.value);
    inputs.summaryDelivery.innerText = orderState.deliveryPrice === 0 ? "Gratuit" : orderState.deliveryPrice.toLocaleString() + " GNF";

    // Active l'étape 3 de la barre de progression
    document.getElementById('step3-indicator').classList.add('active');
    updateTotal();
  });
});

// Écoute du clic sur le bouton de confirmation
document.getElementById('btn-submit').addEventListener('click', function(e) {
    const form = document.getElementById('orderForm');

    // Vérification si le formulaire est valide (champs required remplis)
    if (form.checkValidity()) {
        e.preventDefault(); // Empêche le rechargement car on utilise une modale

        // Récupération des infos saisies pour personnaliser le message
        const customerName = document.getElementById('inputName').value;
        const cardType = document.getElementById('sum-model').innerText;

        // Injection des données dans la modale
        document.getElementById('modal-customer-name').innerText = customerName;
        document.getElementById('modal-card-type').innerText = cardType;

        // Affichage de la modale de succès
        const myModal = new bootstrap.Modal(document.getElementById('successModal'));
        myModal.show();
    } else {
        // Si le formulaire est invalide, on laisse le navigateur afficher les messages d'erreur
        form.reportValidity();
    }
});
