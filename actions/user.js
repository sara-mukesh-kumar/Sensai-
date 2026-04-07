"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // First, ensure the IndustryInsight record exists to satisfy the FK constraint.
    // Try to generate AI insights, but if it fails, create with placeholder data.
    let industryData = {
      salaryRanges: [],
      growthRate: 0,
      demandLevel: "MEDIUM",
      topSkills: [],
      marketOutlook: "NEUTRAL",
      keyTrends: [],
      recommendedSkills: [],
    };

    try {
      // Attempt to generate real insights from AI
      const insights = await generateAIInsights(data.industry);
      industryData = {
        ...insights,
        demandLevel: insights.demandLevel?.toUpperCase() || "MEDIUM",
        marketOutlook: insights.marketOutlook?.toUpperCase() || "NEUTRAL",
      };
    } catch (aiError) {
      // Log AI error but continue with placeholder data
      console.warn(
        "Failed to generate AI insights, using placeholder:",
        aiError.message
      );
    }

    // Create or update the IndustryInsight record
    await db.industryInsight.upsert({
      where: { industry: data.industry },
      update: industryData,
      create: {
        industry: data.industry,
        ...industryData,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Now update the user's profile
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        industry: data.industry,
        experience: data.experience,
        bio: data.bio,
        skills: data.skills,
      },
    });

    // Refresh pages so server components pick up the new profile
    revalidatePath("/", "layout");
    revalidatePath("/dashboard", "page");
    revalidatePath("/onboarding", "page");
    return { user: updatedUser, success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error(error?.message || "Failed to update profile");
  }
}

export async function checkProfileCompleteness() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      experience: true,
      skills: true,
      bio: true,
    },
  });

  if (!user) throw new Error("User not found");

  const missingFields = [];
  
  // Check industry
  if (!user.industry || user.industry.trim() === "") {
    missingFields.push("industry");
  }
  
  // Check experience - must be a number and >= 0
  if (user.experience === null || user.experience === undefined || isNaN(user.experience)) {
    missingFields.push("experience");
  }
  
  // Check skills - must be an array with at least one skill
  if (!Array.isArray(user.skills) || user.skills.length === 0) {
    missingFields.push("skills");
  }
  
  // Check bio
  if (!user.bio || user.bio.trim() === "") {
    missingFields.push("bio");
  }

  const isComplete = missingFields.length === 0;
  
  console.log("Profile completeness check:", {
    userId,
    isComplete,
    missingFields,
    user: {
      industry: user.industry,
      experience: user.experience,
      skills: user.skills,
      bio: user.bio?.substring(0, 50),
    },
  });

  return {
    isComplete,
    missingFields,
  };
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}