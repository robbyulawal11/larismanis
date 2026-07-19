// ============================================================
// NOTA DIGITAL — elemen khas LarisManis.
// Setiap transaksi yang berhasil dicatat AI muncul sebagai
// struk warung mini: gerigi sobekan, garis putus-putus, dan
// stempel "TERCATAT" — supaya juragan yang terbiasa dengan
// nota kertas langsung merasa akrab.
// ============================================================

import React from 'react';
import { rupiah, fmtDateTime } from '../lib/utils.js';

export default function Receipt({ tx, storeName, onDelete }) {
  const isIn = tx.type === 'in';
  return (
    <div className={'receipt ' + (isIn ? 'receipt-in' : 'receipt-out')}>
      <div className="receipt-head">
        <span className="receipt-store">{storeName}</span>
        <span className="receipt-date">{fmtDateTime(tx.created_at)}</span>
      </div>

      <div className="receipt-divider" aria-hidden="true" />

      <div className="receipt-row">
        <span className="receipt-item">
          {tx.item}
          {Number(tx.qty) > 1 ? ` × ${Number(tx.qty)}` : ''}
        </span>
        <span className="receipt-unit">{Number(tx.qty) > 1 ? `@ ${rupiah(tx.unit_price)}` : ''}</span>
      </div>

      <div className="receipt-divider" aria-hidden="true" />

      <div className="receipt-total-row">
        <span className="receipt-total-label">{isIn ? 'MASUK' : 'KELUAR'}</span>
        <span className="receipt-total">
          {isIn ? '+' : '−'} {rupiah(tx.total)}
        </span>
      </div>

      <span className="receipt-stamp" aria-hidden="true">
        TERCATAT ✓
      </span>

      {onDelete && (
        <button
          type="button"
          className="receipt-delete"
          onClick={() => onDelete(tx)}
          aria-label={`Hapus catatan ${tx.item}`}
          title="Hapus catatan ini"
        >
          ×
        </button>
      )}
    </div>
  );
}
