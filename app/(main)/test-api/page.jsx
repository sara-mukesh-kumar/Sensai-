"use client";

import { useState } from "react";
import { testGeminiAPI } from "@/actions/test-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function TestAPIPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await testGeminiAPI();
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test Gemini API Connection</CardTitle>
          <CardDescription>
            Verify that your Google Gemini API key is working correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleTest} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing API...
              </>
            ) : (
              "Test API Connection"
            )}
          </Button>

          {result && (
            <Alert className={result.success ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? "text-green-900 dark:text-green-200" : "text-red-900 dark:text-red-200"}>
                <div className="space-y-2">
                  <p className="font-semibold">
                    {result.success ? "✅ API Test Successful" : "❌ API Test Failed"}
                  </p>
                  {result.error && <p className="text-sm">{result.error}</p>}
                  {result.details && <p className="text-sm">{result.details}</p>}
                  {result.models && (
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                      <p className="font-medium">Available models:</p>
                      <p>{result.models}</p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Troubleshooting:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Ensure <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">GEMINI_API_KEY</code> is set in your <code>.env</code> file</li>
              <li>Verify the API key is from Google AI Studio (not Vertex AI)</li>
              <li>Check that the API key has access to the Generative AI API</li>
              <li>Ensure you haven't exceeded your API quota</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}