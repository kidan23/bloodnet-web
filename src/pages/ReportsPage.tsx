import React, { useEffect, useState, useRef } from "react";
import { fetchReports } from "../state/reports";
import { Toast } from "primereact/toast";
import { extractErrorForToast } from "../utils/errorHandling";

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    fetchReports()
      .then(setReports)
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
      <h2>Reports</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <ul>
          {reports.map((report) => (
            <li key={report.id}>{report.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReportsPage;
