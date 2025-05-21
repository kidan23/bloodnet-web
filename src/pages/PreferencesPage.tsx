import React, { useEffect, useState } from "react";
import { fetchPreferences } from "../state/preferences";

const PreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences()
      .then(setPreferences)
      .catch(() => setError("Failed to fetch preferences."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Preferences</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : preferences ? (
        <pre>{JSON.stringify(preferences, null, 2)}</pre>
      ) : null}
    </div>
  );
};

export default PreferencesPage;
