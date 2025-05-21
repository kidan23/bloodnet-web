import React, { useEffect, useState } from "react";
import { fetchReports } from "../state/reports";

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .catch(() => setError("Failed to fetch reports."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
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
