"use client";

import { UserButton } from "@clerk/nextjs";

export default function ClientUserButton() {
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "w-10 h-10",
          userButtonPopoverCard: "shadow-xl",
          userPreviewMainIdentifier: "font-semibold",
        },
      }}
    />
  );
}
