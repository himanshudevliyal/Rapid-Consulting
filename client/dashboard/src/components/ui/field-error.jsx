export default function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-destructive text-xs">{message}</p>;
}
