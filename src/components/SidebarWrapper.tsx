'use client';

import React from 'react';
import Sidebar from './Sidebar';
import { useSidebar } from './SidebarContext';

export default function SidebarWrapper() {
  const { isExpanded, toggleSidebar } = useSidebar();

  return (
    <Sidebar isExpanded={isExpanded} toggleSidebar={toggleSidebar} />
  );
}