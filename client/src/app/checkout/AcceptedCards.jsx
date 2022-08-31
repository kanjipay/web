export function AcceptedCards() {
  return (
    <div style={{ display: "flex", alignItems: "center", columnGap: 16 }}>
      <p className="text-body-faded">We accept: </p>
      <img src="/img/visa.png" alt="Visa" style={{ height: 40 }} />
      <img src="/img/mastercard.png" alt="Mastercard" style={{ height: 32 }} />
      <img src="/img/amex.png" alt="American Express" style={{ height: 32 }} />
    </div>
  );
}
