'use client';
import ReactSelect, { type Props } from 'react-select';
import { getSelectStyles } from './styles';
import { LoadingIndicator } from './LoadingIndicator';

export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps<T extends SelectOption> = Props<T, true> & {
  hasError?: boolean;
};

export const Select = <T extends SelectOption>(props: SelectProps<T>) => {
  return (
    <ReactSelect<T, true>
      {...props}
      styles={getSelectStyles(props.hasError, props.isLoading)}
      components={{ LoadingIndicator }}
    />
  );
};
