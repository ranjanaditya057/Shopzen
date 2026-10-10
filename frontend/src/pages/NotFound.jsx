import EmptyState from "../components/EmptyState";

export default function NotFound() {
  return (
    <div className="container-page py-20">
      <EmptyState emoji="🧭" title="Page not found" message="The page you are looking for does not exist or has moved." actionLabel="Back to home" actionTo="/" />
    </div>
  );
}
