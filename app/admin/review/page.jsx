import { notFound } from "next/navigation";
import ReviewClient from "./ReviewClient";

export const metadata = { title: "AceChem — Content Review", robots: { index: false, follow: false } };

/* Local-development-only review UI. Hard-gated out of production builds. */
export default function ReviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ReviewClient />;
}
