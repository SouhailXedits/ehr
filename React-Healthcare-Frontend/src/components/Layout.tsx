import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import {
  Home,
  Calendar,
  FileText,
  User,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import Navigation from './Navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Medical Records', href: '/medical-records', icon: FileText },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background p-4">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 rounded-lg px-4 py-2 ${
                    location.pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex lg:flex-col lg:min-h-screen">
        <div className="flex flex-1">
          {/* Sidebar */}
          <div className="w-64 border-r bg-background">
            <div className="flex h-16 items-center justify-between px-6">
              <h1 className="text-xl font-semibold">Healthcare Portal</h1>
            </div>
            <nav className="space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 rounded-lg px-4 py-2 ${
                    location.pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <main className="p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
} 