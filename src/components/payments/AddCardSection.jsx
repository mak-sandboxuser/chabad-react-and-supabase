export default function AddCardSection({
  onAddCard,
  onRemoveCard,
  saving = false,
  removingId = null,
  savedCards = [],
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-[16px] font-semibold text-gray-800">Saved cards</h3>
          <p className="text-[13px] text-gray-500 mt-1">
            Add a card once. It is stored securely with Stripe and linked in your account for future payments.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddCard}
          disabled={saving || Boolean(removingId)}
          className="shrink-0 inline-flex items-center gap-2 bg-white border-2 border-[#1a2a5e] text-[#1a2a5e] hover:bg-[#eef1f9] disabled:opacity-60 text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Opening Stripe…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add card
            </>
          )}
        </button>
      </div>

      {savedCards.length > 0 ? (
        <ul className="space-y-2">
          {savedCards.map((card) => {
            const isRemoving = removingId === card.id;
            return (
              <li
                key={card.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-[#f8fafc] px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#eef1f9] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#1a2a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 capitalize truncate">
                      {card.brand || "Card"} ···· {card.last_four || "****"}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {card.expires_at
                        ? `Expires ${new Date(card.expires_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                        : "Saved on Stripe"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {card.is_primary && (
                    <span className="bg-[#dcfce7] text-[#16a34a] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveCard?.(card)}
                    disabled={saving || isRemoving}
                    className="text-[12px] font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    {isRemoving ? "Removing…" : "Remove"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-5 text-center">
          <p className="text-[13px] text-gray-500">No cards saved yet.</p>
          <p className="text-[12px] text-gray-400 mt-1">Click Add card to save one with Stripe (no charge).</p>
        </div>
      )}
    </div>
  );
}
