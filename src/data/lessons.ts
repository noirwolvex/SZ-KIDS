import {
  Type, BookOpen, Calculator, FlaskConical, Leaf, Globe, Palette,
  Lightbulb, Code, Sparkles, Hash, Languages, Music, Rocket,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AgeGroup } from './content';

// ─── Types ───

export type LessonStepType =
  | 'intro' | 'explanation' | 'example' | 'quiz'
  | 'matching' | 'sorting' | 'story' | 'sequence' | 'truefalse';

export type LessonStep =
  | { type: 'intro'; title: string; content: string; emoji: string }
  | { type: 'explanation'; title: string; content: string; visual: string; tip?: string }
  | { type: 'example'; title: string; content: string; items: { emoji: string; label: string; description: string }[] }
  | { type: 'quiz'; question: string; options: string[]; correct: number; explanation: string; hint?: string }
  | { type: 'matching'; question: string; pairs: { left: string; right: string }[] }
  | { type: 'sorting'; question: string; items: { emoji: string; label: string; category: string }[]; categories: { id: string; label: string; emoji: string }[] }
  | { type: 'story'; title: string; content: string; emoji: string; question: string; options: string[]; correct: number; explanation: string }
  | { type: 'sequence'; question: string; items: { emoji: string; label: string }[]; correctOrder: number[] }
  | { type: 'truefalse'; question: string; answer: boolean; explanation: string; hint?: string };

export type Lesson = {
  id: string;
  title: string;
  categoryId: string;
  ageGroup: AgeGroup;
  description: string;
  objectives: string[];
  steps: LessonStep[];
  xpReward: number;
  estTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  icon: LucideIcon;
  emoji: string;
  skills: string[];
  prerequisites: string[];
};

export type LessonCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  emoji: string;
  gradient: string;
  bg: string;
  color: string;
  description: string;
};

// ─── Categories (Worlds) ───

export const lessonCategories: LessonCategory[] = [
  { id: 'language', label: 'Language', icon: Type, emoji: '🔤', gradient: 'from-sky-200 to-sky-300', bg: 'bg-sky-50', color: 'text-sky-500', description: 'Letters, sounds, and words' },
  { id: 'reading', label: 'Reading', icon: BookOpen, emoji: '📖', gradient: 'from-blush-200 to-blush-300', bg: 'bg-blush-50', color: 'text-blush-500', description: 'Stories and comprehension' },
  { id: 'math', label: 'Mathematics', icon: Calculator, emoji: '🔢', gradient: 'from-mint-200 to-mint-300', bg: 'bg-mint-50', color: 'text-mint-500', description: 'Numbers and problem solving' },
  { id: 'science', label: 'Science', icon: FlaskConical, emoji: '🧪', gradient: 'from-lemon-200 to-lemon-300', bg: 'bg-lemon-50', color: 'text-lemon-500', description: 'Experiments and discovery' },
  { id: 'nature', label: 'Nature', icon: Leaf, emoji: '🌿', gradient: 'from-mint-200 to-lemon-200', bg: 'bg-mint-50', color: 'text-mint-500', description: 'Plants, animals, and earth' },
  { id: 'geography', label: 'Geography', icon: Globe, emoji: '🌍', gradient: 'from-sky-200 to-mint-200', bg: 'bg-sky-50', color: 'text-sky-500', description: 'Countries and cultures' },
  { id: 'creativity', label: 'Creativity', icon: Palette, emoji: '🎨', gradient: 'from-peach-200 to-blush-200', bg: 'bg-peach-50', color: 'text-peach-500', description: 'Art and imagination' },
  { id: 'logic', label: 'Logic', icon: Lightbulb, emoji: '💡', gradient: 'from-lemon-200 to-peach-200', bg: 'bg-lemon-50', color: 'text-lemon-500', description: 'Patterns and reasoning' },
  { id: 'coding', label: 'Coding Basics', icon: Code, emoji: '🤖', gradient: 'from-mint-200 to-sky-200', bg: 'bg-mint-50', color: 'text-mint-500', description: 'Sequences and algorithms' },
  { id: 'knowledge', label: 'General Knowledge', icon: Sparkles, emoji: '⭐', gradient: 'from-lavender-200 to-sky-200', bg: 'bg-lavender-50', color: 'text-lavender-500', description: 'Facts and wonders' },
];

export function getCategoryById(id: string): LessonCategory | undefined {
  return lessonCategories.find((c) => c.id === id);
}

// ─── Lessons ───

const lessons: Lesson[] = [
  // ═══════════ AGES 3-6 ═══════════

  {
    id: 'lang-letters-3', title: 'Meet the Alphabet', categoryId: 'language', ageGroup: '3-6', difficulty: 'Easy',
    description: 'Discover all 26 letters from A to Z!', icon: Type, emoji: '🔤',
    xpReward: 50, estTime: '5 min', skills: ['Letter Recognition', 'Alphabet Order'], prerequisites: [],
    objectives: ['Recognize uppercase letters', 'Learn letter names', 'Match letters to pictures'],
    steps: [
      { type: 'intro', emoji: '🔤', title: 'The Alphabet Adventure', content: 'There are 26 letters in the alphabet. Each letter has a name and a sound. Let\'s meet them all!' },
      { type: 'explanation', title: 'A, B, C', content: 'The first three letters are A, B, and C. A says "ah," B says "buh," and C says "kuh."', visual: 'Aa Bb Cc', tip: 'Sing the ABC song to remember the order!' },
      { type: 'example', title: 'Letters All Around', content: 'Letters are everywhere! Each letter starts many words.', items: [
        { emoji: '🍎', label: 'A', description: 'Apple starts with A' },
        { emoji: '🐻', label: 'B', description: 'Bear starts with B' },
        { emoji: '🐱', label: 'C', description: 'Cat starts with C' },
        { emoji: '🐶', label: 'D', description: 'Dog starts with D' },
      ]},
      { type: 'quiz', question: 'Which letter does "Fish" start with?', options: ['A', 'F', 'Z', 'M'], correct: 1, explanation: 'Fish starts with the letter F!', hint: 'Listen to the first sound: fff-ish' },
      { type: 'matching', question: 'Match each letter to its picture!', pairs: [
        { left: 'A', right: '🍎' }, { left: 'B', right: '🐻' }, { left: 'C', right: '🐱' },
      ]},
      { type: 'quiz', question: 'How many letters are in the alphabet?', options: ['10', '20', '26', '100'], correct: 2, explanation: 'There are exactly 26 letters from A to Z!' },
    ],
  },
  {
    id: 'lang-sounds-3', title: 'Letter Sounds', categoryId: 'language', ageGroup: '3-6', difficulty: 'Easy',
    description: 'Learn the sounds each letter makes!', icon: Type, emoji: '🔊',
    xpReward: 60, estTime: '5 min', skills: ['Phonics', 'Sound Recognition'], prerequisites: ['lang-letters-3'],
    objectives: ['Connect letters to their sounds', 'Identify beginning sounds of words'],
    steps: [
      { type: 'intro', emoji: '🔊', title: 'Sounds Are Everywhere', content: 'Every letter makes a special sound. When we put sounds together, we make words!' },
      { type: 'explanation', title: 'Sound It Out', content: 'When we read, we say the sound of each letter. M says "mmm," S says "sss," and R says "rrr."', visual: 'Mm Ss Rr' },
      { type: 'example', title: 'Beginning Sounds', content: 'Listen to the first sound of each word:', items: [
        { emoji: '🌙', label: 'M', description: 'Moon starts with "mmm"' },
        { emoji: '☀️', label: 'S', description: 'Sun starts with "sss"' },
        { emoji: '🌈', label: 'R', description: 'Rainbow starts with "rrr"' },
      ]},
      { type: 'truefalse', question: 'The letter S makes a "sss" sound like a snake.', answer: true, explanation: 'Yes! S says "sss" — just like a snake hissing.' },
      { type: 'quiz', question: 'What sound does "B" make?', options: ['sss', 'buh', 'kuh', 'mmm'], correct: 1, explanation: 'B says "buh" like in Bear and Ball!' },
      { type: 'quiz', question: 'Which word starts with the "sss" sound?', options: ['Moon', 'Sun', 'Bear', 'Dog'], correct: 1, explanation: 'Sun starts with S, which says "sss!"' },
    ],
  },
  {
    id: 'read-story-3', title: 'My First Story', categoryId: 'reading', ageGroup: '3-6', difficulty: 'Easy',
    description: 'Read a simple story and answer questions!', icon: BookOpen, emoji: '📖',
    xpReward: 70, estTime: '6 min', skills: ['Reading Comprehension', 'Story Sequencing'], prerequisites: [],
    objectives: ['Follow a simple story', 'Answer questions about what happened'],
    steps: [
      { type: 'intro', emoji: '📖', title: 'Once Upon a Time', content: 'Stories have a beginning, a middle, and an end. Let\'s read a short story together!' },
      { type: 'story', title: 'The Lost Kitten', emoji: '🐱', content: 'A little kitten named Mittens was playing in the garden. She saw a butterfly and chased it. Soon, Mittens was far from home. She felt scared. But then she heard her owner calling, "Mittens, Mittens!" Mittens followed the voice home and was safe again.', question: 'Why did Mittens get lost?', options: ['She ran too fast', 'She chased a butterfly', 'She fell asleep', 'She hid under a bush'], correct: 1, explanation: 'Mittens chased a butterfly and wandered far from home.' },
      { type: 'quiz', question: 'How did Mittens feel when she was far from home?', options: ['Happy', 'Scared', 'Angry', 'Sleepy'], correct: 1, explanation: 'The story says Mittens felt scared when she was far from home.' },
      { type: 'quiz', question: 'How did Mittens find her way home?', options: ['She followed a map', 'She asked a bird', 'She heard her owner calling', 'She smelled food'], correct: 2, explanation: 'Mittens heard her owner calling her name and followed the voice.' },
      { type: 'sequence', question: 'Put the story events in order!', items: [
        { emoji: '🐱', label: 'Mittens plays in garden' },
        { emoji: '🦋', label: 'She chases a butterfly' },
        { emoji: '😨', label: 'She gets lost and scared' },
        { emoji: '🏠', label: 'She hears her owner and goes home' },
      ], correctOrder: [0, 1, 2, 3] },
    ],
  },
  {
    id: 'math-count-3', title: 'Counting 1 to 10', categoryId: 'math', ageGroup: '3-6', difficulty: 'Easy',
    description: 'Learn to count from 1 to 10 with friends!', icon: Hash, emoji: '🔢',
    xpReward: 50, estTime: '5 min', skills: ['Counting', 'Number Recognition'], prerequisites: [],
    objectives: ['Count objects from 1 to 10', 'Recognize numerals 1-10'],
    steps: [
      { type: 'intro', emoji: '🔢', title: 'Let\'s Count Together', content: 'Counting helps us know how many things there are. Let\'s learn numbers 1 through 10!' },
      { type: 'explanation', title: 'Numbers 1-5', content: 'One apple, two balloons, three stars, four fish, five flowers. Each number means one more!', visual: '1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣' },
      { type: 'example', title: 'Count the Animals', content: 'How many animals do you see?', items: [
        { emoji: '🐘', label: '1', description: 'One elephant' },
        { emoji: '🐘🐘', label: '2', description: 'Two elephants' },
        { emoji: '🐘🐘🐘', label: '3', description: 'Three elephants' },
      ]},
      { type: 'quiz', question: 'How many stars are here: ⭐⭐⭐⭐⭐?', options: ['3', '4', '5', '6'], correct: 2, explanation: 'There are 5 stars! Count them: 1, 2, 3, 4, 5.' },
      { type: 'quiz', question: 'What number comes after 7?', options: ['6', '8', '9', '10'], correct: 1, explanation: '8 comes right after 7 when we count!' },
      { type: 'truefalse', question: 'The number 10 comes after 9.', answer: true, explanation: 'Yes! 1, 2, 3, 4, 5, 6, 7, 8, 9, 10. Ten is the last number in our counting chain.' },
    ],
  },
  {
    id: 'math-shapes-3', title: 'Shape Safari', categoryId: 'math', ageGroup: '3-6', difficulty: 'Easy',
    description: 'Find circles, squares, and triangles in the world!', icon: Calculator, emoji: '⭐',
    xpReward: 60, estTime: '5 min', skills: ['Shape Recognition', 'Geometry'], prerequisites: [],
    objectives: ['Identify basic shapes', 'Find shapes in everyday objects'],
    steps: [
      { type: 'intro', emoji: '⭐', title: 'Shapes Are Everywhere', content: 'A shape is the outline of something. Circles, squares, and triangles are all around us!' },
      { type: 'explanation', title: 'Circle, Square, Triangle', content: 'A circle is round like a ball. A square has 4 equal sides. A triangle has 3 sides and 3 corners.', visual: '⬤ ⬜ 🔺' },
      { type: 'example', title: 'Shapes in Real Life', content: 'Can you spot these shapes?', items: [
        { emoji: '🍕', label: 'Triangle', description: 'A pizza slice is a triangle' },
        { emoji: '🪟', label: 'Square', description: 'A window is a square' },
        { emoji: '🍩', label: 'Circle', description: 'A donut is a circle' },
      ]},
      { type: 'sorting', question: 'Sort each object by its shape!', items: [
        { emoji: '⚽', label: 'Ball', category: 'circle' },
        { emoji: '🎁', label: 'Box', category: 'square' },
        { emoji: '🚩', label: 'Flag', category: 'triangle' },
        { emoji: '🥞', label: 'Pancake', category: 'circle' },
      ], categories: [
        { id: 'circle', label: 'Circle', emoji: '⬤' },
        { id: 'square', label: 'Square', emoji: '⬜' },
        { id: 'triangle', label: 'Triangle', emoji: '🔺' },
      ]},
      { type: 'quiz', question: 'How many sides does a triangle have?', options: ['2', '3', '4', '5'], correct: 1, explanation: 'A triangle has exactly 3 sides!' },
    ],
  },
  {
    id: 'science-colors-3', title: 'Color Magic', categoryId: 'science', ageGroup: '3-6', difficulty: 'Easy',
    description: 'Mix colors and discover the rainbow!', icon: FlaskConical, emoji: '🌈',
    xpReward: 60, estTime: '5 min', skills: ['Color Theory', 'Observation'], prerequisites: [],
    objectives: ['Name primary colors', 'Discover what happens when colors mix'],
    steps: [
      { type: 'intro', emoji: '🌈', title: 'The Color Rainbow', content: 'There are three special colors called primary colors: Red, Blue, and Yellow. All other colors come from these three!' },
      { type: 'explanation', title: 'Mixing Colors', content: 'When you mix two primary colors, you get a new color! Red + Yellow = Orange. Blue + Yellow = Green. Red + Blue = Purple.', visual: '🔴 + 🟡 = 🟠', tip: 'Try mixing paint at home to see for yourself!' },
      { type: 'quiz', question: 'What color do you get when you mix Red and Yellow?', options: ['Green', 'Orange', 'Purple', 'Pink'], correct: 1, explanation: 'Red + Yellow = Orange! Think of a sunset.' },
      { type: 'quiz', question: 'What color do you get when you mix Blue and Yellow?', options: ['Green', 'Orange', 'Purple', 'Brown'], correct: 0, explanation: 'Blue + Yellow = Green! Think of grass and leaves.' },
      { type: 'matching', question: 'Match the color mix to the result!', pairs: [
        { left: 'Red + Blue', right: 'Purple' },
        { left: 'Blue + Yellow', right: 'Green' },
        { left: 'Red + Yellow', right: 'Orange' },
      ]},
      { type: 'truefalse', question: 'Red, Blue, and Yellow are the three primary colors.', answer: true, explanation: 'Yes! These three colors can make all other colors when mixed together.' },
    ],
  },
  {
    id: 'nature-animals-3', title: 'Animal Friends', categoryId: 'nature', ageGroup: '3-6', difficulty: 'Easy',
    description: 'Meet animals from land, sea, and sky!', icon: Leaf, emoji: '🦁',
    xpReward: 60, estTime: '5 min', skills: ['Animal Knowledge', 'Categorization'], prerequisites: [],
    objectives: ['Identify different animals', 'Sort animals by where they live'],
    steps: [
      { type: 'intro', emoji: '🦁', title: 'Animals Everywhere', content: 'Animals live all over the world — on land, in water, and in the sky. Let\'s meet some friends!' },
      { type: 'example', title: 'Where Do Animals Live?', content: 'Some animals live on land, some in water, and some fly in the sky!', items: [
        { emoji: '🐘', label: 'Land', description: 'Elephants walk on land' },
        { emoji: '🐠', label: 'Water', description: 'Fish swim in water' },
        { emoji: '🦅', label: 'Sky', description: 'Eagles fly in the sky' },
      ]},
      { type: 'sorting', question: 'Sort each animal by where it lives!', items: [
        { emoji: '🐶', label: 'Dog', category: 'land' },
        { emoji: '🐬', label: 'Dolphin', category: 'water' },
        { emoji: '🕊️', label: 'Dove', category: 'sky' },
        { emoji: '🐢', label: 'Turtle', category: 'land' },
      ], categories: [
        { id: 'land', label: 'Land', emoji: '🌍' },
        { id: 'water', label: 'Water', emoji: '🌊' },
        { id: 'sky', label: 'Sky', emoji: '☁️' },
      ]},
      { type: 'quiz', question: 'Where do fish live?', options: ['On land', 'In water', 'In the sky', 'In trees'], correct: 1, explanation: 'Fish live in water — they have fins and gills to swim and breathe!' },
      { type: 'truefalse', question: 'Birds can fly because they have wings.', answer: true, explanation: 'Yes! Birds have wings and feathers that help them fly through the sky.' },
    ],
  },
  {
    id: 'creativity-art-3', title: 'Color Your World', categoryId: 'creativity', ageGroup: '3-6', difficulty: 'Easy',
    description: 'Explore colors, feelings, and imagination!', icon: Palette, emoji: '🎨',
    xpReward: 50, estTime: '4 min', skills: ['Creativity', 'Self-Expression'], prerequisites: [],
    objectives: ['Connect colors to feelings', 'Use imagination to create'],
    steps: [
      { type: 'intro', emoji: '🎨', title: 'What Is Art?', content: 'Art is a way to show how we feel and what we imagine. Colors, lines, and shapes all help us create!' },
      { type: 'explanation', title: 'Colors and Feelings', content: 'Colors can show emotions. Warm colors like red and orange feel exciting. Cool colors like blue and green feel calm.', visual: '🔴🟠 = Exciting  🔵🟢 = Calm' },
      { type: 'quiz', question: 'Which color feels calm and peaceful?', options: ['Red', 'Blue', 'Orange', 'Yellow'], correct: 1, explanation: 'Blue is a cool color that feels calm — like a quiet lake.' },
      { type: 'quiz', question: 'What can you use to make art?', options: ['Crayons', 'Paint', 'Clay', 'All of these!'], correct: 3, explanation: 'All of these! You can make art with anything — crayons, paint, clay, and more.' },
      { type: 'truefalse', question: 'There is no wrong way to make art.', answer: true, explanation: 'That\'s right! Art is about expressing yourself, so there are no wrong answers.' },
    ],
  },
  {
    id: 'logic-patterns-3', title: 'Pattern Party', categoryId: 'logic', ageGroup: '3-6', difficulty: 'Easy',
    description: 'Find the next piece in colorful patterns!', icon: Lightbulb, emoji: '🔵',
    xpReward: 60, estTime: '5 min', skills: ['Pattern Recognition', 'Sequencing'], prerequisites: [],
    objectives: ['Identify repeating patterns', 'Predict what comes next'],
    steps: [
      { type: 'intro', emoji: '🔵', title: 'What Is a Pattern?', content: 'A pattern is something that repeats in the same order. Like red, blue, red, blue, red, blue!' },
      { type: 'explanation', title: 'See the Pattern', content: 'Patterns help us predict what comes next. If we see ⭐🌟⭐🌟⭐, what comes next? 🌟 of course!', visual: '⭐🌟⭐🌟⭐ → ?' },
      { type: 'quiz', question: 'What comes next: 🔴🔵🔴🔵🔴?', options: ['🔴', '🔵', '🟢', '🟡'], correct: 1, explanation: 'The pattern is Red, Blue, Red, Blue, Red... so Blue comes next!' },
      { type: 'quiz', question: 'What comes next: 🐱🐶🐱🐶🐱?', options: ['🐱', '🐶', '🐰', '🐭'], correct: 1, explanation: 'The pattern is Cat, Dog, Cat, Dog, Cat... so Dog comes next!' },
      { type: 'sequence', question: 'Put these in the right pattern order!', items: [
        { emoji: '🔴', label: 'Red' },
        { emoji: '🟡', label: 'Yellow' },
        { emoji: '🔴', label: 'Red' },
        { emoji: '🟡', label: 'Yellow' },
      ], correctOrder: [0, 1, 2, 3] },
    ],
  },

  // ═══════════ AGES 7-11 ═══════════

  {
    id: 'read-comp-7', title: 'Reading Detectives', categoryId: 'reading', ageGroup: '7-11', difficulty: 'Medium',
    description: 'Read clues and solve the mystery!', icon: BookOpen, emoji: '🔍',
    xpReward: 100, estTime: '7 min', skills: ['Reading Comprehension', 'Inference', 'Critical Thinking'], prerequisites: [],
    objectives: ['Read carefully for details', 'Make inferences from clues', 'Answer comprehension questions'],
    steps: [
      { type: 'intro', emoji: '🔍', title: 'Be a Reading Detective', content: 'Good readers look for clues in the text. Clues help us understand what\'s happening and why. Let\'s practice!' },
      { type: 'story', title: 'The Missing Trophy', emoji: '🏆', content: 'When Mrs. Park opened the gym door, the trophy shelf was empty. The floor had muddy footprints leading to the window, which was open. A soccer ball sat on the windowsill. "The custodian left at 6 PM," said the principal. "The alarm was set at 7." The footprints were fresh, and it had rained at 5:30.', question: 'When was the trophy most likely taken?', options: ['Before 5:30 PM', 'Between 5:30 and 6 PM', 'After 7 PM', 'In the morning'], correct: 1, explanation: 'The footprints were fresh and it rained at 5:30, so someone came after the rain. The custodian left at 6, so the thief came between 5:30 and 6 PM.' },
      { type: 'quiz', question: 'What clue tells us the thief came through the window?', options: ['The trophy was gone', 'The window was open', 'The custodian left', 'It was raining'], correct: 1, explanation: 'The open window and muddy footprints leading to it tell us the thief entered through the window.' },
      { type: 'quiz', question: 'Why is the soccer ball on the windowsill important?', options: ['It shows someone plays soccer', 'It might have been used to prop the window open', 'It proves the thief was a student', 'It is not important'], correct: 1, explanation: 'A soccer ball on the windowsill could have been used to keep the window open — a clever clue!' },
      { type: 'truefalse', question: 'The muddy footprints prove the thief came after it rained.', answer: true, explanation: 'Yes! The footprints were fresh and muddy, which means they were made after the rain at 5:30 PM.' },
    ],
  },
  {
    id: 'math-add-7', title: 'Addition Adventures', categoryId: 'math', ageGroup: '7-11', difficulty: 'Medium',
    description: 'Master addition with two and three digit numbers!', icon: Calculator, emoji: '➕',
    xpReward: 90, estTime: '6 min', skills: ['Addition', 'Mental Math', 'Problem Solving'], prerequisites: [],
    objectives: ['Add two-digit numbers', 'Solve word problems with addition', 'Use mental math strategies'],
    steps: [
      { type: 'intro', emoji: '➕', title: 'Adding Bigger Numbers', content: 'Addition is putting numbers together. When we add, we can break numbers apart to make it easier!' },
      { type: 'explanation', title: 'Breaking Numbers Apart', content: 'To add 47 + 38, break them into tens and ones: 40 + 30 = 70, then 7 + 8 = 15. Add them: 70 + 15 = 85!', visual: '47 + 38 = (40+30) + (7+8) = 70 + 15 = 85', tip: 'Breaking numbers into tens and ones makes mental math much faster!' },
      { type: 'quiz', question: 'What is 56 + 27?', options: ['73', '83', '93', '73'], correct: 1, explanation: '56 + 27 = 83. Break it: 50+20=70, 6+7=13, 70+13=83!', hint: 'Break into tens and ones: 50+20 and 6+7' },
      { type: 'quiz', question: 'Sara has 34 stickers. Her friend gives her 29 more. How many does she have now?', options: ['53', '63', '73', '43'], correct: 1, explanation: '34 + 29 = 63. Sara now has 63 stickers!' },
      { type: 'quiz', question: 'What is 145 + 236?', options: ['371', '381',  '361', '471'], correct: 1, explanation: '145 + 236 = 381. Add the hundreds: 100+200=300, tens: 40+30=70, ones: 5+6=11. 300+70+11=381!' },
      { type: 'truefalse', question: 'Adding 99 + 1 gives the same result as 100.', answer: true, explanation: 'Yes! 99 + 1 = 100. This is a useful trick — to add 99, just add 100 and subtract 1!' },
    ],
  },
  {
    id: 'math-mult-7', title: 'Multiplication Magic', categoryId: 'math', ageGroup: '7-11', difficulty: 'Medium',
    description: 'Discover how multiplication is super-fast addition!', icon: Calculator, emoji: '✖️',
    xpReward: 100, estTime: '7 min', skills: ['Multiplication', 'Times Tables', 'Mental Math'], prerequisites: ['math-add-7'],
    objectives: ['Understand multiplication as repeated addition', 'Learn times tables up to 5', 'Solve word problems'],
    steps: [
      { type: 'intro', emoji: '✖️', title: 'What Is Multiplication?', content: 'Multiplication is adding the same number many times. 3 x 4 means adding 3 four times: 3 + 3 + 3 + 3 = 12!' },
      { type: 'explanation', title: 'Times Tables', content: 'A times table shows all the answers for multiplying one number. The 2 times table is: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20.', visual: '2×1=2  2×2=4  2×3=6  2×4=8  2×5=10', tip: 'Practice your times tables — they make math so much faster!' },
      { type: 'quiz', question: 'What is 5 x 3?', options: ['8', '15', '53', '25'], correct: 1, explanation: '5 x 3 = 15. That\'s 5 + 5 + 5 = 15!' },
      { type: 'quiz', question: 'A box has 4 rows of 6 crayons. How many crayons total?', options: ['10', '24', '46', '12'], correct: 1, explanation: '4 x 6 = 24 crayons. Multiplication helps us count groups quickly!' },
      { type: 'quiz', question: 'What is 7 x 4?', options: ['28', '21', '32', '24'], correct: 0, explanation: '7 x 4 = 28. Think: 7 + 7 + 7 + 7 = 28!' },
      { type: 'matching', question: 'Match each multiplication to its answer!', pairs: [
        { left: '3 × 4', right: '12' },
        { left: '5 × 5', right: '25' },
        { left: '6 × 3', right: '18' },
      ]},
    ],
  },
  {
    id: 'science-water-7', title: 'The Water Cycle', categoryId: 'science', ageGroup: '7-11', difficulty: 'Medium',
    description: 'Discover how water travels around the Earth!', icon: FlaskConical, emoji: '💧',
    xpReward: 100, estTime: '7 min', skills: ['Earth Science', 'Observation', 'Systems Thinking'], prerequisites: [],
    objectives: ['Understand evaporation, condensation, and precipitation', 'Explain the water cycle'],
    steps: [
      { type: 'intro', emoji: '💧', title: 'Water Never Disappears', content: 'The water you drink today might have been drunk by a dinosaur! Water moves around the Earth in a cycle.' },
      { type: 'explanation', title: 'Three Steps of the Cycle', content: '1. Evaporation: The sun heats water in lakes and oceans, turning it into invisible water vapor that rises. 2. Condensation: The vapor cools high in the sky and forms clouds. 3. Precipitation: When clouds get heavy, water falls as rain or snow.', visual: '☀️→💧→☁️→🌧️→🌊' },
      { type: 'example', title: 'See It In Action', content: 'The water cycle happens every day all around us!', items: [
        { emoji: '☀️', label: 'Evaporation', description: 'Sun heats a puddle and it disappears into vapor' },
        { emoji: '☁️', label: 'Condensation', description: 'Vapor cools and forms fluffy clouds' },
        { emoji: '🌧️', label: 'Precipitation', description: 'Clouds get heavy and rain falls down' },
      ]},
      { type: 'quiz', question: 'What turns liquid water into vapor?', options: ['Cold air', 'The sun\'s heat', 'Wind', 'Clouds'], correct: 1, explanation: 'The sun\'s heat causes evaporation — it warms water until it turns into invisible vapor!' },
      { type: 'quiz', question: 'What is it called when water falls from clouds?', options: ['Evaporation', 'Condensation', 'Precipitation', 'Collection'], correct: 2, explanation: 'Precipitation is when water falls from the sky as rain, snow, hail, or sleet.' },
      { type: 'sequence', question: 'Put the water cycle steps in order!', items: [
        { emoji: '☀️', label: 'Sun heats water (Evaporation)' },
        { emoji: '☁️', label: 'Vapor forms clouds (Condensation)' },
        { emoji: '🌧️', label: 'Rain falls (Precipitation)' },
        { emoji: '🌊', label: 'Water flows back to oceans' },
      ], correctOrder: [0, 1, 2, 3] },
    ],
  },
  {
    id: 'geo-continents-7', title: 'Continents Explorer', categoryId: 'geography', ageGroup: '7-11', difficulty: 'Medium',
    description: 'Travel the 7 continents and learn about each one!', icon: Globe, emoji: '🌍',
    xpReward: 100, estTime: '7 min', skills: ['Geography', 'World Knowledge'], prerequisites: [],
    objectives: ['Name the 7 continents', 'Identify key facts about each continent'],
    steps: [
      { type: 'intro', emoji: '🌍', title: 'Seven Continents', content: 'Earth has 7 giant pieces of land called continents. Each one has different countries, animals, and weather!' },
      { type: 'example', title: 'Meet the Continents', content: 'Each continent is unique:', items: [
        { emoji: '🦁', label: 'Africa', description: 'Home to lions, elephants, and the Sahara Desert' },
        { emoji: '🐼', label: 'Asia', description: 'The biggest continent with pandas and tigers' },
        { emoji: '🦘', label: 'Australia', description: 'Home to kangaroos and koalas' },
        { emoji: '🗽', label: 'North America', description: 'Where the USA and Canada are' },
      ]},
      { type: 'quiz', question: 'Which is the largest continent?', options: ['Africa', 'Asia', 'Europe', 'Australia'], correct: 1, explanation: 'Asia is the largest continent — it has the most people and the biggest area!' },
      { type: 'quiz', question: 'Which continent is home to kangaroos?', options: ['Africa', 'Asia', 'Australia', 'Europe'], correct: 2, explanation: 'Australia is home to kangaroos, koalas, and many unique animals found nowhere else!' },
      { type: 'truefalse', question: 'There are 7 continents on Earth.', answer: true, explanation: 'Yes! The 7 continents are: Africa, Antarctica, Asia, Australia, Europe, North America, and South America.' },
      { type: 'quiz', question: 'Which continent is covered in ice and snow?', options: ['Asia', 'Antarctica', 'Europe', 'Africa'], correct: 1, explanation: 'Antarctica is the coldest continent, covered in ice and snow all year round!' },
    ],
  },
  {
    id: 'coding-seq-7', title: 'Code a Path', categoryId: 'coding', ageGroup: '7-11', difficulty: 'Medium',
    description: 'Learn how to give instructions like a computer!', icon: Code, emoji: '🤖',
    xpReward: 100, estTime: '6 min', skills: ['Sequencing', 'Computational Thinking'], prerequisites: [],
    objectives: ['Understand what an algorithm is', 'Give step-by-step instructions', 'Debug simple sequences'],
    steps: [
      { type: 'intro', emoji: '🤖', title: 'What Is Coding?', content: 'Coding is giving instructions to a computer. Computers do exactly what you tell them — so your instructions must be in the right order!' },
      { type: 'explanation', title: 'Algorithms', content: 'An algorithm is a list of steps in order. Like a recipe: first you get ingredients, then you mix them, then you bake. The order matters!', visual: 'Step 1 → Step 2 → Step 3 → Done!', tip: 'Think of coding like giving directions to a friend who follows every word exactly.' },
      { type: 'sequence', question: 'Put these steps for making a sandwich in order!', items: [
        { emoji: '🍞', label: 'Get two slices of bread' },
        { emoji: '🥜', label: 'Spread peanut butter' },
        { emoji: '🍞', label: 'Put bread slices together' },
        { emoji: '😋', label: 'Eat the sandwich!' },
      ], correctOrder: [0, 1, 2, 3] },
      { type: 'quiz', question: 'What do we call a list of steps in the right order?', options: ['A recipe', 'An algorithm', 'A program', 'A loop'], correct: 1, explanation: 'An algorithm is a step-by-step list of instructions. In coding, algorithms tell the computer what to do.' },
      { type: 'truefalse', question: 'In coding, the order of instructions does not matter.', answer: false, explanation: 'Wrong! The order matters a lot. If you tell a robot to "move" before "turn on," it won\'t work!' },
      { type: 'quiz', question: 'If a robot goes right instead of left, what do we call fixing the instruction?', options: ['Cooking', 'Debugging', 'Looping', 'Drawing'], correct: 1, explanation: 'Finding and fixing mistakes in code is called debugging — like being a code detective!' },
    ],
  },
  {
    id: 'logic-deduction-7', title: 'Logic Puzzles', categoryId: 'logic', ageGroup: '7-11', difficulty: 'Medium',
    description: 'Use clues to solve brain-teasing puzzles!', icon: Lightbulb, emoji: '🧩',
    xpReward: 110, estTime: '8 min', skills: ['Deductive Reasoning', 'Critical Thinking'], prerequisites: [],
    objectives: ['Use clues to eliminate possibilities', 'Find the correct answer through deduction'],
    steps: [
      { type: 'intro', emoji: '🧩', title: 'Think Like a Detective', content: 'Logic puzzles give you clues. By using each clue to eliminate wrong answers, you can find the right one!' },
      { type: 'story', title: 'The Pet Puzzle', emoji: '🐾', content: 'Three friends each have a different pet: a cat, a dog, or a fish. Alex does not have the fish. Bella has a pet that barks. Cody\'s pet does not have fur.', question: 'Who has the fish?', options: ['Alex', 'Bella', 'Cody', 'Cannot be determined'], correct: 0, explanation: 'Bella has the dog (it barks). Cody\'s pet has no fur, so Cody has the fish... wait! Cody has no fur means fish. But Alex doesn\'t have the fish, so Alex has the cat. That means Cody has the fish. Wait — let\'s re-check: Bella has dog, Alex doesn\'t have fish so Alex has cat, Cody has fish. Yes, Alex has the cat, Cody has the fish!' },
      { type: 'quiz', question: 'Using the same puzzle: who has the cat?', options: ['Alex', 'Bella', 'Cody', 'Cannot be determined'], correct: 0, explanation: 'Alex doesn\'t have the fish, and Bella has the dog. So Alex must have the cat!' },
      { type: 'truefalse', question: 'In logic puzzles, each clue helps you eliminate wrong answers.', answer: true, explanation: 'Yes! Each clue removes possibilities until only the correct answer remains.' },
    ],
  },
  {
    id: 'knowledge-space-7', title: 'Space Wonders', categoryId: 'knowledge', ageGroup: '7-11', difficulty: 'Medium',
    description: 'Discover amazing facts about our solar system!', icon: Sparkles, emoji: '🚀',
    xpReward: 90, estTime: '6 min', skills: ['Space Science', 'General Knowledge'], prerequisites: [],
    objectives: ['Learn about planets in our solar system', 'Discover amazing space facts'],
    steps: [
      { type: 'intro', emoji: '🚀', title: 'Our Solar System', content: 'Our solar system has 8 planets orbiting the Sun. Each planet is different — some are hot, some are cold, some are giant, some are small!' },
      { type: 'example', title: 'Meet the Planets', content: 'Let\'s visit some planets:', items: [
        { emoji: '☀️', label: 'The Sun', description: 'The star at the center of our solar system' },
        { emoji: '🪐', label: 'Saturn', description: 'Famous for its beautiful rings of ice and rock' },
        { emoji: '🔴', label: 'Mars', description: 'The Red Planet — maybe future home for humans!' },
        { emoji: '🌍', label: 'Earth', description: 'Our home — the only planet known to have life' },
      ]},
      { type: 'quiz', question: 'Which planet is known for its beautiful rings?', options: ['Mars', 'Saturn', 'Earth', 'Venus'], correct: 1, explanation: 'Saturn is famous for its rings made of ice and rock. They look beautiful through a telescope!' },
      { type: 'quiz', question: 'How many planets are in our solar system?', options: ['7', '8', '9', '10'], correct: 1, explanation: 'There are 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.' },
      { type: 'truefalse', question: 'The Sun is a star, not a planet.', answer: true, explanation: 'Yes! The Sun is a giant star at the center of our solar system. It gives light and heat to all the planets.' },
      { type: 'quiz', question: 'Which planet is called the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Mercury'], correct: 2, explanation: 'Mars is called the Red Planet because its surface has iron oxide — the same as rust!' },
    ],
  },

  // ═══════════ AGES 12+ (Advanced) ═══════════

  {
    id: 'math-algebra-12', title: 'Algebra Foundations', categoryId: 'math', ageGroup: '12+', difficulty: 'Hard',
    description: 'Learn how letters stand for numbers!', icon: Calculator, emoji: '📝',
    xpReward: 150, estTime: '8 min', skills: ['Algebra', 'Abstract Thinking', 'Problem Solving'], prerequisites: ['math-mult-7'],
    objectives: ['Understand variables', 'Solve simple equations', 'Apply algebra to word problems'],
    steps: [
      { type: 'intro', emoji: '📝', title: 'What Is Algebra?', content: 'Algebra uses letters (like x or y) to represent unknown numbers. Instead of asking "what plus 5 equals 12?", we write x + 5 = 12 and solve for x.' },
      { type: 'explanation', title: 'Solving for X', content: 'To solve x + 5 = 12, we need to get x alone. We subtract 5 from both sides: x = 12 - 5 = 7. The key rule: whatever you do to one side, do to the other!', visual: 'x + 5 = 12\nx + 5 − 5 = 12 − 5\nx = 7', tip: 'Always do the same operation to both sides to keep the equation balanced.' },
      { type: 'quiz', question: 'Solve: x + 8 = 15', options: ['x = 6', 'x = 7', 'x = 8', 'x = 23'], correct: 1, explanation: 'Subtract 8 from both sides: x = 15 - 8 = 7.' },
      { type: 'quiz', question: 'Solve: 3x = 21', options: ['x = 6', 'x = 7', 'x = 8', 'x = 18'], correct: 1, explanation: 'Divide both sides by 3: x = 21 ÷ 3 = 7.' },
      { type: 'quiz', question: 'If 2x + 3 = 11, what is x?', options: ['x = 3', 'x = 4', 'x = 5', 'x = 7'], correct: 1, explanation: 'First subtract 3: 2x = 8. Then divide by 2: x = 4!' },
      { type: 'truefalse', question: 'In the equation 2x = 10, you divide both sides by 2 to find x.', answer: true, explanation: 'Yes! Dividing both sides by 2 gives x = 5. Always keep the equation balanced.' },
    ],
  },
  {
    id: 'science-chem-12', title: 'Atoms and Molecules', categoryId: 'science', ageGroup: '12+', difficulty: 'Hard',
    description: 'Explore the tiny building blocks of everything!', icon: FlaskConical, emoji: '⚛️',
    xpReward: 150, estTime: '8 min', skills: ['Chemistry', 'Atomic Theory'], prerequisites: ['science-water-7'],
    objectives: ['Understand atoms and molecules', 'Learn about elements and compounds', 'See how matter is organized'],
    steps: [
      { type: 'intro', emoji: '⚛️', title: 'Everything Is Made of Atoms', content: 'Every thing you can see — and many things you can\'t — is made of tiny particles called atoms. Atoms are so small that a single drop of water has more atoms than there are people on Earth!' },
      { type: 'explanation', title: 'Atoms and Molecules', content: 'An atom is the smallest piece of an element. When two or more atoms join together, they form a molecule. For example, a water molecule (H₂O) has 2 hydrogen atoms and 1 oxygen atom.', visual: 'H₂O = H + H + O' },
      { type: 'example', title: 'Elements and Compounds', content: 'An element is made of one kind of atom. A compound is made of two or more kinds:', items: [
        { emoji: '🟡', label: 'Gold (Au)', description: 'An element — only gold atoms' },
        { emoji: '💧', label: 'Water (H₂O)', description: 'A compound — hydrogen + oxygen' },
        { emoji: '🧂', label: 'Salt (NaCl)', description: 'A compound — sodium + chlorine' },
      ]},
      { type: 'quiz', question: 'What is a molecule?', options: ['A single element', 'Two or more atoms joined together', 'A type of gas', 'The smallest particle'], correct: 1, explanation: 'A molecule is formed when two or more atoms join together — like H₂O!' },
      { type: 'quiz', question: 'How many hydrogen atoms are in one water molecule (H₂O)?', options: ['0', '1', '2', '3'], correct: 2, explanation: 'H₂O has 2 hydrogen atoms (H₂) and 1 oxygen atom (O).' },
      { type: 'truefalse', question: 'An atom is the smallest piece of an element.', answer: true, explanation: 'Yes! If you break an element down to its smallest piece, you get a single atom of that element.' },
    ],
  },
  {
    id: 'coding-loops-12', title: 'Loops and Conditionals', categoryId: 'coding', ageGroup: '12+', difficulty: 'Hard',
    description: 'Learn how programs make decisions and repeat!', icon: Code, emoji: '🔄',
    xpReward: 150, estTime: '8 min', skills: ['Programming Logic', 'Control Flow'], prerequisites: ['coding-seq-7'],
    objectives: ['Understand loops and when to use them', 'Learn about if/else conditionals', 'Write simple program logic'],
    steps: [
      { type: 'intro', emoji: '🔄', title: 'Programs That Think', content: 'Real programs don\'t just run straight through — they repeat steps and make decisions. Loops let code repeat, and conditionals let code choose.' },
      { type: 'explanation', title: 'Loops', content: 'A loop repeats code. Instead of writing "print hello" 5 times, you write: "repeat 5 times: print hello." Loops save time and make code cleaner.', visual: 'for i in 1 to 5:\n  print("hello!")' },
      { type: 'explanation', title: 'Conditionals (If/Else)', content: 'A conditional checks something and decides what to do. "If it\'s raining, take an umbrella. Else, wear sunglasses." Programs use if/else to make choices.', visual: 'if raining:\n  take_umbrella()\nelse:\n  wear_sunglasses()' },
      { type: 'quiz', question: 'Why do we use loops in programming?', options: ['To make code slower', 'To repeat code without writing it many times', 'To make code harder to read', 'To delete data'], correct: 1, explanation: 'Loops let us repeat code efficiently — write it once, run it many times!' },
      { type: 'quiz', question: 'What does an if/else statement do?', options: ['Repeats code', 'Makes a decision based on a condition', 'Stops the program', 'Creates a variable'], correct: 1, explanation: 'If/else checks a condition and runs different code depending on whether it\'s true or false.' },
      { type: 'truefalse', question: 'A loop that runs 10 times is more efficient than writing the same code 10 times.', answer: true, explanation: 'Yes! A loop is cleaner, shorter, and easier to change — just update the number once.' },
      { type: 'quiz', question: 'If a program says "if score > 100: print Win" and score is 50, what happens?', options: ['Prints "Win"', 'Does not print "Win"', 'Crashes', 'Prints "Lose"'], correct: 1, explanation: 'Since 50 is not greater than 100, the condition is false, so "Win" is not printed.' },
    ],
  },
  {
    id: 'logic-circuits-12', title: 'Logic Gates', categoryId: 'logic', ageGroup: '12+', difficulty: 'Hard',
    description: 'Discover how computers think with true and false!', icon: Lightbulb, emoji: '⚡',
    xpReward: 150, estTime: '8 min', skills: ['Boolean Logic', 'Digital Logic', 'Critical Thinking'], prerequisites: ['logic-deduction-7'],
    objectives: ['Understand AND, OR, and NOT gates', 'Evaluate truth tables', 'See how logic powers computers'],
    steps: [
      { type: 'intro', emoji: '⚡', title: 'How Computers Think', content: 'Inside every computer are billions of tiny switches called logic gates. They take true/false inputs and produce true/false outputs. That\'s how all computing works!' },
      { type: 'explanation', title: 'AND, OR, NOT', content: 'AND: both inputs must be true for the output to be true. OR: at least one input must be true. NOT: flips the input — true becomes false, false becomes true.', visual: 'AND: T+T=T  T+F=F\nOR:  T+F=T  F+F=F\nNOT: T→F  F→T' },
      { type: 'quiz', question: 'What is the output of AND when inputs are True and False?', options: ['True', 'False', 'Both', 'Neither'], correct: 1, explanation: 'AND requires BOTH inputs to be True. Since one is False, the output is False.' },
      { type: 'quiz', question: 'What is the output of OR when inputs are True and False?', options: ['True', 'False', 'Both', 'Neither'], correct: 0, explanation: 'OR only needs ONE input to be True. Since one is True, the output is True!' },
      { type: 'quiz', question: 'What does NOT do to a True input?', options: ['Keeps it True', 'Makes it False', 'Makes it both', 'Deletes it'], correct: 1, explanation: 'NOT flips the value — True becomes False, and False becomes True.' },
      { type: 'matching', question: 'Match each gate to its rule!', pairs: [
        { left: 'AND', right: 'Both must be True' },
        { left: 'OR', right: 'At least one must be True' },
        { left: 'NOT', right: 'Flips True to False' },
      ]},
    ],
  },
  {
    id: 'read-essay-12', title: 'Essay Structure', categoryId: 'reading', ageGroup: '12+', difficulty: 'Hard',
    description: 'Learn to build strong arguments in writing!', icon: BookOpen, emoji: '✍️',
    xpReward: 140, estTime: '8 min', skills: ['Writing', 'Essay Structure', 'Argumentation'], prerequisites: ['read-comp-7'],
    objectives: ['Understand essay structure', 'Write strong topic sentences', 'Support arguments with evidence'],
    steps: [
      { type: 'intro', emoji: '✍️', title: 'What Makes a Good Essay?', content: 'An essay is a structured piece of writing that presents and supports an argument. A strong essay has an introduction, body paragraphs, and a conclusion.' },
      { type: 'explanation', title: 'The Three Parts', content: '1. Introduction: Hook the reader and state your main point (thesis). 2. Body: Each paragraph has one idea with evidence to support it. 3. Conclusion: Summarize and leave the reader thinking.', visual: 'Intro → Body 1 → Body 2 → Body 3 → Conclusion' },
      { type: 'quiz', question: 'What is a thesis statement?', options: ['The last sentence of an essay', 'The main argument of the essay', 'A type of evidence', 'A quote from a book'], correct: 1, explanation: 'A thesis statement is the main argument or point of your essay, usually found in the introduction.' },
      { type: 'quiz', question: 'What should each body paragraph have?', options: ['Multiple unrelated ideas', 'One main idea with supporting evidence', 'Only opinions', 'No topic sentence'], correct: 1, explanation: 'Each body paragraph should focus on one main idea, supported by evidence like facts, examples, or quotes.' },
      { type: 'truefalse', question: 'A good conclusion simply repeats the introduction word for word.', answer: false, explanation: 'Wrong! A good conclusion summarizes your key points and leaves the reader with something to think about — it doesn\'t just copy the intro.' },
    ],
  },
  {
    id: 'geo-climate-12', title: 'Climate Zones', categoryId: 'geography', ageGroup: '12+', difficulty: 'Hard',
    description: 'Understand why different places have different weather!', icon: Globe, emoji: '🌤️',
    xpReward: 140, estTime: '7 min', skills: ['Geography', 'Climate Science'], prerequisites: ['geo-continents-7'],
    objectives: ['Identify major climate zones', 'Understand factors that affect climate'],
    steps: [
      { type: 'intro', emoji: '🌤️', title: 'Why Climates Differ', content: 'Have you wondered why some places are hot deserts while others are frozen tundra? Climate depends on latitude, altitude, and nearby water.' },
      { type: 'explanation', title: 'Factors That Shape Climate', content: 'Latitude: Places near the equator are hotter; near the poles, colder. Altitude: Higher up means cooler. Water: Oceans keep nearby land milder. Wind and ocean currents move heat around the planet.', visual: 'Equator → Hot  |  Poles → Cold' },
      { type: 'quiz', question: 'Why are places near the equator hotter?', options: ['They get more direct sunlight', 'They have more volcanoes', 'They are closer to the sun', 'They have less water'], correct: 0, explanation: 'The equator gets the most direct sunlight all year, making it the hottest region on Earth.' },
      { type: 'quiz', question: 'What happens to temperature as you go higher up a mountain?', options: ['It gets hotter', 'It gets colder', 'It stays the same', 'It rains more'], correct: 1, explanation: 'Temperature drops as altitude increases — that\'s why mountain peaks can have snow even in summer!' },
      { type: 'truefalse', question: 'Oceans help keep nearby land cooler in summer and warmer in winter.', answer: true, explanation: 'Yes! Water heats and cools slowly, so it moderates the temperature of nearby land — this is called the ocean\'s "thermal inertia."' },
    ],
  },
];

export function getAllLessons(): Lesson[] {
  return lessons;
}

export function getLessonsByAge(age: AgeGroup): Lesson[] {
  return lessons.filter((l) => l.ageGroup === age);
}

export function getLessonsByCategory(categoryId: string, age?: AgeGroup): Lesson[] {
  return lessons.filter((l) => l.categoryId === categoryId && (!age || l.ageGroup === age));
}

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}
