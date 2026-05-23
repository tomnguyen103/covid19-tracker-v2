import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useCountries } from '../../hooks/useCountries';
import type { Country } from '../../types/covid';

interface CountryPickerProps {
  label: string;
  value: Country | null;
  onChange: (country: Country | null) => void;
}

export function CountryPicker({ label, value, onChange }: CountryPickerProps) {
  const { data: countries = [], isLoading } = useCountries();

  return (
    <Autocomplete
      options={countries}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      loading={isLoading}
      clearOnEscape
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      sx={{ minWidth: 240 }}
    />
  );
}
