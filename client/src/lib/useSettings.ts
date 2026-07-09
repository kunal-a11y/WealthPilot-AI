import { useState, useEffect } from 'react';

export type DashboardWidgets = {
  portfolioValue: boolean;
  netWorth: boolean;
  portfolioHealth: boolean;
  riskScore: boolean;
  marketChart: boolean;
  trendingStocks: boolean;
};

const DEFAULT_WIDGETS: DashboardWidgets = {
  portfolioValue: true,
  netWorth: true,
  portfolioHealth: true,
  riskScore: true,
  marketChart: true,
  trendingStocks: true,
};

export function useDashboardSettings() {
  const [widgets, setWidgets] = useState<DashboardWidgets>(() => {
    const saved = localStorage.getItem('dashboard_widgets');
    if (saved) {
      try {
        return { ...DEFAULT_WIDGETS, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_WIDGETS;
      }
    }
    return DEFAULT_WIDGETS;
  });

  useEffect(() => {
    localStorage.setItem('dashboard_widgets', JSON.stringify(widgets));
    window.dispatchEvent(new Event('dashboard_widgets_updated'));
  }, [widgets]);

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('dashboard_widgets');
      if (saved) {
        try {
          setWidgets({ ...DEFAULT_WIDGETS, ...JSON.parse(saved) });
        } catch(e) {}
      }
    };
    window.addEventListener('dashboard_widgets_updated', handleUpdate);
    return () => window.removeEventListener('dashboard_widgets_updated', handleUpdate);
  }, []);

  const toggleWidget = (key: keyof DashboardWidgets) => {
    setWidgets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return { widgets, toggleWidget };
}
