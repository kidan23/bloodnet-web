// Service to fetch donors and blood banks for autocomplete fields
// These are mock implementations. Replace with real API calls as needed.

export async function fetchDonors(query: string) {
  // Simulate API call
  // Return array of { id, name } objects
  return [
    { id: "donor1", name: "John Doe" },
    { id: "donor2", name: "Jane Smith" },
    { id: "donor3", name: "Alice Johnson" },
  ].filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));
}

export async function fetchBloodBanks(query: string) {
  // Simulate API call
  // Return array of { id, name } objects
  return [
    { id: "bank1", name: "Central Blood Bank" },
    { id: "bank2", name: "City Hospital Blood Bank" },
    { id: "bank3", name: "Red Cross Center" },
  ].filter((b) => b.name.toLowerCase().includes(query.toLowerCase()));
}
