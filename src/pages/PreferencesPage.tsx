import React, { useEffect, useState, useRef } from "react";
import { fetchPreferences } from "../state/preferences";
import { Toast } from "primereact/toast";
import { extractErrorForToast } from "../utils/errorHandling";

const PreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    fetchPreferences()
      .then(setPreferences)
      .catch((err) => {
        const { summary, detail } = extractErrorForToast(err);
        const errorMessage = `${summary}: ${detail}`;
        setError(errorMessage);
        toast.current?.show({
          severity: 'error',
          summary,
          detail,
          life: 5000
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Toast ref={toast} />
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
