"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// simple button that navigates to resume page where download is available
export default function DownloadResumeButton() {
  const router = useRouter();
  const handleClick = () => {
    router.push("/resume");
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className="transition-all duration-200 hover:scale-105"
    >
      <Download className="h-4 w-4 mr-2" />
      View / Download Resume
    </Button>
  );
}
