import React, { useEffect, useState } from "react";
import { fetchSettings } from "../state/settings";

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch(() => setError("Failed to fetch settings."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Settings</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : settings ? (
        <pre>{JSON.stringify(settings, null, 2)}</pre>
      ) : null}
    </div>
  );
};

export default SettingsPage;
