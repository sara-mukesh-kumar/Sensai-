"use client";

import React from "react";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  StarsIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export default function Header() {
  const { isSignedIn } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 border-b bg-background/80 backdrop-blur-md z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div style={{ width: 120, height: 40, position: "relative" }}>
            <Image
              src="/logo.png"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              alt="Logo"
            />
          </div>
        </Link>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="hidden md:flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Industry Insights
                </Button>

                <Button variant="ghost" size="icon" className="md:hidden">
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <StarsIcon className="h-4 w-4" />
                    <span className="hidden md:block">Growth Tools</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/resume" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Build Resume
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/ai-cover-letter"
                      className="flex items-center gap-2"
                    >
                      <PenBox className="h-4 w-4" />
                      Cover Letter
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/interview" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Interview Prep
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <UserButton fallbackRedirectUrl="/dashboard" />
            </>
          ) : (
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          )}
        </div>
      </nav>
    </header>
  );
}