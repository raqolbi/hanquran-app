'use client';

import { motion } from 'motion/react';
import { Home, Settings } from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { id: 'home', label: 'Beranda', icon: Home },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

interface BottomNavigationProps {
  onNavigate?: (id: string) => void;
}

export function BottomNavigation({ onNavigate }: BottomNavigationProps) {
  const [active, setActive] = useState('home');

  const handleClick = (id: string) => {
    setActive(id);
    onNavigate?.(id);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-border"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleClick(item.id)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-4 px-2 transition-colors relative min-h-16 ${
                  active === item.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label={item.label}
                aria-current={active === item.id ? 'page' : undefined}
              >
                <Icon size={24} strokeWidth={active === item.id ? 2 : 1.5} />
                <span className="text-xs font-medium">{item.label}</span>
                {active === item.id && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 h-1 w-full bg-primary"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
