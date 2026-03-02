// Mobile nav toggle
function toggleNav(){
  const links = document.getElementById('nav-links');
  const btn = document.querySelector('.nav-toggle');
  const open = links.classList.toggle('open');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

// Stripe setup - REPLACE WITH YOUR OWN KEYS
const stripe = Stripepk_test_51T6PXHQ70yqQNnVHPlML7KZePx9aO00soARoGSled4hiwacEBVlzAwIIKkHQHz22b1DXk7CDsZJlooWr2qfrnqzh00GhgfxUt1; // TODO: Add your Stripe publishable key

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
  // TODO: Create Price IDs in your Stripe Dashboard for each service
  // Then map them here:
  const priceIds = {
    'consultation': 'price_1234567890',      // Replace with actual Stripe Price ID
    'field-verify': 'price_1234567891',      // Replace with actual Stripe Price ID
    'cad-docs': 'price_1234567892',          // Replace with actual Stripe Price ID
    'construction': 'price_1234567893',      // Replace with actual Stripe Price ID
    'permitting': 'price_1234567894'         // Replace with actual Stripe Price ID
  };

  // For now, alert user to complete setup
  if (priceIds[currentService].includes('123456789')) {
    alert('Stripe checkout coming soon! Please contact anthony@areedconsulting.com to book this service.');
    modal.style.display = 'none';
    return;
  }

  const {error} = await stripe.redirectToCheckout({
    lineItems: [{price: priceIds[currentService], quantity: 1}],
    mode: 'payment',
    successUrl: window.location.origin + '/success.html',
    cancelUrl: window.location.origin + '/services.html',
  });

  if (error) {
    console.error(error);
    alert('Checkout failed. Please try again or contact us directly.');
  }
});
