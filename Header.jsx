import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Bell, CalendarPlus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import SettingsDialog from '@/components/SettingsDialog';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from '@/components/Logo';

const Header = ({ userData, settings, setSettings }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation(['common', 'toast', 'scheduler', 'settings']);
  const location = useLocation();

  const handleLogout = () => {
    toast({
      title: t('toast:notApplicable'),
      description: t('toast:logoutNotApplicable'),
    });
  };

  const handleNotificationClick = () => {
    toast({
      title: t('toast:notificationsWIP'),
      description: t('toast:featureWIPDescription')
    });
  };

  const displayName = userData?.name || t('common:user');

  return (
    <>
      <motion.header
        className="glass-card border-b border-white/20 dark:border-blue-500/20 sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3">
                <Logo className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold gradient-text">MAJORDOME</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('common:personalDashboard')}</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('common:welcome')},</p>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{displayName}</p>
              </div>

              <div className="flex items-center space-x-1">
                 {location.pathname !== '/scheduler' && (
                    <Button asChild variant="outline" className="hidden sm:flex items-center gap-2 bg-white/50 dark:bg-white/10">
                      <Link to="/scheduler">
                        <CalendarPlus className="h-4 w-4" />
                        {t('scheduler:scheduleButton')}
                      </Link>
                    </Button>
                  )}
                <Button variant="ghost" size="icon" onClick={handleNotificationClick} className="relative text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </Button>

                <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} className="text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10">
                  <Settings className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('common:logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </motion.header>
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </>
  );
};

export default Header;