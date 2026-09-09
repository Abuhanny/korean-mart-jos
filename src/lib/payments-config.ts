// Server-only. Lets pages decide whether to show the "Pay Online" option
// at all. Until PAYSTACK_SECRET_KEY is set, the app runs perfectly well
// with only the offline ("Pay on Pickup" / "Pay at the Mart") flow — this
// just keeps that gap invisible to customers instead of surfacing a
// confusing payment error if they pick an option that isn't wired up yet.
export function isPaystackConfigured(): boolean {
  return !!process.env.PAYSTACK_SECRET_KEY;
}
