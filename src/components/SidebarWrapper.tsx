'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function SidebarWrapper() {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Sidebar isExpanded={isExpanded} toggleSidebar={toggleSidebar} />
  );
}