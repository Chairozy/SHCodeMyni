import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { mockDatabase } from '@/data/mock';
import { Course as CourseType, Module, QuizQuestion } from '@/types';

export default function Course() {
  const { courseUid } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const studentUid = searchParams.get('uid');
  const classUid = searchParams.get('kid');

  const [course, setCourse] = useState<CourseType | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load course and progress
  useEffect(() => {
    if (!courseUid || !studentUid) {
      setLoading(false);
      return;
    }

    const foundCourse = mockDatabase.courses.find(c => c.uid === courseUid);
    setCourse(foundCourse || null);

    // Load progress from localStorage
    const storageKey = `codemyni_progress_${studentUid}_${courseUid}`;
    const savedLevel = localStorage.getItem(storageKey);
    
    if (savedLevel) {
      setCurrentLevel(parseInt(savedLevel, 10));
    } else {
      // Fallback to mock progress if not in local storage
      const mockProg = mockDatabase.progress.find(
        p => p.studentUid === studentUid && p.courseUid === courseUid
      );
      if (mockProg) {
        setCurrentLevel(mockProg.level);
      }
    }
    
    setLoading(false);
  }, [courseUid, studentUid]);

  const handleNextLevel = () => {
    const nextLevel = currentLevel + 1;
    setCurrentLevel(nextLevel);
    
    // Save to localStorage
    if (studentUid && courseUid) {
      const storageKey = `codemyni_progress_${studentUid}_${courseUid}`;
      localStorage.setItem(storageKey, nextLevel.toString());
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  if (!studentUid || !classUid) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-slate-400">Missing student or class information.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = currentLevel >= course.modules.length;
  // If completed, show completion screen. Otherwise show current module.
  const currentModule = !isCompleted ? course.modules[currentLevel] : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-blue-400 truncate max-w-xs md:max-w-md">{course.title}</h1>
            <div className="text-xs text-slate-400 mt-1">
              {isCompleted 
                ? 'Course Completed' 
                : `Level ${currentLevel + 1} of ${course.modules.length}`}
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm px-3 py-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            Exit Course
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6 flex flex-col items-center">
        {isCompleted ? (
          <div className="bg-slate-800 rounded-xl p-8 md:p-12 text-center border border-slate-700 shadow-xl mt-8 w-full">
            <div className="text-6xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">Congratulations!</h2>
            <p className="text-slate-300 mb-8 text-lg">
              You have successfully completed all levels in <br/>
              <span className="text-blue-400 font-semibold">{course.title}</span>.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all transform hover:scale-105"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="w-full">
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 mb-8 overflow-hidden">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${(currentLevel / course.modules.length) * 100}%` }}
              ></div>
            </div>
            
            <ModuleViewer 
              key={currentModule!.id} 
              module={currentModule!} 
              onComplete={handleNextLevel} 
            />
          </div>
        )}
      </main>
    </div>
  );
}

function ModuleViewer({ module, onComplete }: { module: Module; onComplete: () => void }) {
  if (module.type === 'quiz') {
    // Assuming 1 question per module as per refactored mock data
    const question = module.questions?.[0];
    if (!question) return <div className="text-red-400">Error: No question found in this module.</div>;

    return <QuizRunner 
      key={module.id} 
      moduleTitle={module.title}
      question={question} 
      onComplete={onComplete} 
    />;
  }

  // Fallback for lesson type
  return (
    <div className="bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-700 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-white">{module.title}</h2>
      <div className="prose prose-invert max-w-none text-slate-300 mb-8">
        {module.content || 'No content available.'}
      </div>
      <div className="flex justify-end">
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Mark as Complete & Continue
        </button>
      </div>
    </div>
  );
}

function QuizRunner({ 
  moduleTitle, 
  question, 
  onComplete 
}: { 
  moduleTitle: string; 
  question: QuizQuestion; 
  onComplete: () => void 
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (!selectedOption) return;
    
    const correctOption = question.options.find(opt => opt.isCorrect);
    const correct = correctOption?.id === selectedOption;
    
    setIsSubmitted(true);
    setIsCorrect(correct);
  };

  const handleRetry = () => {
    setIsSubmitted(false);
    setIsCorrect(false);
    setSelectedOption(null);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-700 shadow-lg transition-all duration-300">
      <div className="mb-6 border-b border-slate-700 pb-4">
        <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">{moduleTitle}</h2>
        <h3 className="text-xl md:text-2xl text-white font-medium leading-snug">{question.question}</h3>
      </div>

      <div className="space-y-3 mb-8">
        {question.options.map((option) => {
          let optionClass = "bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-slate-500"; // default
          
          if (isSubmitted) {
            if (option.isCorrect) {
              optionClass = "bg-green-900/30 border-green-500 ring-1 ring-green-500";
            } else if (option.id === selectedOption) {
              optionClass = "bg-red-900/30 border-red-500 ring-1 ring-red-500";
            } else {
              optionClass = "bg-slate-800 border-slate-700 opacity-50";
            }
          } else if (selectedOption === option.id) {
            optionClass = "bg-blue-900/30 border-blue-500 ring-1 ring-blue-500";
          }

          return (
            <div
              key={option.id}
              onClick={() => !isSubmitted && setSelectedOption(option.id)}
              className={`relative flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${optionClass}`}
            >
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${
                selectedOption === option.id 
                  ? 'border-blue-500 bg-blue-500 text-white' 
                  : 'border-slate-500 bg-slate-800'
              }`}>
                {selectedOption === option.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              
              <span className="text-slate-200 flex-1">{option.text}</span>
              
              {isSubmitted && option.isCorrect && (
                <span className="text-green-400 font-bold ml-2">✓</span>
              )}
              {isSubmitted && !option.isCorrect && option.id === selectedOption && (
                <span className="text-red-400 font-bold ml-2">✗</span>
              )}
            </div>
          );
        })}
      </div>

      {isSubmitted && (
        <div className={`p-4 rounded-lg mb-6 flex items-start ${
          isCorrect ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'
        }`}>
          <div className={`text-2xl mr-3 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
            {isCorrect ? '✓' : '✗'}
          </div>
          <div>
            <h3 className={`font-bold mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {question.explanation}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-slate-700">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="px-6 py-2.5 bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed hover:bg-blue-700 text-white rounded-lg font-bold transition-all transform active:scale-95 shadow-lg shadow-blue-900/20"
          >
            Submit Answer
          </button>
        ) : isCorrect ? (
          <button
            onClick={onComplete}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all transform active:scale-95 shadow-lg shadow-green-900/20 flex items-center"
          >
            Next Level <span className="ml-2">→</span>
          </button>
        ) : (
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-bold transition-all transform active:scale-95"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
