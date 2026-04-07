"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function testGeminiAPI() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { success: false, error: "GEMINI_API_KEY environment variable is not set" };
    }

    // attempt to fetch model list directly via REST API since SDK
    // version 0.24.1 does not expose listModels
    const key = encodeURIComponent(process.env.GEMINI_API_KEY);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to list models: ${res.status} ${res.statusText} - ${body}`);
    }
    const json = await res.json();
    const names = (json.models || [])
      .map(m => m.name || m.model || JSON.stringify(m))
      .join(", ");
    return { success: true, message: "Model list retrieved", models: names };
  } catch (error) {
    console.error("API test error:", error);
    return {
      success: false,
      error: error.message || "Unknown API error",
      details: error.status ? `Status: ${error.status}` : null
    };
  }
}