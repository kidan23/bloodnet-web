import React, { useEffect, useState } from "react";
import { fetchAccountSettings } from "../state/accountSettings";

const AccountSettingsPage: React.FC = () => {
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccountSettings()
      .then(setAccount)
      .catch(() => setError("Failed to fetch account settings."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Account Settings</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : account ? (
        <pre>{JSON.stringify(account, null, 2)}</pre>
      ) : null}
    </div>
  );
};

export default AccountSettingsPage;
