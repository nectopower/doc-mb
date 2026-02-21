'use client';

import { ProjectProvider } from '@/contexts/ProjectContext';
import { ReactNode } from 'react';

export function ProjectProviderWrapper({ children }: { children: ReactNode }) {
  return <ProjectProvider>{children}</ProjectProvider>;
}
