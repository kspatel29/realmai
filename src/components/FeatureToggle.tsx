
import { createContext, useContext, ReactNode } from 'react';

interface FeatureFlags {
  advancedAnalytics: boolean;
  betaFeatures: boolean;
  performanceMode: boolean;
  experimentalUploader: boolean;
}

const defaultFlags: FeatureFlags = {
  advancedAnalytics: true,
  betaFeatures: false,
  performanceMode: true,
  experimentalUploader: true,
};

const FeatureContext = createContext<FeatureFlags>(defaultFlags);

export const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  const context = useContext(FeatureContext);
  return context[flag];
};

interface FeatureProviderProps {
  children: ReactNode;
  flags?: Partial<FeatureFlags>;
}

export const FeatureProvider = ({ children, flags = {} }: FeatureProviderProps) => {
  const mergedFlags = { ...defaultFlags, ...flags };
  
  return (
    <FeatureContext.Provider value={mergedFlags}>
      {children}
    </FeatureContext.Provider>
  );
};

interface FeatureToggleProps {
  feature: keyof FeatureFlags;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureToggle = ({ feature, children, fallback = null }: FeatureToggleProps) => {
  const isEnabled = useFeatureFlag(feature);
  return isEnabled ? <>{children}</> : <>{fallback}</>;
};
