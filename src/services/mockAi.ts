import type { AiGenerationConfig, Question, QuestionType } from '../types';
import { uid } from '../lib/utils';
import { subjectName, topicName } from '../data/demoData';

/**
 * Curated, topic-aware question templates used by the *demo* generator so that
 * generated content stays coherent with the demo subjects. This is NOT a real
 * AI — the UI always labels demo output as "Demo mode".
 */
interface MockTemplate {
  type: QuestionType;
  text: string;
  options?: { text: string; correct: boolean }[];
  answer?: string[];
  explanation: string;
  difficulty: Question['difficulty'];
}

const TOPIC_TEMPLATES: Record<string, MockTemplate[]> = {
  t_threats: [
    {
      type: 'multiple_choice',
      text: 'Which type of malware is designed to secretly collect information about a user?',
      options: [
        { text: 'Spyware', correct: true },
        { text: 'Worm', correct: false },
        { text: 'Ransomware', correct: false },
        { text: 'Rootkit', correct: false },
      ],
      explanation: 'Spyware operates covertly to gather sensitive data such as keystrokes and browsing habits.',
      difficulty: 'easy',
    },
    {
      type: 'multiple_choice',
      text: 'What distinguishes a worm from a virus?',
      options: [
        { text: 'A worm self-propagates without a host file', correct: true },
        { text: 'A worm always destroys data', correct: false },
        { text: 'A worm only affects email clients', correct: false },
        { text: 'There is no difference', correct: false },
      ],
      explanation: 'Worms replicate across networks on their own; viruses require a host file or program.',
      difficulty: 'medium',
    },
    {
      type: 'true_false',
      text: 'Ransomware typically encrypts a victim\u2019s files and demands payment for decryption.',
      options: [
        { text: 'True', correct: true },
        { text: 'False', correct: false },
      ],
      explanation: 'Modern ransomware encrypts data and extorts a payment, often via cryptocurrency.',
      difficulty: 'easy',
    },
  ],
  t_crypto: [
    {
      type: 'multiple_choice',
      text: 'Which algorithm is commonly used for hashing passwords securely?',
      options: [
        { text: 'bcrypt', correct: true },
        { text: 'AES', correct: false },
        { text: 'TLS', correct: false },
        { text: 'RSA', correct: false },
      ],
      explanation: 'bcrypt is a key-derivation hash designed to be slow, resisting brute-force attempts.',
      difficulty: 'easy',
    },
    {
      type: 'multiple_choice',
      text: 'In RSA, which key is used to encrypt a message intended for a specific recipient?',
      options: [
        { text: 'The recipient\u2019s public key', correct: true },
        { text: 'The recipient\u2019s private key', correct: false },
        { text: 'The sender\u2019s private key', correct: false },
        { text: 'A shared session key', correct: false },
      ],
      explanation: 'Anyone can encrypt with the public key, but only the private-key holder can decrypt.',
      difficulty: 'medium',
    },
  ],
  t_ns_cyber: [
    {
      type: 'multiple_choice',
      text: 'What does an IDS do?',
      options: [
        { text: 'Detects and alerts on suspicious network activity', correct: true },
        { text: 'Automatically blocks all suspicious traffic', correct: false },
        { text: 'Encrypts network traffic', correct: false },
        { text: 'Manages routing tables', correct: false },
      ],
      explanation: 'An intrusion detection system monitors and alerts; prevention is typically done by an IPS.',
      difficulty: 'easy',
    },
    {
      type: 'multiple_select',
      text: 'Which techniques are used to secure wireless networks? (Select all that apply)',
      options: [
        { text: 'WPA3 encryption', correct: true },
        { text: 'MAC address filtering', correct: true },
        { text: 'Broadcasting the SSID publicly', correct: false },
        { text: 'Disabling WPS', correct: true },
      ],
      explanation: 'WPA3, MAC filtering and disabling WPS reduce exposure; broadcasting the SSID helps attackers.',
      difficulty: 'medium',
    },
  ],
  t_websec: [
    {
      type: 'multiple_choice',
      text: 'Which attack occurs when untrusted data is rendered as executable JavaScript?',
      options: [
        { text: 'Cross-Site Scripting (XSS)', correct: true },
        { text: 'SQL injection', correct: false },
        { text: 'CSRF', correct: false },
        { text: 'Clickjacking', correct: false },
      ],
      explanation: 'XSS injects scripts that execute in another user\u2019s browser session.',
      difficulty: 'easy',
    },
    {
      type: 'multiple_choice',
      text: 'How does output encoding prevent XSS?',
      options: [
        { text: 'It treats user data as inert text rather than code', correct: true },
        { text: 'It blocks all JavaScript', correct: false },
        { text: 'It validates passwords', correct: false },
        { text: 'It encrypts the response body', correct: false },
      ],
      explanation: 'Encoding neutralizes characters that the browser would otherwise interpret as markup.',
      difficulty: 'medium',
    },
  ],
  t_osi: [
    {
      type: 'multiple_choice',
      text: 'Which layer of the OSI model provides end-to-end error recovery and flow control?',
      options: [
        { text: 'Transport Layer', correct: true },
        { text: 'Network Layer', correct: false },
        { text: 'Data Link Layer', correct: false },
        { text: 'Presentation Layer', correct: false },
      ],
      explanation: 'Layer 4 (Transport) manages segmentation, reliability and flow control.',
      difficulty: 'easy',
    },
    {
      type: 'true_false',
      text: 'MAC addresses are unique to each network interface and operate at the Data Link Layer.',
      options: [
        { text: 'True', correct: true },
        { text: 'False', correct: false },
      ],
      explanation: 'Layer-2 addressing uses MAC addresses burned into network interfaces.',
      difficulty: 'easy',
    },
  ],
  t_ip: [
    {
      type: 'multiple_choice',
      text: 'How many usable host addresses are in a /26 subnet?',
      options: [
        { text: '62', correct: true },
        { text: '64', correct: false },
        { text: '126', correct: false },
        { text: '30', correct: false },
      ],
      explanation: 'A /26 block has 64 addresses; 2 are reserved (network and broadcast), leaving 62.',
      difficulty: 'hard',
    },
    {
      type: 'fill_blank',
      text: 'The loopback IPv4 address is ________.',
      options: [],
      answer: ['127.0.0.1', '127.0.0.1/8'],
      explanation: '127.0.0.1 routes traffic back to the local machine.',
      difficulty: 'easy',
    },
  ],
  t_routing: [
    {
      type: 'multiple_choice',
      text: 'Which routing protocol uses hop count as its primary metric?',
      options: [
        { text: 'RIP', correct: true },
        { text: 'OSPF', correct: false },
        { text: 'BGP', correct: false },
        { text: 'EIGRP', correct: false },
      ],
      explanation: 'RIP (Routing Information Protocol) is distance-vector based on hop count.',
      difficulty: 'medium',
    },
  ],
  t_py: [
    {
      type: 'multiple_choice',
      text: 'Which Python data structure is ordered, changeable, and allows duplicate elements?',
      options: [
        { text: 'List', correct: true },
        { text: 'Set', correct: false },
        { text: 'Dictionary', correct: false },
        { text: 'Tuple', correct: false },
      ],
      explanation: 'Lists are mutable ordered sequences; sets forbid duplicates and tuples are immutable.',
      difficulty: 'easy',
    },
    {
      type: 'fill_blank',
      text: 'The keyword used to capture an exception in Python is ________.',
      options: [],
      answer: ['except', 'try/except'],
      explanation: 'Exceptions are handled with try/except blocks.',
      difficulty: 'easy',
    },
  ],
  t_cpp: [
    {
      type: 'multiple_choice',
      text: 'Which feature of C++ allows a function to be overloaded with different parameter types?',
      options: [
        { text: 'Function overloading', correct: true },
        { text: 'Inheritance', correct: false },
        { text: 'Encapsulation', correct: false },
        { text: 'Preprocessing', correct: false },
      ],
      explanation: 'Overloading lets multiple functions share a name with distinct signatures.',
      difficulty: 'medium',
    },
  ],
  t_alg: [
    {
      type: 'multiple_choice',
      text: 'Which algorithm sorts a list by repeatedly selecting the minimum element?',
      options: [
        { text: 'Selection sort', correct: true },
        { text: 'Merge sort', correct: false },
        { text: 'Quick sort', correct: false },
        { text: 'Insertion sort', correct: false },
      ],
      explanation: 'Selection sort finds the minimum and swaps it into place on each pass.',
      difficulty: 'easy',
    },
    {
      type: 'multiple_choice',
      text: 'What is the worst-case time complexity of merge sort?',
      options: [
        { text: 'O(n log n)', correct: true },
        { text: 'O(n²)', correct: false },
        { text: 'O(n)', correct: false },
        { text: 'O(log n)', correct: false },
      ],
      explanation: 'Merge sort always divides and merges in O(n log n).',
      difficulty: 'medium',
    },
  ],
  t_algebra: [
    {
      type: 'multiple_choice',
      text: 'What is the slope of the line y = 4x - 3?',
      options: [
        { text: '4', correct: true },
        { text: '-3', correct: false },
        { text: '3', correct: false },
        { text: '4/3', correct: false },
      ],
      explanation: 'In y = mx + b, m is the slope, so it is 4.',
      difficulty: 'easy',
    },
    {
      type: 'fill_blank',
      text: 'The solutions to x² - 5x + 6 = 0 are ________.',
      options: [],
      answer: ['2 and 3', '3 and 2'],
      explanation: 'Factor to (x-2)(x-3), so x = 2 or x = 3.',
      difficulty: 'medium',
    },
  ],
  t_calc: [
    {
      type: 'multiple_choice',
      text: 'What is the value of the integral of 2x from 0 to 1?',
      options: [
        { text: '1', correct: true },
        { text: '2', correct: false },
        { text: '0.5', correct: false },
        { text: '4', correct: false },
      ],
      explanation: '∫2x dx = x², evaluated from 0 to 1 gives 1.',
      difficulty: 'medium',
    },
  ],
  t_prob: [
    {
      type: 'multiple_choice',
      text: 'Two fair coins are flipped. What is the probability of exactly one head?',
      options: [
        { text: '1/2', correct: true },
        { text: '1/4', correct: false },
        { text: '1/3', correct: false },
        { text: '3/4', correct: false },
      ],
      explanation: 'HT and TH are the favorable outcomes out of four equally likely results.',
      difficulty: 'medium',
    },
  ],
  t_sql: [
    {
      type: 'multiple_choice',
      text: 'Which SQL statement adds a new row to a table?',
      options: [
        { text: 'INSERT INTO', correct: true },
        { text: 'UPDATE', correct: false },
        { text: 'ALTER', correct: false },
        { text: 'CREATE', correct: false },
      ],
      explanation: 'INSERT INTO adds rows; UPDATE modifies existing rows.',
      difficulty: 'easy',
    },
    {
      type: 'multiple_select',
      text: 'Which clauses can appear in a SELECT statement? (Select all that apply)',
      options: [
        { text: 'JOIN', correct: true },
        { text: 'HAVING', correct: true },
        { text: 'MERGE', correct: false },
        { text: 'LIMIT', correct: true },
      ],
      explanation: 'JOIN, HAVING and LIMIT are valid SELECT clauses; MERGE is not.',
      difficulty: 'medium',
    },
  ],
  t_design: [
    {
      type: 'multiple_choice',
      text: 'What is the purpose of database normalization?',
      options: [
        { text: 'To reduce redundancy and anomalies', correct: true },
        { text: 'To increase query speed always', correct: false },
        { text: 'To encrypt the data', correct: false },
        { text: 'To compress storage', correct: false },
      ],
      explanation: 'Normalization organizes schemas to minimize duplicate data and update anomalies.',
      difficulty: 'medium',
    },
    {
      type: 'true_false',
      text: 'A one-to-many relationship in an ER model is always represented with a foreign key on the "many" side.',
      options: [
        { text: 'True', correct: true },
        { text: 'False', correct: false },
      ],
      explanation: 'The child (many) table holds the foreign key referencing the parent (one) table.',
      difficulty: 'easy',
    },
  ],
};

function genericTemplate(_topicId: string, topic: string, subject: string): MockTemplate {
  const pick = Math.floor(Math.random() * 3);
  if (pick === 0) {
    return {
      type: 'multiple_choice',
      text: `Which statement about "${topic}" is correct?`,
      options: [
        { text: `${topic} is primarily concerned with foundational concepts taught at an introductory level`, correct: true },
        { text: `${topic} only applies to legacy systems`, correct: false },
        { text: `${topic} cannot be practiced or measured`, correct: false },
        { text: `${topic} is unrelated to ${subject}`, correct: false },
      ],
      explanation: `The other options are incorrect; ${topic} is a core part of ${subject}.`,
      difficulty: 'easy',
    };
  }
  if (pick === 1) {
    return {
      type: 'true_false',
      text: `Understanding "${topic}" requires applying concepts rather than only memorizing definitions.`,
      options: [
        { text: 'True', correct: true },
        { text: 'False', correct: false },
      ],
      explanation: `Applied questions in ${subject} test practical understanding of ${topic}.`,
      difficulty: 'medium',
    };
  }
  return {
    type: 'fill_blank',
    text: `A key term covered when studying "${topic}" is ________.`,
    options: [],
    answer: ['concepts'],
    explanation: `Mastery of ${topic} in ${subject} comes from practice with its core concepts.`,
    difficulty: 'medium',
  };
}

function buildQuestion(template: MockTemplate, config: AiGenerationConfig): Question {
  const options = (template.options ?? []).map((o) => ({ id: uid('opt'), text: o.text }));
  const correct = template.options
    ? template.options
        .map((o, i) => ({ text: o.text, correct: o.correct, id: options[i].id }))
        .filter((o) => o.correct)
        .map((o) => o.id)
    : (template.answer ?? []);

  return {
    id: uid('q'),
    type: template.type,
    text: template.text,
    options,
    correctAnswer: correct,
    explanation: template.explanation,
    subjectId: config.subjectId,
    topicId: config.topicId,
    difficulty: template.difficulty,
    tags: [topicName(config.topicId), 'generated'],
    points: template.type === 'essay' ? 20 : template.type === 'multiple_select' ? 10 : 5,
    estimatedSeconds: template.type === 'essay' ? 600 : 60,
    author: 'AI Studio (demo)',
    status: 'draft',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    usageCount: 0,
  };
}

export function generateMockQuestions(config: AiGenerationConfig): Question[] {
  const templates = TOPIC_TEMPLATES[config.topicId] ?? [];
  const pool: MockTemplate[] = [];

  // Prefer topic-specific templates; backfill with generic ones.
  for (let i = 0; i < config.count; i++) {
    const specific = templates[i % templates.length];
    if (specific) {
      pool.push(specific);
    } else {
      pool.push(genericTemplate(config.topicId, topicName(config.topicId), subjectName(config.subjectId)));
    }
  }

  return pool.map((t) => buildQuestion(t, config));
}