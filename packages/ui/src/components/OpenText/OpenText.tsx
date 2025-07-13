export const OpenText = (props: { isOpen: boolean | undefined }) => {
  const { isOpen } = props;
  return (
    isOpen !== undefined ? (
      <div className="flex items-center gap-2">
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
