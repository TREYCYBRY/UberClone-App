const { onCall, HttpsError } = require("firebase-functions/v2/https");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = onCall(async (request) => {
  try {
    console.log("Datos recibidos desde la app:", request.data);

    let amountToCharge = request.data ? request.data.amount : null;

    if (!amountToCharge || isNaN(amountToCharge)) {
        console.log("El monto llegó vacío. Usando otra opcion.");
        amountToCharge = 15000;
    }

    const amountInCents = parseInt(amountToCharge) * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'cop', 
      payment_method_types: ['card'],
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error('Stripe error:', error);
    throw new HttpsError('internal', 'Error al procesar el pago con Stripe');
  }
});