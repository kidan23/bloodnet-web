import React, { useMemo } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { countryOptions } from '../data/countries';

interface CountrySelectProps {
  id?: string;
  name?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  submitted?: boolean;
  showClear?: boolean;
  filter?: boolean;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  id = 'country',
  name = 'country',
  value,
  onChange,
  placeholder = 'Select a country',
  className,
  disabled = false,
  required = false,
  submitted = false,
  showClear = false,
  filter = true,
}) => {
  // Memoize the options to prevent re-creation on each render
  const memoizedOptions = useMemo(() => countryOptions, []);

  const handleDropdownChange = (e: any) => {
    onChange(e.value);
  };

  return (
    <div className="field">
      <Dropdown
        id={id}
        name={name}
        value={value}
        options={memoizedOptions}
        onChange={handleDropdownChange}
        placeholder={placeholder}
        className={classNames(className, {
          'p-invalid': submitted && required && !value,
        })}
        disabled={disabled}
        showClear={showClear}
        filter={filter}
        filterPlaceholder="Search countries..."
        emptyMessage="No countries found"
        virtualScrollerOptions={{
          itemSize: 38,
          lazy: false
        }}
        filterMatchMode="contains"
        filterBy="label"
      />
    </div>
  );
};

export default CountrySelect;
