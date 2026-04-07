"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  Mail,
  Phone,
  Linkedin,
  Twitter,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import { EntryForm } from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";

// Simple markdown to HTML converter for PDF generation
const markdownToHTML = (markdown) => {
  let html = markdown || "";
  
  // Headers
  html = html.replace(/^### (.*?)$/gm, "<h3 style=\"margin: 10px 0 5px; font-size: 14px; font-weight: bold;\">$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2 style=\"margin: 15px 0 10px; font-size: 16px; font-weight: bold;\">$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1 style=\"margin: 20px 0 10px; font-size: 18px; font-weight: bold;\">$1</h1>");
  
  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, "<a href=\"$2\" style=\"color: #0066cc; text-decoration: underline;\">$1</a>");
  
  // Line breaks
  html = html.replace(/\n\n/g, "</p><p style=\"margin: 0; padding: 0;\">");
  html = html.replace(/\n/g, "<br/>");
  
  // Wrap in paragraphs
  html = "<p style=\"margin: 0; padding: 0;\">" + html + "</p>";
  
  return html;
};






export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
const [resumeMode, setResumeMode] = useState(initialContent ? "preview" : "edit");
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  // Watch form fields for preview updates
  const formValues = watch();

  useEffect(() => {
    if (initialContent) setActiveTab("preview");
  }, [initialContent]);

  // Update preview content when form values change
  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValues, activeTab]);

  // Handle save result
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

    return parts.length > 0
      ? `## <div align="center">${user.fullName}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");

      // Create PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Set font
      doc.setFont("helvetica", "normal");

      // Split markdown content into lines and process each
      const lines = previewContent.split('\n');
      
      for (const line of lines) {
        let processedLine = line;
        let fontSize = 12;
        let fontWeight = 'normal';

        // Handle headers
        if (processedLine.startsWith('# ')) {
          processedLine = processedLine.substring(2);
          fontSize = 18;
          fontWeight = 'bold';
        } else if (processedLine.startsWith('## ')) {
          processedLine = processedLine.substring(3);
          fontSize = 16;
          fontWeight = 'bold';
        } else if (processedLine.startsWith('### ')) {
          processedLine = processedLine.substring(4);
          fontSize = 14;
          fontWeight = 'bold';
        }

        // Handle bold and italic
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove markdown bold
        processedLine = processedLine.replace(/\*(.*?)\*/g, '$1'); // Remove markdown italic
        processedLine = processedLine.replace(/__(.*?)__/g, '$1'); // Remove markdown bold
        processedLine = processedLine.replace(/_(.*?)_/g, '$1'); // Remove markdown italic

        // Handle links - extract text only
        processedLine = processedLine.replace(/\[(.*?)\]\(.*?\)/g, '$1');

        // Skip empty lines but add some space
        if (processedLine.trim() === '') {
          yPosition += 8;
          continue;
        }

        // Set font properties
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", fontWeight);

        // Split long lines
        const words = processedLine.split(' ');
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const textWidth = doc.getTextWidth(testLine);

          if (textWidth > maxWidth && currentLine !== '') {
            // Print current line and start new one
            doc.text(currentLine, margin, yPosition);
            yPosition += fontSize * 0.4;

            // Check if we need a new page
            if (yPosition > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }

            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }

        // Print remaining text
        if (currentLine) {
          doc.text(currentLine, margin, yPosition);
          yPosition += fontSize * 0.4;
        }

        // Check if we need a new page
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
      }

      // Save the PDF
      doc.save("resume.pdf");
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formattedContent = previewContent
        .replace(/\n/g, "\n") // Normalize newlines
        .replace(/\n\s*\n/g, "\n\n") // Normalize multiple newlines to double newlines
        .trim();

      console.log(previewContent, formattedContent);
      await saveResumeFn(previewContent);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  return (
    <div data-color-mode="light" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="text-center md:text-left">
          <h1 className="font-bold gradient-title text-4xl md:text-4xl mb-2">
            Resume Builder
          </h1>
          <p className="text-muted-foreground text-lg">
            Create a professional resume with AI-powered assistance
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="transition-all duration-200 hover:scale-105"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Resume
              </>
              
            )}
          </Button>
          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="transition-all duration-200 hover:scale-105"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

     <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

  <div className="flex justify-center mb-6">
    <TabsList className="grid grid-cols-2 w-full max-w-md bg-muted/40 p-1 rounded-xl shadow-sm">

      <TabsTrigger
        value="edit"
        className="flex items-center justify-center gap-2 rounded-lg text-sm font-medium"
      >
        <Edit className="h-4 w-4" />
        Form Editor
      </TabsTrigger>

      <TabsTrigger
        value="preview"
        className="flex items-center justify-center gap-2 rounded-lg text-sm font-medium"
      >
        <Monitor className="h-4 w-4" />
        Markdown Preview
      </TabsTrigger>

    </TabsList>
  </div>

        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl bg-gradient-to-br from-background to-muted/30 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Email Address</label>
                  </div>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    error={errors.contactInfo?.email}
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Mobile Number</label>
                  </div>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+1 234 567 8900"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium">LinkedIn Profile</label>
                  </div>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Twitter/Insta Profile link</label>
                  </div>
                  <Input
                    {...register("contactInfo.twitter")}
                    type="url"
                    placeholder="https://twitter.com/your-handle"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Professional Summary</h3>
              </div>
              <div className="p-6 border rounded-xl bg-gradient-to-br from-background to-muted/30 shadow-sm">
                <Controller
                  name="summary"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      className="h-40 resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      placeholder="Write a compelling professional summary that highlights your key strengths, experience, and career goals..."
                      error={errors.summary}
                    />
                  )}
                />
                {errors.summary && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.summary.message}
                  </p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Skills & Technologies</h3>
              </div>
              <div className="p-6 border rounded-xl bg-gradient-to-br from-background to-muted/30 shadow-sm">
                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      className="h-40 resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      placeholder="List your technical skills, programming languages, frameworks, tools, and soft skills. Use bullet points or comma separation for better organization..."
                      error={errors.skills}
                    />
                  )}
                />
                {errors.skills && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.skills.message}
                  </p>
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Work Experience</h3>
              </div>
              <div className="p-6 border rounded-xl bg-gradient-to-br from-background to-muted/30 shadow-sm">
                <Controller
                  name="experience"
                  control={control}
                  render={({ field }) => (
                    <EntryForm
                      type="Experience"
                      entries={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.experience && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-4">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.experience.message}
                  </p>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Education</h3>
              </div>
              <div className="p-6 border rounded-xl bg-gradient-to-br from-background to-muted/30 shadow-sm">
                <Controller
                  name="education"
                  control={control}
                  render={({ field }) => (
                    <EntryForm
                      type="Education"
                      entries={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.education && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-4">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.education.message}
                  </p>
                )}
              </div>
            </div>

            {/* Projects */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Projects</h3>
              </div>
              <div className="p-6 border rounded-xl bg-gradient-to-br from-background to-muted/30 shadow-sm">
                <Controller
                  name="projects"
                  control={control}
                  render={({ field }) => (
                    <EntryForm
                      type="Project"
                      entries={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.projects && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-4">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.projects.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          {activeTab === "preview" && (
            <Button
              variant="link"
              type="button"
              className="mb-2"
              onClick={() =>
                setResumeMode(resumeMode === "preview" ? "edit" : "preview")
              }
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>
          )}

          {activeTab === "preview" && resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose editied markdown if you update the form data.
              </span>
            </div>
          )}
          <div className="border rounded-lg">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* ✅ Always in the DOM — not inside a tab — so handleGeneratePDF can always find it */}
      <div style={{ display: "none" }}>
        <div
          id="resume-pdf"
          style={{
            background: "white",
            color: "black",
            padding: "20px",
            fontFamily: "Arial, sans-serif",
            fontSize: "12px",
            lineHeight: "1.6",
            margin: 0,
            border: "none",
          }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: markdownToHTML(previewContent),
            }}
          />
        </div>
      </div>
    </div>
  );
}