# Backend Setup for Stripe Checkout

The client-side code in `script.js` sends a `POST /create-checkout-session` request whenever a user clicks **Pay with Stripe**. You need a small server that handles this request and creates a [Stripe Checkout Session](https://stripe.com/docs/api/checkout/sessions).

## Request

```
POST /create-checkout-session
Content-Type: application/json

{ "priceId": "price_1T7sPsE03aVdhmxuJUYPM09l" }
```

## Response

```json
{ "url": "https://checkout.stripe.com/pay/cs_live_..." }
```

The client immediately redirects the browser to the returned `url`.

---

## Node.js / Express example

```js
const express = require('express');
const Stripe = require('stripe');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { priceId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: process.env.SUCCESS_URL || 'https://areedconsulting.com/success.html',
      cancel_url: process.env.CANCEL_URL || 'https://areedconsulting.com/services.html',
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Environment variables

Copy `.env.example` to `.env` and fill in your keys:

```
STRIPE_SECRET_KEY=sk_live_...
SUCCESS_URL=https://areedconsulting.com/success.html
CANCEL_URL=https://areedconsulting.com/services.html
```

> **Never commit your `.env` file or expose `STRIPE_SECRET_KEY` in client-side code.**

---

## Stripe Price IDs (already configured in `script.js`)

| Service | Price ID |
|---|---|
| As-built Field Verify | `price_1T7sPsE03aVdhmxuJUYPM09l` |
| As-built CAD Documentation | `price_1T7sd8E03aVdhmxuJM0CgRD5` |
| Construction Documents | `price_1T7seAE03aVdhmxukOIoQhLy` |
| Permitting | `price_1T7sLvE03aVdhmxur2s9ivoR` |

The **Phone Consultation** service is free and does not go through Stripe checkout.
