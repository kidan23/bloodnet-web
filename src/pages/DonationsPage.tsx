import React, { useEffect, useState } from "react";
import { fetchDonations, createDonation } from "../state/donations";

const DonationsPage: React.FC = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDonations()
      .then(setDonations)
      .catch(() => setError("Failed to fetch donations."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Donations</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <ul>
          {donations.map((donation) => (
            <li key={donation.id}>{donation.donorName} - {donation.amount}ml</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DonationsPage;
