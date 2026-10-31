export interface PresetLifeArea {
  slug: string;
  // English literal text, used only as the Firestore seed value / fallback.
  // The real, locale-aware label is rendered client-side from `slug`.
  name: string;
  subItems: string[];
}

export const PRESET_LIFE_AREAS: PresetLifeArea[] = [
  {
    slug: 'lifestyle-daily-life',
    name: 'Lifestyle & Daily Life',
    subItems: [
      'Home Environment',
      'Life Organization',
      'Time Management',
      'Personal Projects',
      'Digital Life / Digital Organization',
      'Hobbies & Recreation',
    ],
  },
  {
    slug: 'contribution-impact',
    name: 'Contribution & Impact',
    subItems: [
      'Volunteering',
      'Community Service',
      'Mentoring',
      'Donations / Philanthropy',
      'Environmental Impact',
    ],
  },
  {
    slug: 'environment-surroundings',
    name: 'Environment & Surroundings',
    subItems: [
      'Home Cleanliness',
      'Workspace Organization',
      'Safety',
      'Neighborhood & Community Environment',
    ],
  },
  {
    slug: 'love-intimacy',
    name: 'Love & Intimacy',
    subItems: [
      'Intimacy',
      'Emotional Connection',
      'Sexuality',
      'Partnership Growth',
    ],
  },
  {
    slug: 'productivity-performance',
    name: 'Productivity & Performance',
    subItems: [
      'Planning',
      'Execution',
      'Focus',
      'Energy Management',
      'Systems & Tools',
    ],
  },
  {
    slug: 'fun-leisure',
    name: 'Fun & Leisure',
    subItems: [
      'Entertainment',
      'Travel',
      'Adventure',
      'Passions',
      'Play / Relaxation',
    ],
  },
  {
    slug: 'finances',
    name: 'Finances',
    subItems: [
      'Income',
      'Savings',
      'Budgeting',
      'Investing',
      'Debt Management',
      'Financial Planning',
      'Emergency Fund',
      'Assets & Net Worth',
    ],
  },
  {
    slug: 'career-work',
    name: 'Career & Work',
    subItems: [
      'Professional Growth',
      'Job Performance',
      'Career Planning',
      'Leadership',
      'Networking',
      'Work Satisfaction',
      'Work-Life Balance',
    ],
  },
  {
    slug: 'health-wellbeing',
    name: 'Health & Well-Being',
    subItems: [
      'Physical Health',
      'Mental Health',
      'Emotional Health',
      'Nutrition',
      'Fitness & Exercise',
      'Sleep',
      'Stress Management',
      'Preventive Care',
    ],
  },
  {
    slug: 'personal-growth',
    name: 'Personal Growth',
    subItems: [
      'Learning & Education',
      'Skills Development',
      'Mindset & Attitude',
      'Self-Awareness',
      'Creativity',
      'Discipline & Habits',
      'Spirituality / Inner Life',
    ],
  },
  {
    slug: 'relationships',
    name: 'Relationships',
    subItems: [
      'Family',
      'Romantic Relationship / Marriage',
      'Friends',
      'Social Life',
      'Community',
      'Networking / Professional Relationships',
    ],
  },
  {
    slug: 'spirituality-meaning',
    name: 'Spirituality & Meaning',
    subItems: [
      'Purpose',
      'Values',
      'Meditation / Prayer',
      'Connection with something greater',
      'Inner peace',
    ],
  },
];
