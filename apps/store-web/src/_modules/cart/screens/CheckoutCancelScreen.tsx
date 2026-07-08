import { Link } from "react-router";

export function CheckoutCancelScreen() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Payment cancelled</h1>
      <p className="text-sm text-gray-600 mb-6">Your cart is unchanged. You can try again when ready.</p>
      <Link
        to="/checkout"
        className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold"
      >
        Back to checkout
      </Link>
    </div>
  );
}
