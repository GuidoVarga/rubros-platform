import { StylesConfig } from 'react-select';
import { SelectOption } from './Select';

export const getSelectStyles = <T extends SelectOption>(
  hasError?: boolean,
  isLoading?: boolean
): StylesConfig<T, true> => ({
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    backgroundColor: state.isDisabled
      ? 'hsl(var(--card-bg))'
      : 'hsl(var(--white))',
    border: hasError
      ? '1px solid hsl(var(--error))'
      : '1px solid hsl(var(--border))',
    borderRadius: 'calc(var(--radius) - 2px)',
    boxShadow: 'none',
    '&:hover': {
      borderColor: hasError ? 'hsl(var(--error))' : 'hsl(var(--border))',
      cursor: 'pointer',
    },
    padding: '0',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    transition: 'all 200ms',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '8px 12px',
    gap: '8px',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'hsl(var(--primary-foreground))',
    color: 'hsl(var(--primary))',
    borderRadius: '4px',
    padding: '0 2px',

    ':hover': {
      backgroundColor: 'hsl(var(--primary-hover))',
    },
  }),
  multiValueLabel: (base) => ({
    ...base,
    fontSize: '14px',
    lineHeight: '20px',
    color: 'hsl(var(--primary-foreground))',
    padding: '0 4px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'hsl(var(--primary-foreground))',
    padding: '0 2px',
    ':hover': {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      opacity: '0.8',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'calc(var(--radius) - 2px)',
    boxShadow: 'var(--shadow)',
    zIndex: 50,
    animation: 'select-menu-in 200ms ease',
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
  }),
  option: (base, state) => ({
    ...base,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '6px',
    fontSize: '1rem',
    lineHeight: '20px',
    borderRadius: '4px',
    cursor: 'pointer',
    userSelect: 'none',
    backgroundColor: state.isSelected
      ? 'hsl(var(--primary-selected))'
      : state.isFocused
        ? 'hsl(var(--primary-hover))'
        : 'transparent',
    color: state.isSelected
      ? 'hsl(var(--primary))'
      : state.isFocused
        ? 'hsl(var(--primary))'
        : 'hsl(var(--popover-foreground))',
    fontWeight: state.isSelected ? '500' : '400',
    ':active': {
      backgroundColor: state.isSelected
        ? 'hsl(var(--primary-selected))'
        : 'hsl(var(--primary-hover))',
    },
  }),
  input: (base) => ({
    ...base,
    color: 'hsl(var(--foreground))',
    margin: '0',
    padding: '0',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'hsl(var(--cancel) / 0.7)',
    fontSize: '1rem',
    lineHeight: '20px',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'hsl(var(--primary))',
    fontSize: '1rem',
    lineHeight: '20px',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  loadingIndicator: (base) => ({
    ...base,
    color: 'hsl(var(--muted-foreground))',
    padding: '8px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '0',
    marginRight: '8px',
    width: '16px',
    height: '16px',
    color: 'hsl(var(--foreground) / 0.5)',
    ':hover': {
      color: 'hsl(var(--foreground))',
    },
    display: isLoading ? 'none' : 'flex',
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '0',
    width: '16px',
    height: '16px',
    marginRight: '8px',
    color: 'hsl(var(--foreground) / 0.5)',
  }),
  container: (base) => ({
    ...base,
    backgroundColor: 'hsl(var(--background))',
  }),
});

export const selectAnimationStyles = `
  @keyframes select-menu-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;
