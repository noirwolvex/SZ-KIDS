import {
  Type, Hash, Calculator, FlaskConical, Palette, Shapes, Dog, Globe,
  Brain, Lightbulb, Puzzle, Grid3x3, Music, BookOpen, Rocket, Code, Keyboard,
  Sigma, Divide, Percent, Zap, Languages, MessageCircle,
  Bone, Crown, Car, Leaf,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type AgeGroup = '3-6' | '7-11' | '12+';

export type GameType =
  | 'memory' | 'quiz' | 'coloring' | 'puzzle' | 'story' | 'space' | 'number'
  | 'word' | 'music' | 'math' | 'science' | 'geography' | 'counting' | 'alphabet'
  | 'phonics' | 'reading' | 'spelling' | 'patterns' | 'colors' | 'shapes'
  | 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions'
  | 'logic' | 'coding' | 'typing' | 'vocabulary' | 'storytelling' | 'critical-thinking'
  | 'reaction' | 'matching' | 'drawing' | 'sorting';

export type Game = {
  id: string;
  title: string;
  category: string;
  ageGroup: AgeGroup;
  ageRange: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  icon: LucideIcon;
  color: string;
  bg: string;
  description: string;
  type: GameType;
  emoji: string;
  accent: string;
  skills: string[];
  estTime: string;
  isNew?: boolean;
  isTrending?: boolean;
};

export type AgeGroupInfo = {
  id: AgeGroup;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  mascot: string;
  gradient: string;
  bg: string;
  accent: string;
  skills: string[];
};

export const ageGroups: AgeGroupInfo[] = [
  {
    id: '3-6',
    label: 'Ages 3–6',
    title: 'Little Explorers',
    subtitle: 'First steps into learning',
    description: 'Gentle, colorful games that build foundational skills through play. Perfect for preschoolers and kindergartners discovering letters, numbers, colors, and shapes.',
    emoji: '🌈',
    mascot: '🦊',
    gradient: 'from-blush-200 via-peach-200 to-lemon-200',
    bg: 'bg-blush-50',
    accent: '#ff7fbf',
    skills: ['Letters', 'Counting', 'Colors', 'Shapes', 'Matching', 'Memory'],
  },
  {
    id: '7-11',
    label: 'Ages 7–11',
    title: 'Curious Adventurers',
    subtitle: 'Growing minds, growing skills',
    description: 'Exciting challenges that stretch reading, math, science, and problem-solving abilities. Designed for elementary students ready to explore deeper concepts.',
    emoji: '🚀',
    mascot: '🦉',
    gradient: 'from-sky-200 via-lavender-200 to-mint-200',
    bg: 'bg-sky-50',
    accent: '#38bdf8',
    skills: ['Math', 'Reading', 'Science', 'Geography', 'Logic', 'Coding'],
  },
  {
    id: '12+',
    label: 'Ages 12+',
    title: 'Brain Champions',
    subtitle: 'Master the challenge',
    description: 'Advanced puzzles, strategy, and critical thinking for tweens and teens. Complex problems that reward persistence, creativity, and analytical thinking.',
    emoji: '🧠',
    mascot: '🦅',
    gradient: 'from-lavender-200 via-sky-200 to-mint-200',
    bg: 'bg-lavender-50',
    accent: '#9d7ce6',
    skills: ['Strategy', 'Critical Thinking', 'Advanced Math', 'Coding', 'Logic', 'Science'],
  },
];

export const categories: { id: string; label: string; icon: LucideIcon; color: string; bg: string }[] = [
  { id: 'alphabet', label: 'Alphabet', icon: Type, color: 'text-sky-500', bg: 'bg-sky-100' },
  { id: 'numbers', label: 'Numbers', icon: Hash, color: 'text-blush-500', bg: 'bg-blush-100' },
  { id: 'math', label: 'Math', icon: Calculator, color: 'text-mint-500', bg: 'bg-mint-100' },
  { id: 'science', label: 'Science', icon: FlaskConical, color: 'text-lemon-500', bg: 'bg-lemon-100' },
  { id: 'colors', label: 'Colors', icon: Palette, color: 'text-peach-500', bg: 'bg-peach-100' },
  { id: 'shapes', label: 'Shapes', icon: Shapes, color: 'text-lavender-500', bg: 'bg-lavender-100' },
  { id: 'animals', label: 'Animals', icon: Dog, color: 'text-mint-500', bg: 'bg-mint-100' },
  { id: 'geography', label: 'Geography', icon: Globe, color: 'text-sky-500', bg: 'bg-sky-100' },
  { id: 'memory', label: 'Memory', icon: Brain, color: 'text-blush-500', bg: 'bg-blush-100' },
  { id: 'logic', label: 'Logic', icon: Lightbulb, color: 'text-lemon-500', bg: 'bg-lemon-100' },
  { id: 'puzzles', label: 'Puzzles', icon: Puzzle, color: 'text-lavender-500', bg: 'bg-lavender-100' },
  { id: 'music', label: 'Music', icon: Music, color: 'text-peach-500', bg: 'bg-peach-100' },
  { id: 'stories', label: 'Stories', icon: BookOpen, color: 'text-sky-500', bg: 'bg-sky-100' },
  { id: 'space', label: 'Space', icon: Rocket, color: 'text-lavender-500', bg: 'bg-lavender-100' },
  { id: 'coding', label: 'Coding', icon: Code, color: 'text-mint-500', bg: 'bg-mint-100' },
  { id: 'typing', label: 'Typing', icon: Keyboard, color: 'text-sky-500', bg: 'bg-sky-100' },
];

// ─── AGES 3-6 GAMES ───
const games3to6: Game[] = [
  {
    id: 'memory-match', title: 'Memory Match', category: 'Memory', ageGroup: '3-6', ageRange: '3-6', difficulty: 'Easy',
    icon: Brain, color: 'text-blush-500', bg: 'from-blush-200 to-blush-300',
    description: 'Flip cards and find the matching pairs!', type: 'memory',
    emoji: '🧠', accent: '#ff7fbf', skills: ['Memory', 'Focus', 'Visual Recognition'], estTime: '3 min',
  },
  {
    id: 'rainbow-color', title: 'Rainbow Coloring', category: 'Colors', ageGroup: '3-6', ageRange: '3-8', difficulty: 'Easy',
    icon: Palette, color: 'text-peach-500', bg: 'from-peach-200 to-blush-200',
    description: 'Bring drawings to life with magic colors!', type: 'coloring',
    emoji: '🎨', accent: '#ff8f63', skills: ['Creativity', 'Color Recognition', 'Fine Motor'], estTime: '5 min',
  },
  {
    id: 'shape-puzzle', title: 'Shape Puzzle', category: 'Shapes', ageGroup: '3-6', ageRange: '3-7', difficulty: 'Easy',
    icon: Puzzle, color: 'text-lavender-500', bg: 'from-lavender-200 to-sky-200',
    description: 'Drag shapes to their perfect spots!', type: 'puzzle',
    emoji: '🧩', accent: '#9d7ce6', skills: ['Shape Recognition', 'Spatial Awareness', 'Matching'], estTime: '3 min',
  },
  {
    id: 'animal-safari', title: 'Animal Safari', category: 'Animals', ageGroup: '3-6', ageRange: '4-9', difficulty: 'Easy',
    icon: Dog, color: 'text-mint-500', bg: 'from-mint-200 to-lemon-200',
    description: 'Meet animals from around the world!', type: 'story',
    emoji: '🦁', accent: '#34c187', skills: ['Animal Knowledge', 'Listening', 'Vocabulary'], estTime: '4 min',
  },
  {
    id: 'number-hunt', title: 'Number Hunt', category: 'Numbers', ageGroup: '3-6', ageRange: '3-6', difficulty: 'Easy',
    icon: Hash, color: 'text-blush-500', bg: 'from-blush-200 to-lavender-200',
    description: 'Count and collect the hidden numbers!', type: 'number',
    emoji: '🔢', accent: '#ff7fbf', skills: ['Counting', 'Number Recognition', 'Focus'], estTime: '3 min',
  },
  {
    id: 'music-maker', title: 'Music Maker', category: 'Music', ageGroup: '3-6', ageRange: '3-10', difficulty: 'Easy',
    icon: Music, color: 'text-peach-500', bg: 'from-peach-200 to-lemon-200',
    description: 'Create happy tunes with friendly notes!', type: 'music',
    emoji: '🎵', accent: '#ff8f63', skills: ['Music', 'Memory', 'Listening'], estTime: '4 min',
  },
  {
    id: 'color-match', title: 'Color Match', category: 'Colors', ageGroup: '3-6', ageRange: '3-6', difficulty: 'Easy',
    icon: Palette, color: 'text-peach-500', bg: 'from-peach-200 to-lemon-200',
    description: 'Match colors to their names and objects!', type: 'colors',
    emoji: '🎨', accent: '#ff8f63', skills: ['Color Recognition', 'Matching', 'Vocabulary'], estTime: '3 min',
    isNew: true,
  },
  {
    id: 'counting-friends', title: 'Counting Friends', category: 'Numbers', ageGroup: '3-6', ageRange: '3-5', difficulty: 'Easy',
    icon: Hash, color: 'text-blush-500', bg: 'from-blush-200 to-peach-200',
    description: 'Count cute animals and learn numbers 1 to 10!', type: 'counting',
    emoji: '🐱', accent: '#ff7fbf', skills: ['Counting', 'Number Recognition', 'One-to-One Correspondence'], estTime: '4 min',
    isNew: true,
  },
  {
    id: 'alphabet-trace', title: 'Alphabet Trace', category: 'Alphabet', ageGroup: '3-6', ageRange: '3-6', difficulty: 'Easy',
    icon: Type, color: 'text-sky-500', bg: 'from-sky-200 to-lavender-200',
    description: 'Trace letters and learn the alphabet!', type: 'alphabet',
    emoji: '✏️', accent: '#38bdf8', skills: ['Letter Recognition', 'Fine Motor', 'Alphabet Order'], estTime: '5 min',
    isNew: true,
  },
  {
    id: 'pattern-party', title: 'Pattern Party', category: 'Logic', ageGroup: '3-6', ageRange: '4-6', difficulty: 'Easy',
    icon: Grid3x3, color: 'text-lemon-500', bg: 'from-lemon-200 to-mint-200',
    description: 'Find the next shape in the pattern!', type: 'patterns',
    emoji: '🔵', accent: '#ffd24d', skills: ['Pattern Recognition', 'Logic', 'Sequencing'], estTime: '3 min',
    isNew: true,
  },
  {
    id: 'shape-sorter', title: 'Shape Sorter', category: 'Shapes', ageGroup: '3-6', ageRange: '3-5', difficulty: 'Easy',
    icon: Shapes, color: 'text-lavender-500', bg: 'from-lavender-200 to-blush-200',
    description: 'Sort shapes into the right baskets!', type: 'sorting',
    emoji: '🔷', accent: '#9d7ce6', skills: ['Shape Recognition', 'Sorting', 'Categorization'], estTime: '3 min',
    isNew: true,
  },
  {
    id: 'story-builder', title: 'Story Builder', category: 'Stories', ageGroup: '3-6', ageRange: '4-7', difficulty: 'Easy',
    icon: BookOpen, color: 'text-sky-500', bg: 'from-sky-200 to-mint-200',
    description: 'Build silly stories by choosing words!', type: 'storytelling',
    emoji: '📖', accent: '#38bdf8', skills: ['Storytelling', 'Vocabulary', 'Creativity'], estTime: '4 min',
    isNew: true,
  },
];

// ─── AGES 7-11 GAMES ───
const games7to11: Game[] = [
  {
    id: 'brain-quiz', title: 'Brain Quiz', category: 'Logic', ageGroup: '7-11', ageRange: '6-10', difficulty: 'Medium',
    icon: Lightbulb, color: 'text-lemon-500', bg: 'from-lemon-200 to-peach-200',
    description: 'Test your knowledge with fun questions!', type: 'quiz',
    emoji: '💡', accent: '#ffd24d', skills: ['General Knowledge', 'Critical Thinking', 'Recall'], estTime: '5 min',
  },
  {
    id: 'space-explorer', title: 'Space Explorer', category: 'Space', ageGroup: '7-11', ageRange: '6-12', difficulty: 'Hard',
    icon: Rocket, color: 'text-lavender-500', bg: 'from-lavender-200 to-sky-300',
    description: 'Blast off and discover the planets!', type: 'space',
    emoji: '🚀', accent: '#9d7ce6', skills: ['Space Science', 'Sequencing', 'Memory'], estTime: '6 min',
  },
  {
    id: 'word-wizard', title: 'Word Wizard', category: 'Spelling', ageGroup: '7-11', ageRange: '5-10', difficulty: 'Medium',
    icon: Type, color: 'text-sky-500', bg: 'from-sky-200 to-mint-200',
    description: 'Spell your way to magical victories!', type: 'spelling',
    emoji: '🔤', accent: '#38bdf8', skills: ['Spelling', 'Vocabulary', 'Phonics'], estTime: '4 min',
  },
  {
    id: 'math-marathon', title: 'Math Marathon', category: 'Math', ageGroup: '7-11', ageRange: '6-12', difficulty: 'Hard',
    icon: Calculator, color: 'text-mint-500', bg: 'from-mint-200 to-sky-200',
    description: 'Race against time with math problems!', type: 'math',
    emoji: '➕', accent: '#34c187', skills: ['Addition', 'Subtraction', 'Multiplication'], estTime: '5 min',
  },
  {
    id: 'science-lab', title: 'Science Lab', category: 'Science', ageGroup: '7-11', ageRange: '7-12', difficulty: 'Hard',
    icon: FlaskConical, color: 'text-lemon-500', bg: 'from-lemon-200 to-mint-200',
    description: 'Mix, pour, and discover amazing reactions!', type: 'science',
    emoji: '🧪', accent: '#ffd24d', skills: ['Chemistry', 'Color Theory', 'Experimentation'], estTime: '5 min',
  },
  {
    id: 'globe-trotter', title: 'Globe Trotter', category: 'Geography', ageGroup: '7-11', ageRange: '6-12', difficulty: 'Medium',
    icon: Globe, color: 'text-sky-500', bg: 'from-sky-200 to-mint-200',
    description: 'Travel the world and learn countries!', type: 'geography',
    emoji: '🌍', accent: '#38bdf8', skills: ['Geography', 'Cultural Awareness', 'Memory'], estTime: '5 min',
  },
  {
    id: 'multiply-quest', title: 'Multiply Quest', category: 'Math', ageGroup: '7-11', ageRange: '7-11', difficulty: 'Medium',
    icon: Sigma, color: 'text-mint-500', bg: 'from-mint-200 to-lemon-200',
    description: 'Master multiplication tables on an epic adventure!', type: 'multiplication',
    emoji: '✖️', accent: '#34c187', skills: ['Multiplication', 'Mental Math', 'Speed'], estTime: '5 min',
    isNew: true, isTrending: true,
  },
  {
    id: 'fraction-pizza', title: 'Fraction Pizza', category: 'Math', ageGroup: '7-11', ageRange: '7-11', difficulty: 'Medium',
    icon: Percent, color: 'text-peach-500', bg: 'from-peach-200 to-blush-200',
    description: 'Slice pizzas and learn fractions the tasty way!', type: 'fractions',
    emoji: '🍕', accent: '#ff8f63', skills: ['Fractions', 'Visual Math', 'Problem Solving'], estTime: '5 min',
    isNew: true,
  },
  {
    id: 'coding-maze', title: 'Coding Maze', category: 'Coding', ageGroup: '7-11', ageRange: '7-11', difficulty: 'Medium',
    icon: Code, color: 'text-mint-500', bg: 'from-mint-200 to-sky-200',
    description: 'Guide a robot through mazes with code commands!', type: 'coding',
    emoji: '🤖', accent: '#34c187', skills: ['Computational Thinking', 'Sequencing', 'Problem Solving'], estTime: '6 min',
    isNew: true, isTrending: true,
  },
  {
    id: 'typing-race', title: 'Typing Race', category: 'Typing', ageGroup: '7-11', ageRange: '7-11', difficulty: 'Medium',
    icon: Keyboard, color: 'text-sky-500', bg: 'from-sky-200 to-lavender-200',
    description: 'Type words fast and beat the clock!', type: 'typing',
    emoji: '⌨️', accent: '#38bdf8', skills: ['Typing', 'Spelling', 'Speed'], estTime: '3 min',
    isNew: true,
  },
  {
    id: 'vocab-match', title: 'Vocabulary Match', category: 'Logic', ageGroup: '7-11', ageRange: '7-11', difficulty: 'Medium',
    icon: Languages, color: 'text-lavender-500', bg: 'from-lavender-200 to-sky-200',
    description: 'Match words to their meanings and learn new words!', type: 'vocabulary',
    emoji: '📚', accent: '#9d7ce6', skills: ['Vocabulary', 'Reading', 'Comprehension'], estTime: '4 min',
    isNew: true,
  },
  {
    id: 'reaction-rush', title: 'Reaction Rush', category: 'Logic', ageGroup: '7-11', ageRange: '6-11', difficulty: 'Medium',
    icon: Zap, color: 'text-lemon-500', bg: 'from-lemon-200 to-peach-200',
    description: 'Tap fast and test your reflexes!', type: 'reaction',
    emoji: '⚡', accent: '#ffd24d', skills: ['Reaction Speed', 'Focus', 'Hand-Eye Coordination'], estTime: '2 min',
    isNew: true, isTrending: true,
  },
];

// ─── AGES 12+ GAMES ───
const games12plus: Game[] = [
  {
    id: 'logic-grid', title: 'Logic Grid Puzzles', category: 'Logic', ageGroup: '12+', ageRange: '12+', difficulty: 'Hard',
    icon: Grid3x3, color: 'text-lavender-500', bg: 'from-lavender-200 to-sky-300',
    description: 'Use deduction to solve mind-bending logic puzzles!', type: 'critical-thinking',
    emoji: '🧩', accent: '#9d7ce6', skills: ['Deductive Reasoning', 'Critical Thinking', 'Logic'], estTime: '8 min',
    isNew: true, isTrending: true,
  },
  {
    id: 'divide-master', title: 'Division Master', category: 'Math', ageGroup: '12+', ageRange: '10+', difficulty: 'Hard',
    icon: Divide, color: 'text-mint-500', bg: 'from-mint-200 to-sky-200',
    description: 'Conquer long division and remainders!', type: 'division',
    emoji: '➗', accent: '#34c187', skills: ['Division', 'Mental Math', 'Problem Solving'], estTime: '5 min',
    isNew: true,
  },
  {
    id: 'word-chain', title: 'Word Chain Battle', category: 'Logic', ageGroup: '12+', ageRange: '12+', difficulty: 'Hard',
    icon: MessageCircle, color: 'text-sky-500', bg: 'from-sky-200 to-lavender-200',
    description: 'Build word chains and expand your vocabulary!', type: 'vocabulary',
    emoji: '💬', accent: '#38bdf8', skills: ['Vocabulary', 'Spelling', 'Quick Thinking'], estTime: '4 min',
    isNew: true,
  },
];

export const games: Game[] = [...games3to6, ...games7to11, ...games12plus];

export function gamesByAge(age: AgeGroup): Game[] {
  return games.filter((g) => g.ageGroup === age);
}

export function getGameById(id: string): Game | undefined {
  return games.find((g) => g.id === id);
}

export const puzzleThemes = [
  { id: 'animals', label: 'Animals', icon: Dog, color: 'bg-mint-200', text: 'text-mint-500' },
  { id: 'dinosaurs', label: 'Dinosaurs', icon: Bone, color: 'bg-lemon-200', text: 'text-lemon-500' },
  { id: 'space', label: 'Space', icon: Rocket, color: 'bg-lavender-200', text: 'text-lavender-500' },
  { id: 'princesses', label: 'Princesses', icon: Crown, color: 'bg-blush-200', text: 'text-blush-500' },
  { id: 'cars', label: 'Cars', icon: Car, color: 'bg-sky-200', text: 'text-sky-500' },
  { id: 'nature', label: 'Nature', icon: Leaf, color: 'bg-mint-200', text: 'text-mint-500' },
];
