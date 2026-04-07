import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { checkProfileCompleteness } from "@/actions/user";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OnboardingPage({
  searchParams,
}) {
  // Only allow access if the user's profile is incomplete, unless they're editing
  const { isComplete } = await checkProfileCompleteness();
  const isEditMode = searchParams.edit === "true";

  if (isComplete && !isEditMode) {
    // profile already filled out and not in edit mode, send them to the dashboard
    redirect("/dashboard");
  }

  return (
    <main>
      <OnboardingForm industries={industries} isEditMode={isEditMode} />
    </main>
  );
}