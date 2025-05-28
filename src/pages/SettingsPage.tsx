import React, { useEffect, useState, useRef } from "react";
import { fetchSettings } from "../state/settings";
import { Toast } from "primereact/toast";
import { extractErrorForToast } from "../utils/errorHandling";

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
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
