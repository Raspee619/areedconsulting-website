'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();

const SUCCESS_URL = process.env.SUCCESS_URL || 'https://areedconsulting.com/success.html';
const CANCEL_URL  = process.env.CANCEL_URL  || 'https://areedconsulting.com/services.html';
const PORT        = process.env.PORT        || 3000;

// Stripe is initialized once at startup. STRIPE_SECRET_KEY must be set at deploy time.
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  const Stripe = require('stripe');
  stripe = Stripe(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('Warning: STRIPE_SECRET_KEY is not set. Checkout endpoint will be unavailable.');
}

app.use(express.json());

// Serve static site files
app.use(express.static(path.join(__dirname)));

// POST /create-checkout-session
app.post('/create-checkout-session', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { priceId } = req.body;

  if (!priceId || typeof priceId !== 'string') {
    return res.status(400).json({ error: 'priceId is required' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
