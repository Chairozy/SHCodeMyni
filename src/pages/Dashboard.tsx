import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { mockDatabase } from '@/data/mock';
import { Class, Course, Progress, Student, User } from '@/types';

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
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <header className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">CodeMyni Dashboard</h1>
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
        {role === 'admin' && <AdminDashboard />}
        {role === 'teacher' && <TeacherDashboard currentUser={user as User} />}
        {role === 'student' && <StudentDashboard currentUser={user as Student} />}
      </main>
    </div>
  );
}

// --- Admin Dashboard ---
function AdminDashboard() {
  return (
    <div className="space-y-8">
      <Section title="Classes">
        <DataTable
          headers={['UID', 'Teachers', 'Students', 'Courses']}
          data={mockDatabase.classes}
          renderRow={(cls: Class) => (
            <tr key={cls.uid} className="border-b border-slate-700 hover:bg-slate-800">
              <td className="p-3">{cls.uid}</td>
              <td className="p-3">{cls.teacherUids.join(', ')}</td>
              <td className="p-3">{cls.studentUids.join(', ')}</td>
              <td className="p-3">{cls.courseUids.join(', ')}</td>
            </tr>
          )}
        />
      </Section>

      <Section title="Students">
        <DataTable
          headers={['UID', 'Class IDs']}
          data={mockDatabase.students}
          renderRow={(std: Student) => (
            <tr key={std.uid} className="border-b border-slate-700 hover:bg-slate-800">
              <td className="p-3">{std.uid}</td>
              <td className="p-3">{std.classIds.join(', ')}</td>
            </tr>
          )}
        />
      </Section>

      <Section title="Progress">
        <DataTable
          headers={['Student', 'Course', 'Level']}
          data={mockDatabase.progress}
          renderRow={(prog: Progress) => (
            <tr key={prog.id} className="border-b border-slate-700 hover:bg-slate-800">
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
  // Find classes where this teacher is assigned
  const myClasses = mockDatabase.classes.filter((cls) =>
    cls.teacherUids.includes(currentUser.uid)
  );

  // Get students in those classes
  const myStudentUids = new Set<string>();
  myClasses.forEach((cls) => {
    cls.studentUids.forEach((uid) => myStudentUids.add(uid));
  });

  // Get progress for those students
  const myStudentsProgress = mockDatabase.progress.filter((prog) =>
    myStudentUids.has(prog.studentUid)
  );

  return (
    <div className="space-y-8">
      <Section title="My Classes">
        {myClasses.length === 0 ? (
          <p className="text-slate-400">No classes assigned.</p>
        ) : (
          <DataTable
            headers={['Class UID', 'Students Count', 'Courses']}
            data={myClasses}
            renderRow={(cls: Class) => (
              <tr key={cls.uid} className="border-b border-slate-700 hover:bg-slate-800">
                <td className="p-3 font-medium text-blue-300">{cls.uid}</td>
                <td className="p-3">{cls.studentUids.length} students</td>
                <td className="p-3">{cls.courseUids.join(', ')}</td>
              </tr>
            )}
          />
        )}
      </Section>

      <Section title="Student Progress">
        {myStudentsProgress.length === 0 ? (
          <p className="text-slate-400">No progress data available for your students.</p>
        ) : (
          <DataTable
            headers={['Student', 'Course', 'Level']}
            data={myStudentsProgress}
            renderRow={(prog: Progress) => (
              <tr key={prog.id} className="border-b border-slate-700 hover:bg-slate-800">
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

  // Find classes the student belongs to
  const myClasses = mockDatabase.classes.filter((cls) =>
    currentUser.classIds.includes(cls.uid)
  );

  // Find courses available in those classes
  const myCourseUids = new Set<string>();
  myClasses.forEach((cls) => {
    cls.courseUids.forEach((uid) => myCourseUids.add(uid));
  });

  const myCourses = mockDatabase.courses.filter((course) =>
    myCourseUids.has(course.uid)
  );

  // Get student's progress (Mock + LocalStorage)
  const getProgressPercent = (courseUid: string) => {
    // Check localStorage first
    const storageKey = `codemyni_progress_${currentUser.uid}_${courseUid}`;
    const savedLevel = localStorage.getItem(storageKey);
    let level = 0;

    if (savedLevel) {
      level = parseInt(savedLevel, 10);
    } else {
      // Fallback to mock
      const prog = mockDatabase.progress.find(
        (p) => p.studentUid === currentUser.uid && p.courseUid === courseUid
      );
      if (prog) {
        level = prog.level;
      }
    }

    const course = mockDatabase.courses.find((c) => c.uid === courseUid);
    if (!course) return 0;
    
    const total = course.modules.length;
    if (total === 0) return 0;
    
    // Cap level at total
    const effectiveLevel = Math.min(level, total);
    return Math.round((effectiveLevel / total) * 100);
  };

  return (
    <div className="space-y-8">
      <Section title="My Courses">
        {myCourses.length === 0 ? (
          <p className="text-slate-400">No courses available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course) => {
              const percent = getProgressPercent(course.uid);
              // We need to know which class this course belongs to for the URL param
              // Ideally, user picks a class if course is in multiple classes.
              // For simplicity, pick the first class found that has this course.
              const classUid = myClasses.find(c => c.courseUids.includes(course.uid))?.uid || '';

              return (
                <div
                  key={course.uid}
                  className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-colors"
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
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
  renderRow: (item: T) => React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900 text-slate-100 uppercase text-xs">
          <tr>
            {headers.map((h) => (
              <th key={h} className="p-3 font-semibold tracking-wide">
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
