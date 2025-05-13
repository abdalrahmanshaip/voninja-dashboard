export const generateMockData = () => {
  // Generate mock lessons data
  const lessons = [
    {
      id: 'l1',
      title: 'Greetings and Introductions',
      level: 'Basic',
      order: 1,
      vocabularies: [
        {
          id: 'v1',
          word: 'Hello',
          translatedWord: 'مرحبا',
          englishStatement: 'Hello, how are you today?',
          arabicStatement: 'مرحبا، كيف حالك اليوم؟',
          image: 'https://images.pexels.com/photos/3760790/pexels-photo-3760790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        {
          id: 'v2',
          word: 'Goodbye',
          translatedWord: 'وداعا',
          englishStatement: 'Goodbye, see you tomorrow!',
          arabicStatement: 'وداعاً، أراك غداً!',
          image: 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        }
      ],
      questions: [
        {
          id: 'q1',
          content: 'How do you say "Hello" in English?',
          choices: ['Hello', 'Goodbye', 'Thank you'],
          correctAnswer: 'Hello',
          image: 'https://images.pexels.com/photos/3760790/pexels-photo-3760790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        }
      ]
    },
    {
      id: 'l2',
      title: 'Common Phrases',
      level: 'Basic',
      order: 2,
      vocabularies: [
        {
          id: 'v3',
          word: 'Thank you',
          translatedWord: 'شكراً',
          englishStatement: 'Thank you for your help.',
          arabicStatement: 'شكراً على مساعدتك.',
          image: 'https://images.pexels.com/photos/45842/clasped-hands-comfort-hands-people-45842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        }
      ],
      questions: [
        {
          id: 'q2',
          content: 'Which phrase expresses gratitude?',
          choices: ['Hello', 'Goodbye', 'Thank you'],
          correctAnswer: 'Thank you',
          image: 'https://images.pexels.com/photos/45842/clasped-hands-comfort-hands-people-45842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        }
      ]
    },
    {
      id: 'l3',
      title: 'Business Vocabulary',
      level: 'Intermediate',
      order: 1,
      vocabularies: [
        {
          id: 'v4',
          word: 'Meeting',
          translatedWord: 'اجتماع',
          englishStatement: 'We have a meeting at 10 AM.',
          arabicStatement: 'لدينا اجتماع الساعة 10 صباحاً.',
          image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        }
      ],
      questions: [
        {
          id: 'q3',
          content: 'What do you call a formal gathering to discuss business?',
          choices: ['Party', 'Meeting', 'Vacation'],
          correctAnswer: 'Meeting',
          image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        }
      ]
    },
    {
      id: 'l4',
      title: 'Academic Language',
      level: 'Advanced',
      order: 1,
      vocabularies: [
        {
          id: 'v5',
          word: 'Hypothesis',
          translatedWord: 'فرضية',
          englishStatement: 'The scientist developed a hypothesis based on the data.',
          arabicStatement: 'طور العالم فرضية بناءً على البيانات.',
          image: 'https://images.pexels.com/photos/2280547/pexels-photo-2280547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        }
      ],
      questions: [
        {
          id: 'q4',
          content: 'What is a proposed explanation made on limited evidence as a starting point for further investigation called?',
          choices: ['Theory', 'Hypothesis', 'Law'],
          correctAnswer: 'Hypothesis',
          image: 'https://images.pexels.com/photos/2280547/pexels-photo-2280547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        }
      ]
    }
  ];

  // Generate mock challenges data
  const challenges = [
    {
      id: 'c1',
      title: 'Weekly Challenge',
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      deductionPoints: 5,
      rewardPoints: 20,
      subscriptionPoints: 100,
      rewards: {
        first: 500,
        second: 300,
        third: 150
      },
      tasks: [
        {
          id: 't1',
          title: 'Basic Greetings Challenge',
          order: 1,
          questions: [
            {
              id: 'tq1',
              content: 'What is the correct way to greet someone in the morning?',
              choices: ['Good morning', 'Good evening', 'Good night'],
              correctAnswer: 'Good morning',
              image: 'https://images.pexels.com/photos/2774197/pexels-photo-2774197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            }
          ]
        }
      ]
    },
    {
      id: 'c2',
      title: 'Monthly Business Challenge',
      endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      deductionPoints: 10,
      rewardPoints: 50,
      subscriptionPoints: 200,
      rewards: {
        first: 1000,
        second: 500,
        third: 250
      },
      tasks: [
        {
          id: 't2',
          title: 'Business Communications',
          order: 1,
          questions: [
            {
              id: 'tq2',
              content: 'What is the best way to start a formal business email?',
              choices: ['Hey there!', 'Dear Sir/Madam', 'What\'s up?'],
              correctAnswer: 'Dear Sir/Madam',
              image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            }
          ]
        }
      ]
    }
  ];

  // Generate mock transactions data
  const transactions = [
    {
      id: 'tr1',
      userId: 'u1',
      username: 'john_doe',
      phone: '+1234567890',
      points: 500,
      price: 5.99,
      status: 'pending',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'tr2',
      userId: 'u2',
      username: 'jane_smith',
      phone: '+1987654321',
      points: 1000,
      price: 9.99,
      status: 'approved',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'tr3',
      userId: 'u3',
      username: 'ahmad_hassan',
      phone: '+9876543210',
      points: 2000,
      price: 19.99,
      status: 'rejected',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Generate mock coupons data
  const coupons = [
    {
      id: 'cp1',
      content: 'WELCOME2023',
      pointValue: 100,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cp2',
      content: 'SUMMER50',
      pointValue: 50,
      expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return { lessons, challenges, transactions, coupons };
};