import { isPaystackConfigured } from "@/lib/payments-config";
import CheckoutForm from "./checkout-form";

export default function CheckoutPage() {
  return <CheckoutForm paystackEnabled={isPaystackConfigured()} />;
}
