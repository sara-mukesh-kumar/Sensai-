"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, PenBox, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateCoverLetter } from "@/actions/cover-letter";
import { checkProfileCompleteness } from "@/actions/user";
import useFetch from "@/hooks/use-fetch";
import { coverLetterSchema } from "@/app/lib/schema";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CoverLetterGenerator() {
  const router = useRouter();
  const [profileComplete, setProfileComplete] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
  });

  const {
    loading: generating,
    fn: generateLetterFn,
    data: generatedLetter,
    error: generateError,
  } = useFetch(generateCoverLetter);

  // Check profile completeness on component load
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { isComplete, missingFields: missing } = await checkProfileCompleteness();
        setProfileComplete(isComplete);
        setMissingFields(missing);
      } catch (error) {
        console.error("Error checking profile:", error);
        setProfileComplete(false);
      } finally {
        setCheckingProfile(false);
      }
    };
    
    checkProfile();
  }, []);

  // Update content when letter is generated
  useEffect(() => {
    if (generatedLetter) {
      toast.success("✨ Cover letter generated successfully!");
      router.push(`/ai-cover-letter/${generatedLetter.id}`);
      reset();
    }
  }, [generatedLetter, router, reset]);

  useEffect(() => {
    if (generateError) {
      toast.error(generateError.message || "Failed to generate cover letter");
    }
  }, [generateError]);

  const onSubmit = async (data) => {
    try {
      await generateLetterFn(data);
    } catch (error) {
      toast.error(error.message || "Failed to generate cover letter");
    }
  };

  return (
    <div className="space-y-6">
      {!checkingProfile && !profileComplete && (
        <Alert className="border-amber-500 bg-amber-500/10">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900 dark:text-amber-200">
            <p className="font-semibold mb-2">Complete your profile to generate personalized cover letters</p>
            <p className="text-sm mb-3">Please fill in the following information: industry, years of experience, skills, and professional bio.</p>
            <Link href="/onboarding">
              <Button size="sm" variant="outline" className="border-amber-600 hover:bg-amber-600/10">
                Complete Profile Now
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenBox className="h-5 w-5" />
            Job Details
          </CardTitle>
          <CardDescription>
            Provide information about the position you're applying for. Our AI will use your profile information to create a personalized cover letter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Google, Microsoft, Amazon"
                  {...register("companyName")}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
                {errors.companyName && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="text-sm font-medium">
                  Job Title *
                </Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Software Engineer, Product Manager"
                  {...register("jobTitle")}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
                {errors.jobTitle && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.jobTitle.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription" className="text-sm font-medium">
                Job Description *
              </Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the complete job description here. Include requirements, responsibilities, and qualifications. The more detail you provide, the better your cover letter will be."
                className="h-40 resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                {...register("jobDescription")}
              />
              {errors.jobDescription && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.jobDescription.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                💡 Tip: Copy the full job posting for the best results
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={generating || checkingProfile || !profileComplete}
                className="px-8 transition-all duration-200 hover:scale-105"
                title={!profileComplete && !checkingProfile ? "Please complete your profile first" : ""}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Cover Letter...
                  </>
                ) : checkingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking Profile...
                  </>
                ) : !profileComplete ? (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Complete Profile First
                  </>
                ) : (
                  <>
                    <PenBox className="mr-2 h-4 w-4" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}