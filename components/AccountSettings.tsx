"use client";

import { useState } from "react";

export default function AccountSettings() {
  const [confirming, setConfirming] = useState(false);

  return (
    <section aria-labelledby="account-settings-title">
      <h2 id="account-settings-title">Account settings</h2>

      <div>
        <h3>Sign out</h3>
        <p>Sign out of your BILLBLI account on this device.</p>
        <button type="button">Sign out</button>
      </div>

      <div>
        <h3>Delete account</h3>
        <p>
          Delete your BILLBLI account and associated user-owned data. This is
          permanent.
        </p>

        {!confirming ? (
          <button type="button" onClick={() => setConfirming(true)}>
            Delete account
          </button>
        ) : (
          <div role="alertdialog" aria-label="Confirm account deletion">
            <p>This action cannot be undone.</p>
            <button type="button" onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button type="button">Delete my account</button>
          </div>
        )}
      </div>
    </section>
  );
}
