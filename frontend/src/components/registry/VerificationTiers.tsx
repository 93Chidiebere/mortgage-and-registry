import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export type VerificationTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4';

interface VerificationTiersProps {
  currentTier: VerificationTier;
  geomHash?: string;
  surveyorId?: string;
  surveyPlanNo?: string;
  rootOfTitle?: string;
}

const tierConfig = {
  TIER_1: {
    level: 1,
    title: 'Self-Declared (Unverified)',
    description: 'Landowner claimed coordinates with no professional attestation.',
    icon: ShieldAlert,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  TIER_2: {
    level: 2,
    title: 'Surveyor Attested',
    description: 'Coordinates mathematically verified against exact geometric overlaps and signed by a registered surveyor.',
    icon: Shield,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  TIER_3: {
    level: 3,
    title: 'State Lodged',
    description: 'Surveyor attested and backed by an official state Survey Plan Number.',
    icon: ShieldCheck,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  TIER_4: {
    level: 4,
    title: 'Root of Title',
    description: 'Fully verified with a cryptographic anchor to the state Certificate of Occupancy or Deed.',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
};

export const VerificationTiers: React.FC<VerificationTiersProps> = ({
  currentTier,
  geomHash,
  surveyorId,
  surveyPlanNo,
  rootOfTitle
}) => {
  const currentLevel = tierConfig[currentTier].level;
  const ConfigIcon = tierConfig[currentTier].icon;

  return (
    <div className="space-y-6">
      <Card className={`border-2 ${tierConfig[currentTier].borderColor} ${tierConfig[currentTier].bgColor}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full bg-white shadow-sm ${tierConfig[currentTier].color}`}>
                <ConfigIcon size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {tierConfig[currentTier].title}
                  <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full bg-white shadow-sm ${tierConfig[currentTier].color}`}>
                    Tier {currentLevel}
                  </span>
                </h3>
                <p className="text-gray-600 mt-1">{tierConfig[currentTier].description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {(Object.keys(tierConfig) as VerificationTier[]).map((tierId) => {
            const tier = tierConfig[tierId];
            const isAchieved = tier.level <= currentLevel;
            const isCurrent = tier.level === currentLevel;
            
            return (
              <div key={tierId} className="relative flex items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm ml-12">
                {/* Status dot */}
                <div className={`absolute -left-14 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center
                  ${isAchieved ? tier.color + ' border-current' : 'border-gray-300'}`}
                >
                  {isAchieved && <div className="w-2 h-2 rounded-full bg-current" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold ${isAchieved ? 'text-gray-900' : 'text-gray-400'}`}>
                      Tier {tier.level}: {tier.title}
                    </h4>
                    {isCurrent && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        Current Status
                      </span>
                    )}
                  </div>
                  
                  {isAchieved && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tier.level >= 2 && surveyorId && (
                        <div className="text-sm bg-gray-50 p-2 rounded border border-gray-100 font-mono text-gray-600 flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-amber-500" />
                          Surveyor Ref: {surveyorId.substring(0, 16)}...
                        </div>
                      )}
                      {tier.level >= 2 && geomHash && (
                        <div className="text-sm bg-gray-50 p-2 rounded border border-gray-100 font-mono text-gray-600 flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-amber-500" />
                          Geometry Hash: {geomHash.substring(0, 16)}...
                        </div>
                      )}
                      {tier.level >= 3 && surveyPlanNo && (
                        <div className="text-sm bg-gray-50 p-2 rounded border border-gray-100 font-mono text-gray-600 flex items-center gap-2">
                          <FileCheck size={14} className="text-blue-500" />
                          Survey Plan: {surveyPlanNo}
                        </div>
                      )}
                      {tier.level >= 4 && rootOfTitle && (
                        <div className="text-sm bg-gray-50 p-2 rounded border border-gray-100 font-mono text-gray-600 flex items-center gap-2">
                          <FileCheck size={14} className="text-emerald-500" />
                          Title Root: {rootOfTitle.substring(0, 16)}...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
