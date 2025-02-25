'use client';

import { useState } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';

export default function UserProfileModal() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAppSelector((state) => state.user);

  // This is just a placeholder. You can implement a full modal later.
  if (!user.uid) return null;
  
  return null; // Currently not showing any UI
} 