/**
 * CareerSphere AI — Public Landing Page
 * Cohesive presentation of value proposition, architectural features, and roadmap.
 */
import React from 'react';
import { HeroSection } from './HeroSection';
import { FeatureGrid } from './FeatureGrid';
import { WorkflowSection } from './WorkflowSection';
import { RoleComparison } from './RoleComparison';
import { MilestoneRoadmap } from './MilestoneRoadmap';
import { UserRole } from '../../types';

interface LandingPageProps {
  onNavigateCandidate: () => void;
  onNavigateRecruiter: () => void;
  onNavigateAdmin: () => void;
  onNavigateArchitecture: () => void;
  onOpenLogin: (role?: UserRole) => void;
  onOpenRegister: (role?: 'candidate' | 'recruiter') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateCandidate,
  onNavigateRecruiter,
  onNavigateAdmin,
  onNavigateArchitecture,
  onOpenLogin,
  onOpenRegister,
}) => {
  return (
    <div className="space-y-0 text-slate-100">
      <HeroSection
        onNavigateCandidate={onNavigateCandidate}
        onNavigateRecruiter={onNavigateRecruiter}
        onNavigateAdmin={onNavigateAdmin}
        onNavigateArchitecture={onNavigateArchitecture}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
      />
      <FeatureGrid />
      <WorkflowSection />
      <RoleComparison
        onNavigateCandidate={onNavigateCandidate}
        onNavigateRecruiter={onNavigateRecruiter}
      />
      <MilestoneRoadmap />
    </div>
  );
};
