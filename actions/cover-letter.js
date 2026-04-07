"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateCoverLetter(data) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("You must be signed in to generate a cover letter.");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User profile not found. Please try signing out and signing back in.");
    }

    // Check if user has completed their profile
    if (!user.industry || !user.experience || !user.skills || !user.bio) {
      throw new Error("Please complete your profile first to generate personalized cover letters. Go to your dashboard and fill in your industry, experience, skills, and bio.");
    }

    // Validate input data
    if (!data.companyName || !data.jobTitle || !data.jobDescription) {
      throw new Error("Please fill in all required fields: company name, job title, and job description.");
    }

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("AI service is temporarily unavailable. Please try again later.");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Write a professional, compelling cover letter for a ${data.jobTitle} position at ${data.companyName}.
      
      CANDIDATE INFORMATION:
      - Industry: ${user.industry}
      - Years of Experience: ${user.experience}
      - Skills: ${user.skills?.join(", ")}
      - Professional Background: ${user.bio}
      
      JOB DESCRIPTION:
      ${data.jobDescription}
      
      REQUIREMENTS:
      1. Create a professional business letter format with proper salutation and closing
      2. Keep the letter concise (300-400 words)
      3. Highlight 2-3 relevant skills and experiences that match the job requirements
      4. Show enthusiasm for the company and role
      5. Include specific examples from the candidate's background
      6. Demonstrate knowledge of the company/industry
      7. End with a strong call to action
      8. Use professional language and proper grammar
      
      Format the response in clean markdown with proper line breaks and paragraphs.
    `;

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 30000)
      )
    ]);
    const content = result.response?.text?.()?.trim?.();

    if (!content) {
      throw new Error("AI service returned empty response. Please try again.");
    }

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        userId: user.id,
      },
    });

    return coverLetter;
  } catch (error) {
    console.error("Error generating cover letter:", error);

    // Provide more specific error messages
    if (error.message?.includes("API_KEY")) {
      throw new Error("AI service authentication failed. Please check your API key configuration.");
    }
    if (error.message?.includes("not found") || error.message?.includes("404")) {
      throw new Error("AI model temporarily unavailable. Please try again in a few minutes.");
    }
    if (error.message?.includes("quota") || error.message?.includes("limit")) {
      throw new Error("AI service quota exceeded. Please try again later.");
    }
    if (error.message?.includes("network") || error.message?.includes("timeout")) {
      throw new Error("Request timed out. Please check your connection and try again.");
    }

    // Generic fallback error
    throw new Error("Failed to generate cover letter. Please try again.");
  }
}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.delete({
    where: {
      id,
      userId: user.id,
    },
  });
}

