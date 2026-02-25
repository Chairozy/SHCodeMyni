import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getRoleData, getStudentCourse } from '../services/api';

const Gate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [inputId, setInputId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const adminUid = searchParams.get('adminuid');
    const uid = searchParams.get('uid');
    
    // Only attempt auto-login if params exist and we are not already authenticated
    if (adminUid || uid) {
      handleLogin(adminUid || uid!);
    }
  }, [searchParams]); // Re-run if URL params change

  const handleLogin = async (uid: string) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Try to fetch as Admin/Teacher
      const roleData = await getRoleData(uid);
      
      // Check if roleData is valid (not empty object as per student case)
      if (roleData && (roleData.kelas_uids?.length > 0 || Object.keys(roleData.progress || {}).length > 0)) {
        // It's an Admin or Teacher
        const role = uid.startsWith('admin') ? 'admin' : 'teacher';
        login({ uid, name: uid, role }, role);
        navigate('/dashboard');
        return;
      }

      // 2. If not Admin/Teacher, try to fetch as Student
      const studentData = await getStudentCourse(uid);
      
      if (studentData && (studentData.kursus_uids?.length > 0 || studentData.kelas_uids?.length > 0)) {
        // It's a Student
        // Pass studentData to login to persist it in store
        login(
          { uid, name: uid, role: 'student', classIds: studentData.kelas_uids }, 
          'student',
          studentData
        );
        navigate('/dashboard');
        return;
      }

      setError('User ID not found in database');
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputId.trim()) return;
    
    // Trigger login logic
    if (inputId.startsWith('admin')) {
      navigate(`/?adminuid=${inputId}`);
    } else {
      navigate(`/?uid=${inputId}`);
    }
  };

  if (isAuthenticated && !loading) {
     // Optional: Redirect if already logged in?
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-500">CodeMyni Login</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 text-red-200 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleManualLogin} className="space-y-4">
          <div>
            <label htmlFor="uid" className="block text-sm font-medium text-slate-400 mb-1">
              User ID (UID)
            </label>
            <input
              type="text"
              id="uid"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-600"
              placeholder="Enter your ID (e.g. teacher1, murid1)"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded transition-colors"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs text-center text-slate-500 mb-4">Demo Credentials:</p>
          <div className="flex flex-wrap gap-2 justify-center text-xs">
            <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">teacher1</span>
            <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">murid1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gate;
