type FormErrorProps = {
  message: string | null;
};

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{message}</div>
  );
}
