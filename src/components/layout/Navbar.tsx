import React from 'react';
import { ActiveTab } from '../../types';
import {
  Activity,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  FileCode2,
  Layers,
  Menu,
  Server,
  Settings,
  X,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isLiveApi: boolean;
  onOpenConfig: () => void;
  onOpenTestRunner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isLiveApi,
  onOpenConfig,
  onOpenTestRunner,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'predict', label: 'Predict Consumption', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'models', label: 'Model Performance', icon: BrainCircuit },
    { id: 'about', label: 'About Project', icon: FileCode2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600 shadow-xs">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 font-mono">
                Volt<span className="text-cyan-600">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 border-l border-slate-200 pl-2">
                Electricity Classification System
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Integration Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Test Runner Button */}
          <button
            onClick={onOpenTestRunner}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-colors"
            title="Execute frontend unit test verification suite"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Unit Tests</span>
          </button>

          {/* Backend Status / Settings trigger */}
          <button
            onClick={onOpenConfig}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-cyan-400 hover:bg-slate-50 shadow-xs transition-colors"
            title="Configure Python ML Backend connection"
          >
            <Server className={`h-3.5 w-3.5 ${isLiveApi ? 'text-emerald-600' : 'text-amber-500'}`} />
            <span className="hidden md:inline font-mono font-medium">
              {isLiveApi ? 'Live Backend' : 'Offline Engine'}
            </span>
            <Settings className="h-3 w-3 text-slate-400 hover:text-slate-600" />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                    : 'text-slate-600 hover:bg-slate-100 text-left'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-200 mt-2 flex gap-2">
            <button
              onClick={() => {
                onOpenTestRunner();
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-mono rounded bg-slate-100 border border-slate-200 text-slate-700"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Unit Tests</span>
            </button>
            <button
              onClick={() => {
                onOpenConfig();
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-mono rounded bg-slate-100 border border-slate-200 text-slate-700"
            >
              <Settings className="h-3.5 w-3.5 text-slate-500" />
              <span>API Settings</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
