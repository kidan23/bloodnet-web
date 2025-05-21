import React, { useState } from "react";
import { useDonors, useCreateDonor } from "../state/donors";
import { useQueryClient } from "@tanstack/react-query";

const DonorsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: donors = [], isLoading, error } = useDonors();
  const createDonorMutation = useCreateDonor();

  const [name, setName] = useState("");

  const handleCreateDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createDonorMutation.mutate({ name }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["donors"] });
          setName("");
        },
      });
    }
  };

  return (
    <div>
      <h2>Donors</h2>
      <form onSubmit={handleCreateDonor} style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Donor name"
        />
        <button type="submit" disabled={createDonorMutation.isPending}>
          Add Donor
        </button>
      </form>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Failed to fetch donors.</div>
      ) : (
        <ul>
          {Array.isArray(donors) &&
            donors.map((donor: any, idx: number) => (
              <li key={donor.id || idx}>{donor.name}</li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default DonorsPage;
