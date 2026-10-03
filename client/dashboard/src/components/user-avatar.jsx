import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function UserAvatar({ image = null, fullname = "" }) {
  const getInitials = (name) => {
    if (!name) return "U";

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={image} alt={fullname} />
      <AvatarFallback className="bg-primary text-xs text-white">
        {getInitials(fullname)}
      </AvatarFallback>
    </Avatar>
  );
}
