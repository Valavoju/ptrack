import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Project, WeeklyUpload, User } from '../../types';
import { projectAPI, uploadAPI, userAPI } from '../../services/api';
import {
  FolderOpen,
  Upload,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentUploads, setRecentUploads] = useState<WeeklyUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectType, setSelectedProjectType] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [teamRollNumbers, setTeamRollNumbers] = useState<string[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<string[]>([]);
  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [selectedMentor, setSelectedMentor] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, facultyResponse] = await Promise.all([
          projectAPI.getStudentProjects(),
          userAPI.getFacultyList()
        ]);
        setProjects(projectsResponse.data.projects || []);
        setFacultyList(facultyResponse.data.faculty || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRollChange = (index: number, value: string) => {
    const updatedRolls = [...teamRollNumbers];
    updatedRolls[index] = value;
    setTeamRollNumbers(updatedRolls);
  };

  const verifyRollNumbers = async () => {
    const results = await Promise.all(
      teamRollNumbers.map(async (roll) => {
        try {
          const response = await projectAPI.verifyRollNumber(roll);
          return response.data.exists ? '✔️ Verified' : '❌ Not Registered';
        } catch {
          return '❌ Error';
        }
      })
    );
    setVerificationStatus(results);
  };

  const stats = [
    {
      label: 'Active Projects',
      value: projects.filter(p => p.status === 'active').length,
      icon: FolderOpen,
      color: 'bg-blue-500'
    },
    {
      label: 'Completed Projects',
      value: projects.filter(p => p.status === 'completed').length,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      label: 'Pending Reviews',
      value: recentUploads.filter(u => u.status === 'pending').length,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      label: 'Total Uploads',
      value: recentUploads.length,
      icon: Upload,
      color: 'bg-purple-500'
    }
  ];

  const weekCards = Array.from({ length: 16 }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's an overview of your project progress
          </p>
        </div>
        <Link to="/projects/create">
          <motion.button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </motion.button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Project Type</label>
        <select
          value={selectedProjectType}
          onChange={(e) => setSelectedProjectType(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
        >
          <option value="">-- Select --</option>
          <option value="Realtime Project">Realtime Project (2nd Year)</option>
          <option value="Mini Project">Mini Project (3rd Year)</option>
          <option value="Major Project">Major Project (4th Year)</option>
        </select>

        <label className="block text-sm font-medium text-gray-700 mb-1">Select Faculty Mentor</label>
        <select
          value={selectedMentor}
          onChange={(e) => setSelectedMentor(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
        >
          <option value="">-- Select Mentor --</option>
          {facultyList.map((mentor) => (
            <option key={mentor._id} value={mentor._id}>{mentor.name}</option>
          ))}
        </select>

        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Team Members</label>
        <input
          type="number"
          value={teamSize}
          onChange={(e) => setTeamSize(Math.min(5, Math.max(1, parseInt(e.target.value))))}
          min={1}
          max={5}
          className="w-full border border-gray-300 rounded-lg p-2"
        />

        {[...Array(teamSize)].map((_, index) => (
          <div key={index} className="flex items-center space-x-3 mt-2">
            <input
              type="text"
              placeholder={`Enter Roll No. for Member ${index + 1}`}
              className="w-full border border-gray-300 rounded-lg p-2"
              value={teamRollNumbers[index] || ''}
              onChange={(e) => handleRollChange(index, e.target.value)}
            />
            <span className="text-sm text-gray-600">{verificationStatus[index] || ''}</span>
          </div>
        ))}

        <button
          onClick={verifyRollNumbers}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Verify Team Members
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {weekCards.map(week => (
            <div key={week} className="border border-gray-200 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-1">Week {week}</h3>
              <p className="text-sm text-gray-600">Schedule TBD</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
