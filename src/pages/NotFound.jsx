import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-petrol-100">
        <Compass size={30} className="text-petrol-500" />
      </div>
      <h1 className="font-display text-3xl font-bold text-ink">Page not found</h1>
      <p className="max-w-sm text-sm text-ink/55">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
