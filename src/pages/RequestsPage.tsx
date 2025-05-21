import React, { useEffect, useState } from "react";
import { fetchRequests, createRequest } from "../state/requests";

const RequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests()
      .then(setRequests)
      .catch(() => setError("Failed to fetch requests."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Blood Requests</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <ul>
          {requests.map((req) => (
            <li key={req.id}>{req.patientName} - {req.bloodType}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RequestsPage;
