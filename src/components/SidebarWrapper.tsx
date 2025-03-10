'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

export default function SidebarWrapper() {
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-collapse sidebar on mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };
    
    // Run once on component mount
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Sidebar isExpanded={isExpanded} toggleSidebar={toggleSidebar} />
  );
}