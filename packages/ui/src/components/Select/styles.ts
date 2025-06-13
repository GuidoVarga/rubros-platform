import { StylesConfig } from 'react-select';
import { SelectOption } from './MultiSelect';

export const getSelectStyles = <T extends SelectOption>(
  hasError?: boolean,
  isLoading?: boolean
): StylesConfig<T, true> => ({
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    backgroundColor: state.isDisabled
      ? 'rgb(var(--card-bg))'
      : 'rgb(var(--white))',
    border: hasError
      ? '1px solid rgb(var(--error))'
      : state.isFocused
        ? '2px solid rgb(var(--primary))'
        : '1px solid rgb(var(--border))',
    borderRadius: 'calc(var(--radius) - 2px)',
    boxShadow: state.isFocused
      ? '0 0 0 2px rgb(var(--background)), 0 0 0 4px rgb(var(--ring))'
      : 'none',
    '&:hover': {
      borderColor: hasError ? 'rgb(var(--error))' : 'rgb(var(--border))',
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
    backgroundColor: 'rgb(var(--primary))',
    color: 'rgb(var(--white))',
    borderRadius: '4px',
    padding: '0 2px',

    ':hover': {
      backgroundColor: 'rgb(var(--primary-hover))',
    },
  }),
  multiValueLabel: (base) => ({
    ...base,
    fontSize: '14px',
    lineHeight: '20px',
    color: 'rgb(var(--primary-foreground))',
    padding: '0 4px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'rgb(var(--primary-foreground))',
    padding: '0 2px',
    ':hover': {
      backgroundColor: 'rgb(var(--primary))',
      color: 'rgb(var(--primary-foreground))',
      opacity: '0.8',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'rgb(var(--popover))',
    border: '1px solid rgb(var(--border))',
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
    fontSize: '14px',
    lineHeight: '20px',
    borderRadius: '4px',
    cursor: 'pointer',
    userSelect: 'none',
    backgroundColor: state.isSelected
      ? 'rgb(var(--primary-hover))'
      : state.isFocused
        ? 'rgb(var(--primary-hover))'
        : 'transparent',
    color: state.isSelected
      ? 'rgb(var(--primary-foreground))'
      : state.isFocused
        ? 'rgb(var(--white))'
        : 'rgb(var(--popover-foreground))',
    fontWeight: state.isSelected ? '500' : '400',
    ':active': {
      backgroundColor: state.isSelected
        ? 'rgb(var(--primary))'
        : 'rgb(var(--primary-hover) / 0.1)',
    },
  }),
  input: (base) => ({
    ...base,
    color: 'rgb(var(--foreground))',
    margin: '0',
    padding: '0',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'rgb(var(--cancel) / 0.7)',
    fontSize: '14px',
    lineHeight: '20px',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'rgb(var(--foreground))',
    fontSize: '14px',
    lineHeight: '20px',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  loadingIndicator: (base) => ({
    ...base,
    color: 'rgb(var(--muted-foreground))',
    padding: '8px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '0',
    marginRight: '8px',
    width: '16px',
    height: '16px',
    color: 'rgb(var(--foreground) / 0.5)',
    ':hover': {
      color: 'rgb(var(--foreground))',
    },
    display: isLoading ? 'none' : 'flex',
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '0',
    width: '16px',
    height: '16px',
    marginRight: '8px',
    color: 'rgb(var(--foreground) / 0.5)',
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
