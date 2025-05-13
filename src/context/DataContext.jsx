import { createContext, useContext, useState } from 'react';
import { generateMockData } from '../data/mockData';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    // Try to load data from localStorage, or generate new mock data
    const savedData = localStorage.getItem('voninja_data');
    return savedData ? JSON.parse(savedData) : generateMockData();
  });

  // Save data to localStorage whenever it changes
  const updateData = (newData) => {
    setData(newData);
    localStorage.setItem('voninja_data', JSON.stringify(newData));
  };

  // Lessons CRUD operations
  const getLessons = (level) => {
    return data.lessons.filter(lesson => lesson.level === level);
  };

  const getLesson = (id) => {
    return data.lessons.find(lesson => lesson.id === id);
  };

  const addLesson = (lesson) => {
    const newData = {
      ...data,
      lessons: [...data.lessons, { 
        ...lesson, 
        id: Math.random().toString(36).substr(2, 9),
        vocabularies: [],
        questions: []
      }]
    };
    updateData(newData);
  };

  const updateLesson = (id, updatedLesson) => {
    const newData = {
      ...data,
      lessons: data.lessons.map(lesson => 
        lesson.id === id ? { ...lesson, ...updatedLesson } : lesson
      )
    };
    updateData(newData);
  };

  const deleteLesson = (id) => {
    const newData = {
      ...data,
      lessons: data.lessons.filter(lesson => lesson.id !== id)
    };
    updateData(newData);
  };

  // Vocabulary CRUD operations
  const getVocabularies = (lessonId) => {
    const lesson = data.lessons.find(l => l.id === lessonId);
    return lesson ? lesson.vocabularies : [];
  };

  const addVocabulary = (lessonId, vocabulary) => {
    const newData = {
      ...data,
      lessons: data.lessons.map(lesson => {
        if (lesson.id === lessonId) {
          return {
            ...lesson,
            vocabularies: [
              ...lesson.vocabularies,
              { ...vocabulary, id: Math.random().toString(36).substr(2, 9) }
            ]
          };
        }
        return lesson;
      })
    };
    updateData(newData);
  };

  const updateVocabulary = (lessonId, id, updatedVocabulary) => {
    const newData = {
      ...data,
      lessons: data.lessons.map(lesson => {
        if (lesson.id === lessonId) {
          return {
            ...lesson,
            vocabularies: lesson.vocabularies.map(vocabulary =>
              vocabulary.id === id ? { ...vocabulary, ...updatedVocabulary } : vocabulary
            )
          };
        }
        return lesson;
      })
    };
    updateData(newData);
  };

  const deleteVocabulary = (lessonId, id) => {
    const newData = {
      ...data,
      lessons: data.lessons.map(lesson => {
        if (lesson.id === lessonId) {
          return {
            ...lesson,
            vocabularies: lesson.vocabularies.filter(vocabulary => vocabulary.id !== id)
          };
        }
        return lesson;
      })
    };
    updateData(newData);
  };

  // Question CRUD operations
  const getQuestions = (lessonId) => {
    const lesson = data.lessons.find(l => l.id === lessonId);
    return lesson ? lesson.questions : [];
  };

  const addQuestion = (lessonId, question) => {
    const newData = {
      ...data,
      lessons: data.lessons.map(lesson => {
        if (lesson.id === lessonId) {
          return {
            ...lesson,
            questions: [
              ...lesson.questions,
              { ...question, id: Math.random().toString(36).substr(2, 9) }
            ]
          };
        }
        return lesson;
      })
    };
    updateData(newData);
  };

  const updateQuestion = (lessonId, id, updatedQuestion) => {
    const newData = {
      ...data,
      lessons: data.lessons.map(lesson => {
        if (lesson.id === lessonId) {
          return {
            ...lesson,
            questions: lesson.questions.map(question =>
              question.id === id ? { ...question, ...updatedQuestion } : question
            )
          };
        }
        return lesson;
      })
    };
    updateData(newData);
  };

  const deleteQuestion = (lessonId, id) => {
    const newData = {
      ...data,
      lessons: data.lessons.map(lesson => {
        if (lesson.id === lessonId) {
          return {
            ...lesson,
            questions: lesson.questions.filter(question => question.id !== id)
          };
        }
        return lesson;
      })
    };
    updateData(newData);
  };

  // Challenges CRUD operations
  const getChallenges = () => {
    return data.challenges;
  };

  const getChallenge = (id) => {
    return data.challenges.find(challenge => challenge.id === id);
  };

  const addChallenge = (challenge) => {
    const newData = {
      ...data,
      challenges: [...data.challenges, { 
        ...challenge, 
        id: Math.random().toString(36).substr(2, 9),
        tasks: []
      }]
    };
    updateData(newData);
  };

  const updateChallenge = (id, updatedChallenge) => {
    const newData = {
      ...data,
      challenges: data.challenges.map(challenge => 
        challenge.id === id ? { ...challenge, ...updatedChallenge } : challenge
      )
    };
    updateData(newData);
  };

  const deleteChallenge = (id) => {
    const newData = {
      ...data,
      challenges: data.challenges.filter(challenge => challenge.id !== id)
    };
    updateData(newData);
  };

  // Tasks CRUD operations
  const getTasks = (challengeId) => {
    const challenge = data.challenges.find(c => c.id === challengeId);
    return challenge ? challenge.tasks : [];
  };

  const addTask = (challengeId, task) => {
    const newData = {
      ...data,
      challenges: data.challenges.map(challenge => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            tasks: [
              ...challenge.tasks,
              { ...task, id: Math.random().toString(36).substr(2, 9), questions: [] }
            ]
          };
        }
        return challenge;
      })
    };
    updateData(newData);
  };

  const updateTask = (challengeId, id, updatedTask) => {
    const newData = {
      ...data,
      challenges: data.challenges.map(challenge => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            tasks: challenge.tasks.map(task =>
              task.id === id ? { ...task, ...updatedTask } : task
            )
          };
        }
        return challenge;
      })
    };
    updateData(newData);
  };

  const deleteTask = (challengeId, id) => {
    const newData = {
      ...data,
      challenges: data.challenges.map(challenge => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            tasks: challenge.tasks.filter(task => task.id !== id)
          };
        }
        return challenge;
      })
    };
    updateData(newData);
  };

  // Task Questions CRUD operations
  const getTaskQuestions = (challengeId, taskId) => {
    const challenge = data.challenges.find(c => c.id === challengeId);
    if (!challenge) return [];
    const task = challenge.tasks.find(t => t.id === taskId);
    return task ? task.questions : [];
  };

  const addTaskQuestion = (challengeId, taskId, question) => {
    const newData = {
      ...data,
      challenges: data.challenges.map(challenge => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            tasks: challenge.tasks.map(task => {
              if (task.id === taskId) {
                return {
                  ...task,
                  questions: [
                    ...task.questions,
                    { ...question, id: Math.random().toString(36).substr(2, 9) }
                  ]
                };
              }
              return task;
            })
          };
        }
        return challenge;
      })
    };
    updateData(newData);
  };

  const updateTaskQuestion = (challengeId, taskId, id, updatedQuestion) => {
    const newData = {
      ...data,
      challenges: data.challenges.map(challenge => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            tasks: challenge.tasks.map(task => {
              if (task.id === taskId) {
                return {
                  ...task,
                  questions: task.questions.map(question =>
                    question.id === id ? { ...question, ...updatedQuestion } : question
                  )
                };
              }
              return task;
            })
          };
        }
        return challenge;
      })
    };
    updateData(newData);
  };

  const deleteTaskQuestion = (challengeId, taskId, id) => {
    const newData = {
      ...data,
      challenges: data.challenges.map(challenge => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            tasks: challenge.tasks.map(task => {
              if (task.id === taskId) {
                return {
                  ...task,
                  questions: task.questions.filter(question => question.id !== id)
                };
              }
              return task;
            })
          };
        }
        return challenge;
      })
    };
    updateData(newData);
  };

  // Transactions operations
  const getTransactions = () => {
    return data.transactions;
  };

  const updateTransactionStatus = (id, status) => {
    const newData = {
      ...data,
      transactions: data.transactions.map(transaction => 
        transaction.id === id ? { ...transaction, status } : transaction
      )
    };
    updateData(newData);
  };

  // Coupons CRUD operations
  const getCoupons = () => {
    return data.coupons;
  };

  const addCoupon = (coupon) => {
    const newData = {
      ...data,
      coupons: [...data.coupons, { 
        ...coupon, 
        id: Math.random().toString(36).substr(2, 9) 
      }]
    };
    updateData(newData);
  };

  const updateCoupon = (id, updatedCoupon) => {
    const newData = {
      ...data,
      coupons: data.coupons.map(coupon => 
        coupon.id === id ? { ...coupon, ...updatedCoupon } : coupon
      )
    };
    updateData(newData);
  };

  const deleteCoupon = (id) => {
    const newData = {
      ...data,
      coupons: data.coupons.filter(coupon => coupon.id !== id)
    };
    updateData(newData);
  };

  const value = {
    data,
    // Lessons
    getLessons,
    getLesson,
    addLesson,
    updateLesson,
    deleteLesson,
    // Vocabularies
    getVocabularies,
    addVocabulary,
    updateVocabulary,
    deleteVocabulary,
    // Questions
    getQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    // Challenges
    getChallenges,
    getChallenge,
    addChallenge,
    updateChallenge,
    deleteChallenge,
    // Tasks
    getTasks,
    addTask,
    updateTask,
    deleteTask,
    // Task Questions
    getTaskQuestions,
    addTaskQuestion,
    updateTaskQuestion,
    deleteTaskQuestion,
    // Transactions
    getTransactions,
    updateTransactionStatus,
    // Coupons
    getCoupons,
    addCoupon,
    updateCoupon,
    deleteCoupon
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;