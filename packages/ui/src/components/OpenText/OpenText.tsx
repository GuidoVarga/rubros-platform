import { cn } from "@/lib/utils";

type OpenTextProps = {
  isOpen: boolean | undefined;
  className?: string;
}

export const OpenText = (props: OpenTextProps) => {
  const { isOpen, className } = props;
  return (
    isOpen !== undefined ? (
      <div className={cn('flex items-center gap-2', className)}>
        <div>
          <div className={`h-3 w-3 ml-0.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
        <span className={`text-base font-medium ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
          {isOpen ? 'Abierto ahora' : 'Cerrado ahora'}
        </span>
      </div>
    ) : null
  );
};
