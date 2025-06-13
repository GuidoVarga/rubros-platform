'use client';
import Select, { type Props } from 'react-select';
import { getSelectStyles } from './styles';
import { LoadingIndicator } from './LoadingIndicator';

export type SelectOption = {
  label: string;
  value: string;
};

type MultiSelectProps<T extends SelectOption> = Props<T, true> & {
  hasError?: boolean;
};

export const MultiSelect = <T extends SelectOption>(props: MultiSelectProps<T>) => {
  return (
    <Select<T, true>
      {...props}
      isMulti
      styles={getSelectStyles(props.hasError, props.isLoading)}
      components={{ LoadingIndicator }}
    />
  );
};
