// Mobile nav toggle
function toggleNav(){
  const links = document.getElementById('nav-links');
  const btn = document.querySelector('.nav-toggle');
  const open = links.classList.toggle('open');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

// Stripe setup – publishable key is safe to include in client-side code.
// To rotate the key, update this value and redeploy.
const stripe = Stripe'pk_live_51NrQsrE03aVdhmxuTZ7wSBPfidUKYpUBKkl21eX8alr6zN2qFTIfN5x8fAHlSZHMqajbxDwA3nZvor6XMbrNmicA00nzU9CYxI';

// Backend endpoint for creating a Stripe Checkout Session.
// Change this URL if the server is hosted at a different origin.
const CHECKOUT_ENDPOINT = '/create-checkout-session';

const serviceNames = {
  'consultation': 'Phone Consultation',
  'field-verify': 'As-built Field Verify',
  'cad-docs': 'As-built CAD Documentation',
  'construction': 'Construction Documents',
  'permitting': 'Permitting'
};

// Modal elements
const modal = document.getElementById('stripe-modal');
const serviceNameEl = document.getElementById('service-name');
const servicePriceEl = document.getElementById('service-price');
const checkoutBtn = document.getElementById('checkout-button');
const closeBtn = document.querySelector('.close');

let currentService = null;
let currentPrice = null;

// Open modal function
function openModal(service, price) {
  currentService = service;
  currentPrice = price;
  serviceNameEl.textContent = serviceNames[service];
  servicePriceEl.textContent = `$${price}/hour`;
  modal.style.display = 'block';
}

// Close modal
closeBtn.onclick = function() {
  modal.style.display = 'none';
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

// Dropdown menu items
document.querySelectorAll('.dropdown-menu a[data-service]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const service = link.getAttribute('data-service');
    const price = link.getAttribute('data-price');
    openModal(service, price);
  });
});

// Book Now buttons on services page
document.querySelectorAll('.service-item .book-now').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.service-item');
    const service = item.getAttribute('data-service');
    const price = item.getAttribute('data-price');
    openModal(service, price);
  });
});

// Stripe checkout
checkoutBtn.addEventListener('click', async () => {
  const priceIds = {
    'consultation': null,                            // Free – handled separately
    'field-verify': 'price_1T7sPsE03aVdhmxuJUYPM09l',
    'cad-docs': 'price_1T7sd8E03aVdhmxuJM0CgRD5',
    'construction': 'price_1T7seAE03aVdhmxukOIoQhLy',
    'permitting': 'price_1T7sLvE03aVdhmxur2s9ivoR'
  };

  // Free consultation – direct contact instead of payment
  if (currentService === 'consultation') {
    alert('To book a free phone consultation, please email anthony@areedconsulting.com or use the contact form.');
    modal.style.display = 'none';
    return;
  }

  const priceId = priceIds[currentService];
  if (!priceId) {
    alert('Checkout is not yet available for this service. Please contact anthony@areedconsulting.com.');
    modal.style.display = 'none';
    return;
  }

  checkoutBtn.disabled = true;
  checkoutBtn.textContent = 'Loading…';

  try {
    // Call backend to create a Stripe Checkout Session.
    // See BACKEND_SETUP.md for the required server endpoint.
    const response = await fetch(CHECKOUT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId })
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error(error);
    alert('Checkout failed. Please try again or contact anthony@areedconsulting.com directly.');
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = 'Pay with Stripe';
  }
});
