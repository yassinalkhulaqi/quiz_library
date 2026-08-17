import type {
  ActivityItem,
  Assessment,
  Attempt,
  Collection,
  NotificationItem,
  Question,
  QuestionType,
  Student,
  Subject,
  Template,
  Topic,
  UserProfile,
} from '../types';

const now = Date.now();
const DAY = 86_400_000;

export const SUBJECTS: Subject[] = [
  { id: 's_cyber', name: 'Cybersecurity', description: 'Protecting systems, networks and data from digital attacks.', color: '#ef4444', icon: 'shield' },
  { id: 's_net', name: 'Networking', description: 'Design, implementation and operation of computer networks.', color: '#38bdf8', icon: 'network' },
  { id: 's_prog', name: 'Programming', description: 'Writing and reasoning about code across paradigms.', color: '#a78bfa', icon: 'code' },
  { id: 's_math', name: 'Mathematics', description: 'Foundations of algebra, calculus and probability.', color: '#f59e0b', icon: 'sigma' },
  { id: 's_db', name: 'Databases', description: 'Designing, querying and managing data stores.', color: '#34d399', icon: 'database' },
];

export const TOPICS: Topic[] = [
  { id: 't_threats', subjectId: 's_cyber', name: 'Threats & Attacks' },
  { id: 't_crypto', subjectId: 's_cyber', name: 'Cryptography' },
  { id: 't_ns_cyber', subjectId: 's_cyber', name: 'Network Security' },
  { id: 't_websec', subjectId: 's_cyber', name: 'Web Security' },
  { id: 't_osi', subjectId: 's_net', name: 'OSI & TCP/IP' },
  { id: 't_ip', subjectId: 's_net', name: 'IP Addressing' },
  { id: 't_routing', subjectId: 's_net', name: 'Routing & Switching' },
  { id: 't_py', subjectId: 's_prog', name: 'Python Basics' },
  { id: 't_cpp', subjectId: 's_prog', name: 'C++ Fundamentals' },
  { id: 't_alg', subjectId: 's_prog', name: 'Algorithms' },
  { id: 't_algebra', subjectId: 's_math', name: 'Algebra' },
  { id: 't_calc', subjectId: 's_math', name: 'Calculus' },
  { id: 't_prob', subjectId: 's_math', name: 'Probability' },
  { id: 't_sql', subjectId: 's_db', name: 'SQL' },
  { id: 't_design', subjectId: 's_db', name: 'Database Design' },
];

export const STORED_QUESTIONS: Question[] = [
  {
    id: 'q01', type: 'multiple_choice', text: 'Which of the following best describes a phishing attack?',
    options: [
      { id: 'o1', text: 'A brute-force attempt on a password' },
      { id: 'o2', text: 'A social engineering attempt to obtain sensitive information' },
      { id: 'o3', text: 'A denial-of-service flood' },
      { id: 'o4', text: 'A man-in-the-middle interception' },
    ],
    correctAnswer: ['o2'],
    explanation: 'Phishing uses deception — typically fake emails or websites — to trick users into revealing credentials or personal data.',
    subjectId: 's_cyber', topicId: 't_threats', difficulty: 'easy', tags: ['social engineering', 'awareness'],
    points: 5, estimatedSeconds: 60, author: 'Demo Teacher', status: 'active', createdAt: now - 28 * DAY, updatedAt: now - 28 * DAY, usageCount: 34,
  },
  {
    id: 'q02', type: 'multiple_choice', text: 'What is the primary purpose of symmetric-key cryptography?',
    options: [
      { id: 'o1', text: 'To verify the sender identity' },
      { id: 'o2', text: 'To encrypt and decrypt data using the same key' },
      { id: 'o3', text: 'To exchange public certificates' },
      { id: 'o4', text: 'To sign digital documents' },
    ],
    correctAnswer: ['o2'],
    explanation: 'Symmetric cryptography (e.g. AES) uses one shared key for both encryption and decryption.',
    subjectId: 's_cyber', topicId: 't_crypto', difficulty: 'easy', tags: ['crypto', 'aes'],
    points: 5, estimatedSeconds: 60, author: 'Demo Teacher', status: 'active', createdAt: now - 26 * DAY, updatedAt: now - 26 * DAY, usageCount: 29,
  },
  {
    id: 'q03', type: 'multiple_choice', text: 'Which protocol is used to secure HTTP traffic?',
    options: [
      { id: 'o1', text: 'SMTP' }, { id: 'o2', text: 'FTP' }, { id: 'o3', text: 'TLS' }, { id: 'o4', text: 'ICMP' },
    ],
    correctAnswer: ['o3'],
    explanation: 'TLS (Transport Layer Security) provides encryption for HTTPS connections.',
    subjectId: 's_cyber', topicId: 't_ns_cyber', difficulty: 'easy', tags: ['tls', 'https'],
    points: 5, estimatedSeconds: 45, author: 'Demo Teacher', status: 'active', createdAt: now - 24 * DAY, updatedAt: now - 24 * DAY, usageCount: 41,
  },
  {
    id: 'q04', type: 'multiple_choice', text: 'In SQL injection, what does the attacker typically try to do?',
    options: [
      { id: 'o1', text: 'Overload the network with packets' },
      { id: 'o2', text: 'Inject malicious SQL into queries via untrusted input' },
      { id: 'o3', text: 'Enumerate open ports' },
      { id: 'o4', text: 'Decrypt SSL certificates' },
    ],
    correctAnswer: ['o2'],
    explanation: 'SQLi occurs when user input is concatenated into SQL without parameterization, letting the attacker alter the query.',
    subjectId: 's_cyber', topicId: 't_websec', difficulty: 'medium', tags: ['sqli', 'owasp'],
    points: 10, estimatedSeconds: 90, author: 'Demo Teacher', status: 'active', createdAt: now - 22 * DAY, updatedAt: now - 22 * DAY, usageCount: 52,
  },
  {
    id: 'q05', type: 'multiple_select', text: 'Which of the following are valid defense-in-depth measures? (Select all that apply)',
    options: [
      { id: 'o1', text: 'Network segmentation' },
      { id: 'o2', text: 'Application whitelisting' },
      { id: 'o3', text: 'Shared credentials across services' },
      { id: 'o4', text: 'Multi-factor authentication' },
    ],
    correctAnswer: ['o1', 'o2', 'o4'],
    explanation: 'Defense-in-depth layers controls; shared credentials and weak reuse actually weaken posture.',
    subjectId: 's_cyber', topicId: 't_ns_cyber', difficulty: 'medium', tags: ['defense-in-depth', 'mfa'],
    points: 10, estimatedSeconds: 120, author: 'Demo Teacher', status: 'active', createdAt: now - 20 * DAY, updatedAt: now - 20 * DAY, usageCount: 18,
  },
  {
    id: 'q06', type: 'true_false', text: 'A firewall is sufficient to protect a network from all external threats.',
    options: [
      { id: 'true', text: 'True' }, { id: 'false', text: 'False' },
    ],
    correctAnswer: ['false'],
    explanation: 'Firewalls are a single layer; threats like social engineering and application-layer attacks bypass them.',
    subjectId: 's_cyber', topicId: 't_ns_cyber', difficulty: 'easy', tags: ['firewall'],
    points: 5, estimatedSeconds: 45, author: 'Demo Teacher', status: 'active', createdAt: now - 19 * DAY, updatedAt: now - 19 * DAY, usageCount: 47,
  },
  {
    id: 'q07', type: 'short_answer', text: 'Which security principle states that a user should have only the minimum permissions necessary?',
    options: [], correctAnswer: ['least privilege'],
    explanation: 'Least privilege limits blast radius when a single account is compromised.',
    subjectId: 's_cyber', topicId: 't_threats', difficulty: 'easy', tags: ['iam'],
    points: 5, estimatedSeconds: 60, author: 'Demo Teacher', status: 'active', createdAt: now - 18 * DAY, updatedAt: now - 18 * DAY, usageCount: 22,
  },
  {
    id: 'q08', type: 'multiple_choice', text: 'Which OSI layer is responsible for routing packets between networks?',
    options: [
      { id: 'o1', text: 'Data Link Layer' }, { id: 'o2', text: 'Network Layer' },
      { id: 'o3', text: 'Transport Layer' }, { id: 'o4', text: 'Session Layer' },
    ],
    correctAnswer: ['o2'],
    explanation: 'Layer 3 (Network) handles logical addressing and routing.',
    subjectId: 's_net', topicId: 't_osi', difficulty: 'easy', tags: ['osi'],
    points: 5, estimatedSeconds: 60, author: 'Demo Teacher', status: 'active', createdAt: now - 30 * DAY, updatedAt: now - 30 * DAY, usageCount: 61,
  },
  {
    id: 'q09', type: 'multiple_choice', text: 'A device with IP 192.168.1.10/24 sends to 192.168.1.255. What is this destination?',
    options: [
      { id: 'o1', text: 'The default gateway' }, { id: 'o2', text: 'A multicast address' },
      { id: 'o3', text: 'The directed broadcast address' }, { id: 'o4', text: 'A loopback address' },
    ],
    correctAnswer: ['o3'],
    explanation: 'The highest host address in the subnet is the directed broadcast.',
    subjectId: 's_net', topicId: 't_ip', difficulty: 'medium', tags: ['subnetting', 'ipv4'],
    points: 10, estimatedSeconds: 120, author: 'Demo Teacher', status: 'active', createdAt: now - 27 * DAY, updatedAt: now - 27 * DAY, usageCount: 38,
  },
  {
    id: 'q10', type: 'true_false', text: 'TCP guarantees ordered, reliable delivery of data.',
    options: [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }],
    correctAnswer: ['true'],
    explanation: 'TCP provides sequencing, acknowledgments and retransmission; UDP does not.',
    subjectId: 's_net', topicId: 't_osi', difficulty: 'easy', tags: ['tcp'],
    points: 5, estimatedSeconds: 45, author: 'Demo Teacher', status: 'active', createdAt: now - 25 * DAY, updatedAt: now - 25 * DAY, usageCount: 55,
  },
  {
    id: 'q11', type: 'fill_blank', text: 'Routers make forwarding decisions based on the destination ________ address.',
    options: [], correctAnswer: ['ip', 'ip address', 'ipv4', 'internet protocol'],
    explanation: 'Routing is done at the Network Layer using logical (IP) addressing.',
    subjectId: 's_net', topicId: 't_routing', difficulty: 'easy', tags: ['routing'],
    points: 5, estimatedSeconds: 45, author: 'Demo Teacher', status: 'active', createdAt: now - 23 * DAY, updatedAt: now - 23 * DAY, usageCount: 19,
  },
  {
    id: 'q12', type: 'multiple_choice', text: 'What is the time complexity of a binary search on a sorted array of n elements?',
    options: [
      { id: 'o1', text: 'O(n)' }, { id: 'o2', text: 'O(log n)' },
      { id: 'o3', text: 'O(n log n)' }, { id: 'o4', text: 'O(n²)' },
    ],
    correctAnswer: ['o2'],
    explanation: 'Each step halves the search space, giving logarithmic behavior.',
    subjectId: 's_prog', topicId: 't_alg', difficulty: 'medium', tags: ['complexity', 'search'],
    points: 10, estimatedSeconds: 90, author: 'Demo Teacher', status: 'active', createdAt: now - 21 * DAY, updatedAt: now - 21 * DAY, usageCount: 44,
  },
  {
    id: 'q13', type: 'multiple_choice', text: 'In Python, which keyword is used to define a function?',
    options: [{ id: 'o1', text: 'func' }, { id: 'o2', text: 'def' }, { id: 'o3', text: 'function' }, { id: 'o4', text: 'lambda' }],
    correctAnswer: ['o2'],
    explanation: 'Functions are declared with "def name():".',
    subjectId: 's_prog', topicId: 't_py', difficulty: 'easy', tags: ['python'],
    points: 5, estimatedSeconds: 45, author: 'Demo Teacher', status: 'active', createdAt: now - 29 * DAY, updatedAt: now - 29 * DAY, usageCount: 70,
  },
  {
    id: 'q14', type: 'multiple_select', text: 'Which of these are fundamental data structures in C++? (Select all that apply)',
    options: [
      { id: 'o1', text: 'std::vector' }, { id: 'o2', text: 'std::string' },
      { id: 'o3', text: 'std::cloud' }, { id: 'o4', text: 'std::map' },
    ],
    correctAnswer: ['o1', 'o2', 'o4'],
    explanation: 'vector, string and map are core STL containers; std::cloud does not exist.',
    subjectId: 's_prog', topicId: 't_cpp', difficulty: 'medium', tags: ['cpp', 'stl'],
    points: 10, estimatedSeconds: 120, author: 'Demo Teacher', status: 'active', createdAt: now - 17 * DAY, updatedAt: now - 17 * DAY, usageCount: 15,
  },
  {
    id: 'q15', type: 'fill_blank', text: 'A data structure that follows the First-In-First-Out principle is called a ________.',
    options: [], correctAnswer: ['queue', 'fifo queue'],
    explanation: 'Queues process elements in insertion order.',
    subjectId: 's_prog', topicId: 't_alg', difficulty: 'easy', tags: ['data structures'],
    points: 5, estimatedSeconds: 45, author: 'Demo Teacher', status: 'active', createdAt: now - 16 * DAY, updatedAt: now - 16 * DAY, usageCount: 26,
  },
  {
    id: 'q16', type: 'multiple_choice', text: 'Solve for x: 3x + 9 = 27',
    options: [{ id: 'o1', text: '3' }, { id: 'o2', text: '6' }, { id: 'o3', text: '9' }, { id: 'o4', text: '12' }],
    correctAnswer: ['o2'],
    explanation: '3x = 18, so x = 6.',
    subjectId: 's_math', topicId: 't_algebra', difficulty: 'easy', tags: ['linear'],
    points: 5, estimatedSeconds: 60, author: 'Demo Teacher', status: 'active', createdAt: now - 26 * DAY, updatedAt: now - 26 * DAY, usageCount: 49,
  },
  {
    id: 'q17', type: 'multiple_choice', text: 'What is the derivative of f(x) = x²?',
    options: [{ id: 'o1', text: 'x' }, { id: 'o2', text: '2x' }, { id: 'o3', text: '2' }, { id: 'o4', text: 'x²/2' }],
    correctAnswer: ['o2'],
    explanation: 'Power rule: d/dx(xⁿ) = n·xⁿ⁻¹.',
    subjectId: 's_math', topicId: 't_calc', difficulty: 'easy', tags: ['derivatives'],
    points: 5, estimatedSeconds: 60, author: 'Demo Teacher', status: 'active', createdAt: now - 24 * DAY, updatedAt: now - 24 * DAY, usageCount: 57,
  },
  {
    id: 'q18', type: 'multiple_choice', text: 'A fair six-sided die is rolled once. What is the probability of rolling an even number?',
    options: [{ id: 'o1', text: '1/6' }, { id: 'o2', text: '1/3' }, { id: 'o3', text: '1/2' }, { id: 'o4', text: '2/3' }],
    correctAnswer: ['o3'],
    explanation: 'Three of six faces (2,4,6) are even, so 3/6 = 1/2.',
    subjectId: 's_math', topicId: 't_prob', difficulty: 'easy', tags: ['probability'],
    points: 5, estimatedSeconds: 60, author: 'Demo Teacher', status: 'active', createdAt: now - 22 * DAY, updatedAt: now - 22 * DAY, usageCount: 62,
  },
  {
    id: 'q19', type: 'multiple_choice', text: 'Which SQL clause is used to filter rows returned by a query?',
    options: [{ id: 'o1', text: 'ORDER BY' }, { id: 'o2', text: 'WHERE' }, { id: 'o3', text: 'GROUP BY' }, { id: 'o4', text: 'JOIN' }],
    correctAnswer: ['o2'],
    explanation: 'WHERE filters rows before grouping/ordering.',
    subjectId: 's_db', topicId: 't_sql', difficulty: 'easy', tags: ['sql'],
    points: 5, estimatedSeconds: 45, author: 'Demo Teacher', status: 'active', createdAt: now - 28 * DAY, updatedAt: now - 28 * DAY, usageCount: 68,
  },
  {
    id: 'q20', type: 'multiple_choice', text: 'Which of these is a NoSQL database?',
    options: [{ id: 'o1', text: 'PostgreSQL' }, { id: 'o2', text: 'MySQL' }, { id: 'o3', text: 'MongoDB' }, { id: 'o4', text: 'Oracle' }],
    correctAnswer: ['o3'],
    explanation: 'MongoDB is a document store; the others are relational.',
    subjectId: 's_db', topicId: 't_design', difficulty: 'easy', tags: ['nosql'],
    points: 5, estimatedSeconds: 45, author: 'Demo Teacher', status: 'active', createdAt: now - 20 * DAY, updatedAt: now - 20 * DAY, usageCount: 37,
  },
  {
    id: 'q21', type: 'multiple_choice', text: 'What is a primary key in a relational database?',
    options: [
      { id: 'o1', text: 'The most frequently queried column' },
      { id: 'o2', text: 'A column uniquely identifying each row' },
      { id: 'o3', text: 'A foreign key to another table' },
      { id: 'o4', text: 'An index on a large table' },
    ],
    correctAnswer: ['o2'],
    explanation: 'A primary key enforces uniqueness and identifies rows.',
    subjectId: 's_db', topicId: 't_design', difficulty: 'easy', tags: ['keys'],
    points: 5, estimatedSeconds: 60, author: 'Demo Teacher', status: 'active', createdAt: now - 18 * DAY, updatedAt: now - 18 * DAY, usageCount: 45,
  },
  {
    id: 'q22', type: 'essay', text: 'Explain the differences between symmetric and asymmetric encryption, and give one use case for each.',
    options: [], correctAnswer: [],
    explanation: 'Compare key management, performance, and use cases like TLS (asymmetric for key exchange, symmetric for bulk).',
    subjectId: 's_cyber', topicId: 't_crypto', difficulty: 'hard', tags: ['crypto', 'essay'],
    points: 20, estimatedSeconds: 600, author: 'Demo Teacher', status: 'active', createdAt: now - 15 * DAY, updatedAt: now - 15 * DAY, usageCount: 8,
  },
  {
    id: 'q23', type: 'multiple_select', text: 'Which are valid HTTP security headers? (Select all that apply)',
    options: [
      { id: 'o1', text: 'Content-Security-Policy' },
      { id: 'o2', text: 'X-Frame-Options' },
      { id: 'o3', text: 'Cache-Control: private' },
      { id: 'o4', text: 'Strict-Transport-Security' },
    ],
    correctAnswer: ['o1', 'o2', 'o4'],
    explanation: 'CSP, XFO and HSTS harden browser security; Cache-Control is not a security header per se.',
    subjectId: 's_cyber', topicId: 't_websec', difficulty: 'medium', tags: ['headers', 'owasp'],
    points: 10, estimatedSeconds: 90, author: 'Demo Teacher', status: 'active', createdAt: now - 14 * DAY, updatedAt: now - 14 * DAY, usageCount: 12,
  },
  {
    id: 'q24', type: 'multiple_choice', text: 'Which command displays the routing table on a Linux host?',
    options: [{ id: 'o1', text: 'ip route' }, { id: 'o2', text: 'ls' }, { id: 'o3', text: 'ifconfig -a' }, { id: 'o4', text: 'netstat -l' }],
    correctAnswer: ['o1'],
    explanation: '`ip route` (or `route -n`) shows the kernel routing table.',
    subjectId: 's_net', topicId: 't_routing', difficulty: 'medium', tags: ['linux', 'cli'],
    points: 10, estimatedSeconds: 90, author: 'Demo Teacher', status: 'active', createdAt: now - 13 * DAY, updatedAt: now - 13 * DAY, usageCount: 21,
  },
];

export const STUDENTS: Student[] = [
  { id: 'st_1', name: 'Omar Hassan', email: 'omar.hassan@university.edu', avatarColor: '#6366f1', grade: 'Year 3 — CS' },
  { id: 'st_2', name: 'Lina Ahmed', email: 'lina.ahmed@university.edu', avatarColor: '#14b8a6', grade: 'Year 2 — IT' },
  { id: 'st_3', name: 'Sara Khalid', email: 'sara.khalid@university.edu', avatarColor: '#f59e0b', grade: 'Year 3 — CS' },
  { id: 'st_4', name: 'Mohammed Ali', email: 'mohammed.ali@university.edu', avatarColor: '#ef4444', grade: 'Year 1 — Software Eng' },
  { id: 'st_5', name: 'Nour Yassin', email: 'nour.yassin@university.edu', avatarColor: '#a78bfa', grade: 'Year 2 — Networking' },
];

export const STORED_ASSESSMENTS: Assessment[] = [
  {
    id: 'as_1', kind: 'quiz', title: 'Cybersecurity Fundamentals', description: 'Core security concepts, threats and cryptography basics.',
    subjectId: 's_cyber', topicIds: ['t_threats', 't_crypto', 't_ns_cyber'], questionIds: ['q01', 'q02', 'q03', 'q06', 'q07', 'q22'],
    settings: {
      timeLimitMinutes: 30, maxAttempts: 3, passingScore: 60, randomizeQuestions: true, randomizeAnswers: true,
      showAnswersAfter: true, showExplanations: true, allowQuestionNavigation: true, allowReviewMarking: true,
      pointsPerQuestion: null, availableFrom: now - 20 * DAY, availableUntil: now + 30 * DAY,
    },
    status: 'published', author: 'Demo Teacher', createdAt: now - 20 * DAY, updatedAt: now - 10 * DAY, attemptsCount: 24, avgScore: 71,
  },
  {
    id: 'as_2', kind: 'exam', title: 'Networking Midterm', description: 'Midterm covering OSI model, IP addressing and routing.',
    subjectId: 's_net', topicIds: ['t_osi', 't_ip', 't_routing'], questionIds: ['q08', 'q09', 'q10', 'q11', 'q24'],
    settings: {
      timeLimitMinutes: 60, maxAttempts: 1, passingScore: 50, randomizeQuestions: false, randomizeAnswers: true,
      showAnswersAfter: false, showExplanations: true, allowQuestionNavigation: false, allowReviewMarking: true,
      pointsPerQuestion: null, availableFrom: now - 6 * DAY, availableUntil: now + 2 * DAY,
    },
    status: 'published', author: 'Demo Teacher', createdAt: now - 6 * DAY, updatedAt: now - 3 * DAY, attemptsCount: 18, avgScore: 64,
  },
  {
    id: 'as_3', kind: 'quiz', title: 'Python & Algorithms Quiz', description: 'Quick practice on Python syntax and algorithmic thinking.',
    subjectId: 's_prog', topicIds: ['t_py', 't_alg'], questionIds: ['q12', 'q13', 'q15'],
    settings: {
      timeLimitMinutes: 20, maxAttempts: 5, passingScore: 70, randomizeQuestions: true, randomizeAnswers: true,
      showAnswersAfter: true, showExplanations: true, allowQuestionNavigation: true, allowReviewMarking: false,
      pointsPerQuestion: null, availableFrom: now - 12 * DAY, availableUntil: now + 20 * DAY,
    },
    status: 'published', author: 'Demo Teacher', createdAt: now - 12 * DAY, updatedAt: now - 5 * DAY, attemptsCount: 33, avgScore: 78,
  },
  {
    id: 'as_4', kind: 'exam', title: 'Database Systems Final', description: 'Final exam on SQL, normalization and NoSQL.',
    subjectId: 's_db', topicIds: ['t_sql', 't_design'], questionIds: ['q19', 'q20', 'q21'],
    settings: {
      timeLimitMinutes: 90, maxAttempts: 1, passingScore: 55, randomizeQuestions: false, randomizeAnswers: false,
      showAnswersAfter: false, showExplanations: true, allowQuestionNavigation: true, allowReviewMarking: true,
      pointsPerQuestion: null, availableFrom: now + 5 * DAY, availableUntil: now + 5 * DAY + 3 * 3600_000,
    },
    status: 'published', author: 'Demo Teacher', createdAt: now - 2 * DAY, updatedAt: now - 1 * DAY, attemptsCount: 0, avgScore: null,
  },
];

export const STORED_ATTEMPTS: Attempt[] = [
  {
    id: 'at_1', assessmentId: 'as_1', kind: 'quiz', studentId: 'st_1', status: 'submitted',
    answers: [
      { questionId: 'q01', selectedOptionIds: ['o2'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q02', selectedOptionIds: ['o2'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q03', selectedOptionIds: ['o3'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q06', selectedOptionIds: ['false'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q07', selectedOptionIds: [], textAnswer: 'least privilege', isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q22', selectedOptionIds: [], textAnswer: 'Symmetric uses one shared key and is fast; asymmetric uses a public/private pair. TLS uses asymmetric to exchange a session key then symmetric for the bulk.', isMarkedForReview: false, isCorrect: true, gainedPoints: 20 },
    ],
    startedAt: now - 4 * DAY, submittedAt: now - 4 * DAY + 900_000, timeSpentSeconds: 900, score: 45, maxScore: 45,
  },
  {
    id: 'at_2', assessmentId: 'as_1', kind: 'quiz', studentId: 'st_2', status: 'submitted',
    answers: [
      { questionId: 'q01', selectedOptionIds: ['o2'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q02', selectedOptionIds: ['o4'], isMarkedForReview: false, isCorrect: false, gainedPoints: 0 },
      { questionId: 'q03', selectedOptionIds: ['o3'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q06', selectedOptionIds: ['true'], isMarkedForReview: true, isCorrect: false, gainedPoints: 0 },
      { questionId: 'q07', selectedOptionIds: [], textAnswer: 'separation of duties', isMarkedForReview: false, isCorrect: false, gainedPoints: 0 },
      { questionId: 'q22', selectedOptionIds: [], textAnswer: '', isMarkedForReview: false, isCorrect: false, gainedPoints: 0 },
    ],
    startedAt: now - 4 * DAY, submittedAt: now - 4 * DAY + 1400_000, timeSpentSeconds: 1400, score: 10, maxScore: 45,
  },
  {
    id: 'at_3', assessmentId: 'as_2', kind: 'exam', studentId: 'st_3', status: 'submitted',
    answers: [
      { questionId: 'q08', selectedOptionIds: ['o2'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q09', selectedOptionIds: ['o3'], isMarkedForReview: false, isCorrect: true, gainedPoints: 10 },
      { questionId: 'q10', selectedOptionIds: ['true'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q11', selectedOptionIds: [], textAnswer: 'ip', isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q24', selectedOptionIds: ['o1'], isMarkedForReview: false, isCorrect: true, gainedPoints: 10 },
    ],
    startedAt: now - 3 * DAY, submittedAt: now - 3 * DAY + 2200_000, timeSpentSeconds: 2200, score: 35, maxScore: 35,
  },
  {
    id: 'at_4', assessmentId: 'as_2', kind: 'exam', studentId: 'st_1', status: 'submitted',
    answers: [
      { questionId: 'q08', selectedOptionIds: ['o2'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q09', selectedOptionIds: ['o4'], isMarkedForReview: false, isCorrect: false, gainedPoints: 0 },
      { questionId: 'q10', selectedOptionIds: ['true'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q11', selectedOptionIds: [], textAnswer: 'mac', isMarkedForReview: false, isCorrect: false, gainedPoints: 0 },
      { questionId: 'q24', selectedOptionIds: ['o1'], isMarkedForReview: false, isCorrect: true, gainedPoints: 10 },
    ],
    startedAt: now - 3 * DAY, submittedAt: now - 3 * DAY + 2400_000, timeSpentSeconds: 2400, score: 20, maxScore: 35,
  },
  {
    id: 'at_5', assessmentId: 'as_3', kind: 'quiz', studentId: 'st_4', status: 'submitted',
    answers: [
      { questionId: 'q12', selectedOptionIds: ['o2'], isMarkedForReview: false, isCorrect: true, gainedPoints: 10 },
      { questionId: 'q13', selectedOptionIds: ['o2'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q15', selectedOptionIds: [], textAnswer: 'queue', isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
    ],
    startedAt: now - 2 * DAY, submittedAt: now - 2 * DAY + 600_000, timeSpentSeconds: 600, score: 20, maxScore: 20,
  },
  {
    id: 'at_6', assessmentId: 'as_1', kind: 'quiz', studentId: 'st_5', status: 'submitted',
    answers: [
      { questionId: 'q01', selectedOptionIds: ['o3'], isMarkedForReview: false, isCorrect: false, gainedPoints: 0 },
      { questionId: 'q02', selectedOptionIds: ['o2'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q03', selectedOptionIds: ['o3'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q06', selectedOptionIds: ['false'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q07', selectedOptionIds: [], textAnswer: 'least privilege', isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q22', selectedOptionIds: [], textAnswer: 'One key vs two keys; use asymmetric to securely share the symmetric key.', isMarkedForReview: false, isCorrect: true, gainedPoints: 20 },
    ],
    startedAt: now - 1 * DAY, submittedAt: now - 1 * DAY + 1000_000, timeSpentSeconds: 1000, score: 40, maxScore: 45,
  },
  {
    id: 'at_7', assessmentId: 'as_2', kind: 'exam', studentId: 'st_5', status: 'submitted',
    answers: [
      { questionId: 'q08', selectedOptionIds: ['o2'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q09', selectedOptionIds: ['o3'], isMarkedForReview: false, isCorrect: true, gainedPoints: 10 },
      { questionId: 'q10', selectedOptionIds: ['true'], isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q11', selectedOptionIds: [], textAnswer: 'ip', isMarkedForReview: false, isCorrect: true, gainedPoints: 5 },
      { questionId: 'q24', selectedOptionIds: ['o4'], isMarkedForReview: false, isCorrect: false, gainedPoints: 0 },
    ],
    startedAt: now - 2 * DAY, submittedAt: now - 2 * DAY + 2600_000, timeSpentSeconds: 2600, score: 25, maxScore: 35,
  },
];

export const STORED_COLLECTIONS: Collection[] = [
  { id: 'c1', name: 'Networking Fundamentals', description: 'Core networking questions for weekly review.', questionIds: ['q08', 'q09', 'q10', 'q11', 'q24'], createdAt: now - 15 * DAY },
  { id: 'c2', name: 'Cybersecurity Basics', description: 'Entry-level security questions.', questionIds: ['q01', 'q02', 'q03', 'q06', 'q07'], createdAt: now - 12 * DAY },
  { id: 'c3', name: 'Final Exam Prep', description: 'Mixed difficulty bank for final exam review.', questionIds: ['q04', 'q05', 'q12', 'q18', 'q22', 'q23'], createdAt: now - 8 * DAY },
];

export const STORED_TEMPLATES: Template[] = [
  {
    id: 'tp_1', name: 'Quick Quiz', description: 'Short, auto-graded quiz for daily practice.', kind: 'quiz',
    settings: { timeLimitMinutes: 15, maxAttempts: 5, passingScore: 60, randomizeQuestions: true, randomizeAnswers: true, showAnswersAfter: true, showExplanations: true },
    questionCount: 5, icon: 'zap',
  },
  {
    id: 'tp_2', name: 'Midterm', description: 'Structured exam with navigation control.', kind: 'exam',
    settings: { timeLimitMinutes: 60, maxAttempts: 1, passingScore: 50, randomizeQuestions: false, randomizeAnswers: true, showAnswersAfter: false, showExplanations: true, allowQuestionNavigation: false, allowReviewMarking: true },
    questionCount: 25, icon: 'file-text',
  },
  {
    id: 'tp_3', name: 'Final Exam', description: 'Comprehensive exam with long time window.', kind: 'exam',
    settings: { timeLimitMinutes: 120, maxAttempts: 1, passingScore: 55, randomizeQuestions: false, randomizeAnswers: false, showAnswersAfter: false, showExplanations: true, allowQuestionNavigation: true, allowReviewMarking: true },
    questionCount: 50, icon: 'graduation',
  },
  {
    id: 'tp_4', name: 'Practice Test', description: 'Unlimited attempts for self study.', kind: 'quiz',
    settings: { timeLimitMinutes: null, maxAttempts: 10, passingScore: 70, randomizeQuestions: true, randomizeAnswers: true, showAnswersAfter: true, showExplanations: true },
    questionCount: 10, icon: 'repeat',
  },
  {
    id: 'tp_5', name: 'Certification Exam', description: 'Timed exam simulating vendor certification.', kind: 'exam',
    settings: { timeLimitMinutes: 90, maxAttempts: 1, passingScore: 70, randomizeQuestions: true, randomizeAnswers: true, showAnswersAfter: false, showExplanations: false, allowQuestionNavigation: false, allowReviewMarking: true },
    questionCount: 60, icon: 'award',
  },
];

export const STORED_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', type: 'ai', title: 'AI generation completed', message: '12 questions generated for "Cryptography" in AI Studio.', read: false, createdAt: now - 40 * 60_000, link: '/ai-studio' },
  { id: 'n2', type: 'quiz', title: 'Quiz published', message: '"Python & Algorithms Quiz" is now available to students.', read: false, createdAt: now - 5 * 3600_000, link: '/quizzes' },
  { id: 'n3', type: 'exam', title: 'Exam submitted', message: 'Omar Hassan submitted "Networking Midterm" scoring 57%.', read: true, createdAt: now - 3 * DAY, link: '/analytics' },
  { id: 'n4', type: 'student', title: 'New student joined', message: 'Nour Yassin enrolled in your assessment group.', read: false, createdAt: now - 2 * DAY, link: '/students' },
  { id: 'n5', type: 'analytics', title: 'Analytics ready', message: 'Weekly performance report for Cybersecurity Fundamentals is available.', read: true, createdAt: now - 6 * DAY, link: '/analytics' },
];

export const STORED_ACTIVITY: ActivityItem[] = [
  { id: 'ac1', type: 'ai_generated', title: 'Generated 12 questions', description: 'AI Studio generated a draft set for topic "Cryptography".', createdAt: now - 40 * 60_000, userId: 'me' },
  { id: 'ac2', type: 'quiz_created', title: 'Created a quiz', description: '"Python & Algorithms Quiz" was created and published.', createdAt: now - 5 * 3600_000, userId: 'me' },
  { id: 'ac3', type: 'exam_submitted', title: 'Exam submitted', description: 'Omar Hassan completed "Networking Midterm".', createdAt: now - 3 * DAY, userId: 'st_1' },
  { id: 'ac4', type: 'question_created', title: 'Added a question', description: 'New SQL question added to "Database Systems".', createdAt: now - 2 * DAY, userId: 'me' },
  { id: 'ac5', type: 'student_joined', title: 'Student joined', description: 'Nour Yassin joined the "Year 2 — Networking" group.', createdAt: now - 2 * DAY, userId: 'st_5' },
  { id: 'ac6', type: 'collection', title: 'Updated a collection', description: '"Final Exam Prep" gained 3 new questions.', createdAt: now - 1 * DAY, userId: 'me' },
];

export const DEMO_PROFILE: UserProfile = {
  name: 'Yassin Alkhulaqi',
  email: 'yassinalkolaqi@gmail.com',
  role: 'teacher',
  organization: 'QuizMind University',
  avatarColor: '#6366f1',
};

export const AI_LEVELS = ['High School', 'Undergraduate', 'Graduate', 'Professional'];
export const QUESTION_TYPES: QuestionType[] = [
  'multiple_choice',
  'multiple_select',
  'true_false',
  'short_answer',
  'fill_blank',
  'essay',
];

export function topicById(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}

export function subjectById(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function topicName(id: string): string {
  return topicById(id)?.name ?? 'Unknown topic';
}

export function subjectName(id: string): string {
  return subjectById(id)?.name ?? 'Unknown subject';
}

export function topicsForSubject(subjectId: string): Topic[] {
  return TOPICS.filter((t) => t.subjectId === subjectId);
}