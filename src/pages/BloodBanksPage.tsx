import React, { useEffect, useState } from "react";
import { fetchBloodBanks, createBloodBank } from "../state/bloodBanks";

const BloodBanksPage: React.FC = () => {
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBloodBanks()
      .then(setBanks)
      .catch(() => setError("Failed to fetch blood banks."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Blood Banks</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <ul>
          {banks.map((bank) => (
            <li key={bank.id}>{bank.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BloodBanksPage;
