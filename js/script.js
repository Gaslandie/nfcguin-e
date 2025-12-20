AOS.init({
  duration: 800,
  easing: 'ease-out-cube',
  once: true,
});

// État de la commande (State)
let orderState = {
  cardPrice: 150000,
  deliveryPrice: 0,
  quantity: 1,
  isDevis: false
};

const inputs = {
  name: document.getElementById('inputName'),
  qty: document.getElementById('inputQty'),
  summaryName: document.getElementById('sum-name'),
  summaryModel: document.getElementById('sum-model'),
  summaryTotal: document.getElementById('sum-total'),
  summaryColor: document.getElementById('sum-color'),
  summaryDelivery: document.getElementById('sum-delivery')
};

// Fonction pour mettre à jour l'interface selon les choix (Quantité / Type)
function updateUI() {
  const nameGroup = document.getElementById('nameInputGroup');
  const nameInput = document.getElementById('inputName');
  const nameLabel = document.getElementById('nameLabel');
  const logoArea = document.getElementById('logoUploadArea');
  const logoInput = logoArea.querySelector('input');

  const selectedType = document.querySelector('input[name="cardType"]:checked');
  const isEntreprise = selectedType.value === "Devis";
  const isPro = selectedType.id === "typePro";

  // 1. Gestion du champ Nom / Entreprise
  if (isEntreprise) {
    nameGroup.classList.remove('d-none');
    nameLabel.innerText = "Nom de l'entreprise";
    nameInput.placeholder = "Ex: Bankaï Sarl";
    nameInput.required = true;
  } else if (orderState.quantity > 1) {
    nameGroup.classList.add('d-none'); // On cache si multi-personnes
    nameInput.required = false;
    inputs.summaryName.innerText = "Multiples (À définir)";
  } else {
    nameGroup.classList.remove('d-none');
    nameLabel.innerText = "Nom sur la carte";
    nameInput.placeholder = "Ex: Mamady Keïta";
    nameInput.required = true;
  }

  // 2. Gestion du Logo
  if (isEntreprise || isPro) {
    logoArea.classList.remove('d-none');
    logoInput.required = true;
  } else {
    logoArea.classList.add('d-none');
    logoInput.required = false;
  }

  updateTotal();
}

// Fonction de calcul globale
function updateTotal() {
  const selectedRadio = document.querySelector('input[name="cardType"]:checked');

  if (orderState.isDevis) {
    inputs.summaryTotal.innerText = "Sur Devis";
    inputs.summaryModel.innerText = "Bankaï Entreprise";
  } else {
    const total = (orderState.cardPrice * orderState.quantity) + orderState.deliveryPrice;
    inputs.summaryTotal.innerText = total.toLocaleString() + " GNF";

    const baseModelName = selectedRadio.id === "typePro" ? "Bankaï Pro" : "Bankaï Essentiel";
    inputs.summaryModel.innerText = orderState.quantity > 1 ? `${orderState.quantity}x ${baseModelName}` : baseModelName;
  }
}

// 1. Gestion du Nom (Input manuel)
inputs.name.addEventListener('input', (e) => {
  inputs.summaryName.innerText = e.target.value || "—";
  if (e.target.value.length > 2) {
    document.getElementById('step2-indicator').classList.add('active');
  }
});

// 2. Gestion du Modèle
document.querySelectorAll('input[name="cardType"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const btn = document.getElementById('btn-submit');
    if (e.target.value === "Devis") {
      orderState.isDevis = true;
      btn.innerText = "DEMANDER UN DEVIS";
    } else {
      orderState.isDevis = false;
      orderState.cardPrice = parseInt(e.target.value);
      btn.innerText = "CONFIRMER LA COMMANDE";
    }
    updateUI();
  });
});

// 3. Gestion de la Quantité
document.getElementById('btnPlus').addEventListener('click', () => {
  inputs.qty.value = parseInt(inputs.qty.value) + 1;
  orderState.quantity = parseInt(inputs.qty.value);
  updateUI();
});

document.getElementById('btnMinus').addEventListener('click', () => {
  if (parseInt(inputs.qty.value) > 1) {
    inputs.qty.value = parseInt(inputs.qty.value) - 1;
    orderState.quantity = parseInt(inputs.qty.value);
    updateUI();
  }
});

inputs.qty.addEventListener('input', (e) => {
  let val = parseInt(e.target.value);
  if (isNaN(val) || val < 1) val = 1;
  orderState.quantity = val;
  updateUI();
});

// 4. Gestion des Couleurs
document.querySelectorAll('.color-option').forEach(opt => {
  opt.addEventListener('click', function () {
    const activeOption = document.querySelector('.color-option.active');
    if (activeOption) activeOption.classList.remove('active');
    this.classList.add('active');
    inputs.summaryColor.innerText = this.dataset.color;
  });
});

// 5. Gestion de la Livraison
document.querySelectorAll('input[name="deliveryMethod"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    orderState.deliveryPrice = parseInt(e.target.value);
    inputs.summaryDelivery.innerText = orderState.deliveryPrice === 0 ? "Gratuit" : orderState.deliveryPrice.toLocaleString() + " GNF";
    document.getElementById('step3-indicator').classList.add('active');
    updateTotal();
  });
});

// 6. Validation et Message de Succès Personnalisé
document.getElementById('btn-submit').addEventListener('click', function (e) {
  const form = document.getElementById('orderForm');

  if (form.checkValidity()) {
    e.preventDefault();

    const isEntreprise = document.getElementById('typeEntreprise').checked;
    const customerName = inputs.name.value;
    const modalText = document.querySelector('#successModal .modal-body p.text-secondary');

    let confirmMessage = "";

    if (isEntreprise) {
      confirmMessage = `Merci <strong>${customerName}</strong> ! Votre demande de devis entreprise a été reçue. Notre équipe commerciale vous contactera sous peu pour finaliser l'offre.`;
    } else if (orderState.quantity > 1) {
      confirmMessage = `Félicitations ! Votre commande de <strong>${orderState.quantity} cartes</strong> est enregistrée. Notre équipe vous contactera pour finaliser votre commande`;
    } else {
      confirmMessage = `Merci <strong>${customerName}</strong> ! Votre carte Bankaï est en cours de création. Notre service client vous appellera pour confirmer la livraison.`;
    }

    modalText.innerHTML = confirmMessage;
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();
  } else {
    form.reportValidity();
  }
});