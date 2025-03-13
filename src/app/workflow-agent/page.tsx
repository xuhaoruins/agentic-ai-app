'use client';

import WorkflowInterface from '@/components/workflow-agent/WorkflowInterface';
import { useSidebar } from '@/components/SidebarContext';

export default function WorkflowAgentPage() {
  const { isExpanded } = useSidebar();
  
  return (
    <div className={`w-full mx-auto px-4 py-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${
      isExpanded ? 'ml-64' : 'ml-16'
    } transition-all duration-300`}>
      <WorkflowInterface />
    </div>
  );
}