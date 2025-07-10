import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  FolderOpen, 
  Users, 
  Upload, 
  BarChart3, 
  Settings,
  BookOpen
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const studentMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FolderOpen, label: 'My Projects', path: '/projects' },
    { icon: Upload, label: 'Upload Files', path: '/upload' },
    { icon: BarChart3, label: 'Progress', path: '/progress' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const facultyMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'My Students', path: '/students' },
    { icon: BookOpen, label: 'Projects', path: '/faculty/projects' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const menuItems = user?.role === 'student' ? studentMenuItems : facultyMenuItems;

  return (
    <motion.div 
      className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen"
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {user?.role === 'student' ? 'Student Portal' : 'Faculty Portal'}
          </h2>
          <p className="text-sm text-gray-600">{user?.branch}</p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;