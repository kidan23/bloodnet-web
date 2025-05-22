import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

interface BloodBankSearchProps {
  onSearch: (term: string, mode: 'name' | 'city') => void;
  onClear: () => void;
}

const BloodBankSearch: React.FC<BloodBankSearchProps> = ({ onSearch, onClear }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'name' | 'city'>('name');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim(), searchMode);
    } else {
      onClear();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3 bg-primary-reverse border-round shadow-1" style={{ padding: 16 }}>
      <div className="flex flex-column md:flex-row gap-3 align-items-center">
        <div className="flex-1">
          <InputText
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search blood banks..."
            className="w-full"
          />
        </div>
        <div className="flex align-items-center gap-3">
          <div>
            <label className="mr-2">
              <input
                type="radio"
                name="searchMode"
                value="name"
                checked={searchMode === 'name'}
                onChange={() => setSearchMode('name')}
                style={{ marginRight: 4 }}
              />
              By Name
            </label>
            <label>
              <input
                type="radio"
                name="searchMode"
                value="city"
                checked={searchMode === 'city'}
                onChange={() => setSearchMode('city')}
                style={{ marginRight: 4 }}
              />
              By City
            </label>
          </div>
          <Button type="submit" label="Search" className="sm" />
          <Button type="button" label="Clear" className="secondary sm" onClick={() => { setSearchTerm(''); onClear(); }} />
        </div>
      </div>
    </form>
  );
};

export default BloodBankSearch;
