import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { mockDatabase } from '@/data/mock';
import { Student, User } from '@/types';
import { getRoleData } from '@/services/api';

export default function Dashboard() {
  const { user, role, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-500">CodeMyni Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Welcome, <span className="font-semibold text-white">{'name' in user ? user.name : user.uid}</span> ({role})
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
        >
          Logout
        </button>
      </header>

      <main>
        {role === 'admin' && <AdminDashboard currentUser={user as User} />}
        {role === 'teacher' && <TeacherDashboard currentUser={user as User} />}
        {role === 'student' && <StudentDashboard currentUser={user as Student} />}
      </main>
    </div>
  );
}

// --- Admin Dashboard ---
function AdminDashboard({ currentUser }: { currentUser: User }) {
  const [data, setData] = useState<{
    classes: string[];
    progress: Record<string, Record<string, number>>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoleData(currentUser.uid).then((res) => {
      if (res) {
        setData({
          classes: res.kelas_uids,
          progress: res.progress
        });
      }
      setLoading(false);
    });
  }, [currentUser.uid]);

  if (loading) return <div className="text-slate-400">Loading data from database...</div>;
  if (!data) return <div className="text-red-400">Failed to load data.</div>;

  // Flatten progress for table
  const progressList = Object.entries(data.progress).flatMap(([studentUid, courses]) => 
    Object.entries(courses).map(([courseUid, level]) => ({
      studentUid,
      courseUid,
      level
    }))
  );

  return (
    <div className="space-y-8">
      <Section title="All Classes">
        <DataTable
          headers={['Class UID']}
          data={data.classes}
          renderRow={(clsUid) => (
            <tr key={clsUid} className="border-b border-slate-800 hover:bg-slate-900">
              <td className="p-3 font-medium text-blue-300">{clsUid}</td>
            </tr>
          )}
        />
      </Section>

      <Section title="All Student Progress">
        <DataTable
          headers={['Student', 'Course', 'Level']}
          data={progressList}
          renderRow={(prog, idx) => (
            <tr key={`${prog.studentUid}-${prog.courseUid}-${idx}`} className="border-b border-slate-800 hover:bg-slate-900">
              <td className="p-3">{prog.studentUid}</td>
              <td className="p-3">{prog.courseUid}</td>
              <td className="p-3">{prog.level}</td>
            </tr>
          )}
        />
      </Section>
    </div>
  );
}

// --- Teacher Dashboard ---
function TeacherDashboard({ currentUser }: { currentUser: User }) {
  const [data, setData] = useState<{
    classes: string[];
    progress: Record<string, Record<string, number>>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoleData(currentUser.uid).then((res) => {
      if (res) {
        setData({
          classes: res.kelas_uids,
          progress: res.progress
        });
      }
      setLoading(false);
    });
  }, [currentUser.uid]);

  if (loading) return <div className="text-slate-400">Loading data from database...</div>;
  if (!data) return <div className="text-red-400">Failed to load data.</div>;

  // Flatten progress for table
  const progressList = Object.entries(data.progress).flatMap(([studentUid, courses]) => 
    Object.entries(courses).map(([courseUid, level]) => ({
      studentUid,
      courseUid,
      level
    }))
  );

  return (
    <div className="space-y-8">
      <Section title="My Classes">
        {data.classes.length === 0 ? (
          <p className="text-slate-400">No classes assigned.</p>
        ) : (
          <DataTable
            headers={['Class UID']}
            data={data.classes}
            renderRow={(clsUid) => (
              <tr key={clsUid} className="border-b border-slate-800 hover:bg-slate-900">
                <td className="p-3 font-medium text-blue-300">{clsUid}</td>
              </tr>
            )}
          />
        )}
      </Section>

      <Section title="My Students Progress">
        {progressList.length === 0 ? (
          <p className="text-slate-400">No progress data available for your students.</p>
        ) : (
          <DataTable
            headers={['Student', 'Course', 'Level']}
            data={progressList}
            renderRow={(prog, idx) => (
              <tr key={`${prog.studentUid}-${prog.courseUid}-${idx}`} className="border-b border-slate-800 hover:bg-slate-900">
                <td className="p-3">{prog.studentUid}</td>
                <td className="p-3">{prog.courseUid}</td>
                <td className="p-3">{prog.level}</td>
              </tr>
            )}
          />
        )}
      </Section>
    </div>
  );
}

// --- Student Dashboard ---
function StudentDashboard({ currentUser }: { currentUser: Student }) {
  const navigate = useNavigate();
  // Use state from store directly instead of fetching
  const { studentData } = useAuthStore();

  if (!studentData) {
    return <div className="text-red-400">No student data found. Please try logging in again.</div>;
  }

  // Map course UIDs to Mock Course Definitions for display (Title, Desc)
  const availableCourses = studentData.kursus_uids.map(uid => {
    const def = mockDatabase.courses.find(c => c.uid === uid);
    return {
      uid,
      title: def?.title || `Unknown Course (${uid})`,
      description: def?.description || 'No description available.',
      modulesCount: def?.modules.length || def?.moduleLength || 0
    };
  });

  const getProgressPercent = (courseUid: string, totalModules: number) => {
    if (totalModules === 0) return 0;
    
    // Check localStorage first for immediate feedback
    const storageKey = `codemyni_progress_${currentUser.uid}_${courseUid}`;
    const localLevel = localStorage.getItem(storageKey);
    
    // Use Store progress as base (from API when logged in)
    const apiLevel = studentData.progress[courseUid] || 0;
    const effectiveLevel = localLevel ? Math.max(parseInt(localLevel), apiLevel) : apiLevel;

    return Math.min(100, Math.round((effectiveLevel / totalModules) * 100));
  };

  return (
    <div className="space-y-8">
      <Section title="My Courses">
        {availableCourses.length === 0 ? (
          <p className="text-slate-400">No courses available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => {
              const percent = getProgressPercent(course.uid, course.modulesCount);
              // Pick first class ID for URL if multiple
              const classUid = studentData.kelas_uids[0] || 'default';

              return (
                <div
                  key={course.uid}
                  className="bg-slate-900 rounded-lg p-6 border border-slate-800 hover:border-blue-500 transition-colors shadow-lg"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Progress</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/unit/${course.uid}?kid=${classUid}&uid=${currentUser.uid}`)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
                  >
                    Continue
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

// --- Shared Components ---

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-white mb-4 pl-2 border-l-4 border-blue-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DataTable<T>({
  headers,
  data,
  renderRow,
}: {
  headers: string[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto bg-slate-900 rounded-lg border border-slate-800 shadow-md">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-950 text-slate-100 uppercase text-xs">
          <tr>
            {headers.map((h) => (
              <th key={h} className="p-3 font-semibold tracking-wide border-b border-slate-800">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{data.map(renderRow)}</tbody>
      </table>
    </div>
  );
}
