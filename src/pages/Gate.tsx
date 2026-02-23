import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { mockDatabase } from '../data/mock';
import { Role } from '../types';

const Gate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [inputId, setInputId] = useState('');

  useEffect(() => {
    const adminUid = searchParams.get('adminuid');
    const uid = searchParams.get('uid');

    if (adminUid) {
      const admin = mockDatabase.admins.find(a => a.uid === adminUid);
      if (admin) {
        login(admin, 'admin');
        navigate('/dashboard');
      } else {
        setError('Invalid Admin UID');
      }
    } else if (uid) {
      // Check Teachers
      const teacher = mockDatabase.teachers.find(t => t.uid === uid);
      if (teacher) {
        login(teacher, 'teacher');
        navigate('/dashboard');
        return;
      }

      // Check Students
      const student = mockDatabase.students.find(s => s.uid === uid);
      if (student) {
        // Students need to be enrolled in a class to access dashboard/courses?
        // For now, just login as student
        login(student as any, 'student'); // Casting mock student to User for now
        // Check if there is a 'kid' (class ID) param which might be required for direct course access
        // But generally redirect to dashboard
        navigate('/dashboard');
      } else {
        setError('User ID not found');
      }
    }
  }, [searchParams, login, navigate]);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to self with query param to trigger the useEffect logic
    // Or just handle logic here. Let's redirect to keep logic centralized.
    if (inputId.startsWith('admin')) {
      navigate(`/?adminuid=${inputId}`);
    } else {
      navigate(`/?uid=${inputId}`);
    }
  };

  if (isAuthenticated) {
    return <div className="p-8 text-center">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary">CodeMyni Login</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 text-red-200 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleManualLogin} className="space-y-4">
          <div>
            <label htmlFor="uid" className="block text-sm font-medium text-gray-400 mb-1">
              User ID (UID)
            </label>
            <input
              type="text"
              id="uid"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary text-white"
              placeholder="Enter your ID (e.g. adminlord, teacher1, murid1)"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded transition-colors"
          >
            Login
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-center text-gray-500 mb-4">Demo Credentials:</p>
          <div className="flex flex-wrap gap-2 justify-center text-xs">
            <span className="px-2 py-1 bg-gray-800 rounded text-gray-300">adminlord</span>
            <span className="px-2 py-1 bg-gray-800 rounded text-gray-300">teacher1</span>
            <span className="px-2 py-1 bg-gray-800 rounded text-gray-300">murid1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gate;
