export const formatPrice = (price: string) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(price))
