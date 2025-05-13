import { useData } from '../context/DataContext';

const Dashboard = () => {
  const { data } = useData();

  // Calculate stats
  const lessonCount = data.lessons.length;
  const vocabularyCount = data.lessons.reduce((acc, lesson) => acc + lesson.vocabularies.length, 0);
  const questionCount = data.lessons.reduce((acc, lesson) => acc + lesson.questions.length, 0);
  const challengeCount = data.challenges.length;
  const taskCount = data.challenges.reduce((acc, challenge) => acc + challenge.tasks.length, 0);
  const pendingTransactions = data.transactions.filter(t => t.status === 'pending').length;
  const couponCount = data.coupons.length;

  // Calculate level distribution
  const basicLessons = data.lessons.filter(l => l.level === 'Basic').length;
  const intermediateLessons = data.lessons.filter(l => l.level === 'Intermediate').length;
  const advancedLessons = data.lessons.filter(l => l.level === 'Advanced').length;

  // Order by lessons by level
  const levels = [
    { name: 'Basic', count: basicLessons, color: 'bg-green-500' },
    { name: 'Intermediate', count: intermediateLessons, color: 'bg-blue-500' },
    { name: 'Advanced', count: advancedLessons, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-sm text-gray-500">Overview of VoNinja App</span>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-light rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Lessons
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{lessonCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-secondary-light rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Vocabulary Words
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{vocabularyCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Questions
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{questionCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Challenges
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{challengeCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Levels Distribution */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Lesson Levels Distribution
            </h3>
          </div>
          <div className="px-4 pb-5 sm:px-6">
            <div className="space-y-4">
              {levels.map((level) => (
                <div key={level.name} className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-600">{level.name}</div>
                  <div className="flex-1">
                    <div className="relative">
                      <div className="overflow-hidden h-4 text-xs flex rounded bg-gray-200">
                        <div
                          style={{ width: `${(level.count / lessonCount) * 100}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${level.color}`}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 text-right text-sm font-medium text-gray-600">
                    {level.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Needed */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Actions Needed
            </h3>
          </div>
          <div className="bg-white px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${pendingTransactions > 0 ? 'bg-red-500' : 'bg-green-500'} mr-2`}></div>
                  <span className="text-sm font-medium text-gray-600">Pending Transactions</span>
                </div>
                <span className="text-sm font-semibold">{pendingTransactions}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${couponCount === 0 ? 'bg-yellow-500' : 'bg-green-500'} mr-2`}></div>
                  <span className="text-sm font-medium text-gray-600">Active Coupons</span>
                </div>
                <span className="text-sm font-semibold">{couponCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${challengeCount === 0 ? 'bg-yellow-500' : 'bg-green-500'} mr-2`}></div>
                  <span className="text-sm font-medium text-gray-600">Active Challenges</span>
                </div>
                <span className="text-sm font-semibold">{challengeCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${taskCount === 0 ? 'bg-yellow-500' : 'bg-green-500'} mr-2`}></div>
                  <span className="text-sm font-medium text-gray-600">Challenge Tasks</span>
                </div>
                <span className="text-sm font-semibold">{taskCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;