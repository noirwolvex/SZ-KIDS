import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Lightbulb, Star, Sparkles } from 'lucide-react';
import { getLessonById, getCategoryById } from '@/data/lessons';
import type { LessonStep, Lesson } from '@/data/lessons';
import { useLessonProgress } from '@/lib/learn-hooks';
import Mascot from '@/components/Mascot';

type Props = {
  lessonId: string;
  onClose: () => void;
};

export default function LessonView({ lessonId, onClose }: Props) {
  const lesson = getLessonById(lessonId);
  const { start, updateStep, complete, getProgress } = useLessonProgress();
  const [stepIdx, setStepIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [stepResults, setStepResults] = useState<Record<number, 'correct' | 'wrong' | null>>({});
  const [showCompletion, setShowCompletion] = useState(false);
  const completingRef = useRef(false);

  const existingProgress = lesson ? getProgress(lesson.id) : null;

  // Start lesson on mount
  useEffect(() => {
    if (lesson) {
      start(lesson.id, lesson.steps.length);
      const prog = getProgress(lesson.id);
      if (prog && prog.status === 'in-progress' && prog.last_step_index > 0) {
        setStepIdx(prog.last_step_index);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  const handleStepResult = useCallback((result: 'correct' | 'wrong') => {
    setStepResults((prev) => ({ ...prev, [stepIdx]: result }));
    if (result === 'correct') {
      setCorrectCount((c) => c + 1);
    }
    setShowHint(false);
  }, [stepIdx]);

  const nextStep = useCallback(() => {
    if (!lesson || completingRef.current) return;
    if (stepIdx + 1 >= lesson.steps.length) {
      completingRef.current = true;
      const correctFromResults = Object.values(stepResults).filter((r) => r === 'correct').length;
      const score = Math.round((correctFromResults / lesson.steps.length) * 100);
      const xp = Math.round(lesson.xpReward * (score / 100));
      complete(lesson.id, score, xp, lesson.steps.length);
      setShowCompletion(true);
    } else {
      const newIdx = stepIdx + 1;
      setStepIdx(newIdx);
      updateStep(lesson.id, newIdx, newIdx);
      setShowHint(false);
    }
  }, [lesson, stepIdx, stepResults, complete, updateStep]);

  const prevStep = useCallback(() => {
    if (stepIdx > 0) {
      setStepIdx((i) => i - 1);
      setShowHint(false);
    }
  }, [stepIdx]);

  if (!lesson) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-lavender-500/30 backdrop-blur-md">
        <div className="bg-cream rounded-3xl p-8 text-center max-w-sm">
          <p className="text-lavender-500 font-display font-bold">Lesson not found</p>
          <button onClick={onClose} className="mt-4 text-lavender-400 text-sm font-display font-semibold">Go back</button>
        </div>
      </div>
    );
  }

  const step = lesson.steps[stepIdx];
  const cat = getCategoryById(lesson.categoryId);
  const totalSteps = lesson.steps.length;
  const progressPct = Math.round(((stepIdx + 1) / totalSteps) * 100);
  const isInteractive = step.type === 'quiz' || step.type === 'matching' || step.type === 'sorting' || step.type === 'story' || step.type === 'sequence' || step.type === 'truefalse';
  const hasResult = stepResults[stepIdx] !== undefined && stepResults[stepIdx] !== null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-lavender-500/30 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-2xl bg-cream rounded-3xl sm:rounded-5xl shadow-soft-lg overflow-hidden relative max-h-[94vh] flex flex-col"
      >
        {/* Header */}
        <div className={`relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r ${cat?.gradient || 'from-lavender-200 to-sky-200'} shrink-0 overflow-hidden`}>
          <div className="relative flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl shadow-soft shrink-0">
              {lesson.emoji}
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-xl font-bold text-lavender-500 truncate">{lesson.title}</h2>
              <p className="text-xs text-lavender-500/70 font-medium">Step {stepIdx + 1} of {totalSteps}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="relative p-2.5 rounded-full hover:bg-white/40 text-lavender-500 transition-colors active:scale-90 touch-target-sm shrink-0"
            aria-label="Close lesson"
          >
            <X size={22} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-white/70 backdrop-blur-sm border-b border-lavender-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-lavender-100 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${cat?.gradient || 'from-lavender-300 to-sky-300'}`}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="text-xs font-display font-bold text-lavender-400 shrink-0">{progressPct}%</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 no-scrollbar">
          <AnimatePresence mode="wait">
            {!showCompletion ? (
              <motion.div
                key={stepIdx}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <StepRenderer
                  step={step}
                  onResult={handleStepResult}
                  showHint={showHint}
                  hasResult={hasResult}
                  result={stepResults[stepIdx]}
                />
              </motion.div>
            ) : (
              <CompletionScreen
                lesson={lesson}
                correctCount={correctCount}
                onClose={onClose}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer controls */}
        {!showCompletion && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white/70 backdrop-blur-sm border-t border-lavender-50 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {stepIdx > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-1 px-3 py-2.5 rounded-2xl bg-lavender-100 text-lavender-500 font-display font-semibold text-sm hover:bg-lavender-200 transition-colors touch-target-sm"
                  >
                    <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span>
                  </button>
                )}
                {isInteractive && !hasResult && (step.type === 'quiz' || step.type === 'truefalse' || step.type === 'story') && (step as any).hint && (
                  <button
                    onClick={() => setShowHint((s) => !s)}
                    className="flex items-center gap-1 px-3 py-2.5 rounded-2xl bg-lemon-100 text-lemon-500 font-display font-semibold text-sm hover:bg-lemon-200 transition-colors touch-target-sm"
                  >
                    <Lightbulb size={16} /> <span className="hidden sm:inline">Hint</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isInteractive && !hasResult ? (
                  <p className="text-xs text-lavender-400 font-display font-medium hidden sm:block">Answer to continue</p>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={nextStep}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-300 to-lavender-400 text-white font-display font-bold text-sm shadow-soft touch-target-sm"
                  >
                    {stepIdx + 1 >= totalSteps ? 'Finish!' : 'Next'}
                    <ArrowRight size={16} />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Step Renderer ───

function StepRenderer({ step, onResult, showHint, hasResult, result }: {
  step: LessonStep;
  onResult: (result: 'correct' | 'wrong') => void;
  showHint: boolean;
  hasResult: boolean;
  result: 'correct' | 'wrong' | null | undefined;
}) {
  switch (step.type) {
    case 'intro':
      return <IntroStep step={step} />;
    case 'explanation':
      return <ExplanationStep step={step} />;
    case 'example':
      return <ExampleStep step={step} />;
    case 'quiz':
      return <QuizStep step={step} onResult={onResult} showHint={showHint} hasResult={hasResult} result={result} />;
    case 'matching':
      return <MatchingStep step={step} onResult={onResult} hasResult={hasResult} />;
    case 'sorting':
      return <SortingStep step={step} onResult={onResult} hasResult={hasResult} />;
    case 'story':
      return <StoryStep step={step} onResult={onResult} showHint={showHint} hasResult={hasResult} result={result} />;
    case 'sequence':
      return <SequenceStep step={step} onResult={onResult} hasResult={hasResult} />;
    case 'truefalse':
      return <TrueFalseStep step={step} onResult={onResult} showHint={showHint} hasResult={hasResult} result={result} />;
    default:
      return null;
  }
}

// ─── Intro Step ───

function IntroStep({ step }: { step: Extract<LessonStep, { type: 'intro' }> }) {
  return (
    <div className="text-center py-4">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="text-6xl sm:text-7xl mb-4"
      >
        {step.emoji}
      </motion.div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-lavender-500 mb-3">{step.title}</h2>
      <p className="text-lavender-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto">{step.content}</p>
    </div>
  );
}

// ─── Explanation Step ───

function ExplanationStep({ step }: { step: Extract<LessonStep, { type: 'explanation' }> }) {
  return (
    <div className="py-2">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-lavender-500 mb-3">{step.title}</h2>
      <p className="text-lavender-400 text-sm sm:text-base leading-relaxed mb-4">{step.content}</p>
      {step.visual && (
        <div className="bg-gradient-to-br from-sky-100 to-lavender-100 rounded-3xl p-5 sm:p-6 text-center my-4">
          <p className="font-display font-bold text-lg sm:text-xl text-lavender-500 whitespace-pre-line">{step.visual}</p>
        </div>
      )}
      {step.tip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 bg-lemon-100 rounded-2xl p-3 sm:p-4 mt-4"
        >
          <Lightbulb size={18} className="text-lemon-500 shrink-0 mt-0.5" />
          <p className="text-sm text-lemon-600 font-medium leading-relaxed">{step.tip}</p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Example Step ───

function ExampleStep({ step }: { step: Extract<LessonStep, { type: 'example' }> }) {
  return (
    <div className="py-2">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-lavender-500 mb-2">{step.title}</h2>
      <p className="text-lavender-400 text-sm sm:text-base leading-relaxed mb-4">{step.content}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {step.items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 15 }}
            className="bg-white rounded-3xl p-4 shadow-soft border border-lavender-50 flex items-center gap-3"
          >
            <div className="text-3xl sm:text-4xl shrink-0">{item.emoji}</div>
            <div className="min-w-0">
              <p className="font-display font-bold text-lavender-500">{item.label}</p>
              <p className="text-xs sm:text-sm text-lavender-400 leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Quiz Step ───

function QuizStep({ step, onResult, showHint, hasResult, result }: {
  step: Extract<LessonStep, { type: 'quiz' }>;
  onResult: (r: 'correct' | 'wrong') => void;
  showHint: boolean;
  hasResult: boolean;
  result: 'correct' | 'wrong' | null | undefined;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (idx: number) => {
    if (hasResult) return;
    setSelected(idx);
    onResult(idx === step.correct ? 'correct' : 'wrong');
  };

  return (
    <div className="py-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-sky-500" />
        </div>
        <p className="font-display font-bold text-lavender-500 text-sm sm:text-base">Quick Question!</p>
      </div>
      <h3 className="text-lavender-500 text-base sm:text-lg font-display font-semibold mb-4 leading-relaxed">{step.question}</h3>

      {showHint && step.hint && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-start gap-2 bg-lemon-100 rounded-2xl p-3 mb-4"
        >
          <Lightbulb size={16} className="text-lemon-500 shrink-0 mt-0.5" />
          <p className="text-sm text-lemon-600 font-medium">{step.hint}</p>
        </motion.div>
      )}

      <div className="space-y-2.5">
        {step.options.map((opt, i) => {
          const isCorrect = i === step.correct;
          const isSelected = selected === i;
          let cls = 'bg-white border-lavender-100 hover:border-lavender-200 text-lavender-500';
          if (hasResult && isCorrect) cls = 'bg-mint-100 border-mint-300 text-mint-500';
          else if (hasResult && isSelected && !isCorrect) cls = 'bg-blush-100 border-blush-300 text-blush-500';
          else if (hasResult) cls = 'bg-white border-lavender-50 text-lavender-300 opacity-60';

          return (
            <motion.button
              key={i}
              whileHover={!hasResult ? { scale: 1.02, x: 4 } : undefined}
              whileTap={!hasResult ? { scale: 0.98 } : undefined}
              onClick={() => handleSelect(i)}
              disabled={hasResult}
              className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border-2 font-display font-semibold text-sm sm:text-base transition-all text-left touch-target-sm ${cls}`}
            >
              <span>{opt}</span>
              {hasResult && isCorrect && <Check size={20} className="text-mint-500 shrink-0" />}
              {hasResult && isSelected && !isCorrect && <X size={20} className="text-blush-500 shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {hasResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 rounded-2xl p-3 sm:p-4 ${result === 'correct' ? 'bg-mint-100' : 'bg-blush-100'}`}
        >
          <p className={`text-sm font-medium leading-relaxed ${result === 'correct' ? 'text-mint-600' : 'text-blush-600'}`}>
            {result === 'correct' ? '✅ Correct! ' : '❌ Not quite. '}{step.explanation}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ─── True/False Step ───

function TrueFalseStep({ step, onResult, showHint, hasResult, result }: {
  step: Extract<LessonStep, { type: 'truefalse' }>;
  onResult: (r: 'correct' | 'wrong') => void;
  showHint: boolean;
  hasResult: boolean;
  result: 'correct' | 'wrong' | null | undefined;
}) {
  const [selected, setSelected] = useState<boolean | null>(null);

  const handleSelect = (val: boolean) => {
    if (hasResult) return;
    setSelected(val);
    onResult(val === step.answer ? 'correct' : 'wrong');
  };

  return (
    <div className="py-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-lemon-100 flex items-center justify-center shrink-0">
          <Lightbulb size={16} className="text-lemon-500" />
        </div>
        <p className="font-display font-bold text-lavender-500 text-sm sm:text-base">True or False?</p>
      </div>
      <h3 className="text-lavender-500 text-base sm:text-lg font-display font-semibold mb-4 leading-relaxed">{step.question}</h3>

      {showHint && step.hint && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-start gap-2 bg-lemon-100 rounded-2xl p-3 mb-4"
        >
          <Lightbulb size={16} className="text-lemon-500 shrink-0 mt-0.5" />
          <p className="text-sm text-lemon-600 font-medium">{step.hint}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {[
          { val: true, label: 'True', emoji: '✅', color: 'mint' },
          { val: false, label: 'False', emoji: '❌', color: 'blush' },
        ].map((opt) => {
          const isCorrect = opt.val === step.answer;
          const isSelected = selected === opt.val;
          let cls = 'bg-white border-lavender-100 hover:border-lavender-200 text-lavender-500';
          if (hasResult && isCorrect) cls = 'bg-mint-100 border-mint-300 text-mint-500';
          else if (hasResult && isSelected && !isCorrect) cls = 'bg-blush-100 border-blush-300 text-blush-500';
          else if (hasResult) cls = 'bg-white border-lavender-50 text-lavender-300 opacity-60';

          return (
            <motion.button
              key={opt.label}
              whileHover={!hasResult ? { scale: 1.04, y: -2 } : undefined}
              whileTap={!hasResult ? { scale: 0.96 } : undefined}
              onClick={() => handleSelect(opt.val)}
              disabled={hasResult}
              className={`flex flex-col items-center gap-1 p-5 sm:p-6 rounded-3xl border-2 font-display font-bold text-base sm:text-lg transition-all touch-target-sm ${cls}`}
            >
              <span className="text-3xl sm:text-4xl">{opt.emoji}</span>
              {opt.label}
            </motion.button>
          );
        })}
      </div>

      {hasResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 rounded-2xl p-3 sm:p-4 ${result === 'correct' ? 'bg-mint-100' : 'bg-blush-100'}`}
        >
          <p className={`text-sm font-medium leading-relaxed ${result === 'correct' ? 'text-mint-600' : 'text-blush-600'}`}>
            {result === 'correct' ? '✅ Correct! ' : '❌ Not quite. '}{step.explanation}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Matching Step ───

function MatchingStep({ step, onResult, hasResult }: {
  step: Extract<LessonStep, { type: 'matching' }>;
  onResult: (r: 'correct' | 'wrong') => void;
  hasResult: boolean;
}) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});

  const leftItems = step.pairs.map((p, i) => ({ idx: i, text: p.left }));
  const rightItems = useMemo(() => {
    const indices = step.pairs.map((_, i) => i);
    // Simple shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.map((origIdx) => ({ idx: origIdx, text: step.pairs[origIdx].right }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleRightClick = (rightOrigIdx: number) => {
    if (hasResult || selectedLeft === null) return;
    setMatches((m) => ({ ...m, [selectedLeft]: rightOrigIdx }));
    setSelectedLeft(null);

    // Check if all matched
    const newMatches = { ...matches, [selectedLeft]: rightOrigIdx };
    const allMatched = Object.keys(newMatches).length >= step.pairs.length;
    if (allMatched) {
      const allCorrect = step.pairs.every((_, i) => newMatches[i] === i);
      onResult(allCorrect ? 'correct' : 'wrong');
    }
  };

  return (
    <div className="py-2">
      <p className="font-display font-bold text-lavender-500 text-sm sm:text-base mb-1">Match the Pairs!</p>
      <h3 className="text-lavender-400 text-sm sm:text-base mb-4">{step.question}</h3>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2.5">
          {leftItems.map((item) => {
            const isMatched = matches[item.idx] !== undefined;
            const isSelected = selectedLeft === item.idx;
            return (
              <button
                key={item.idx}
                onClick={() => !hasResult && !isMatched && setSelectedLeft(item.idx)}
                disabled={isMatched || hasResult}
                className={`w-full p-3 sm:p-4 rounded-2xl border-2 font-display font-semibold text-sm sm:text-base transition-all touch-target-sm ${
                  isSelected ? 'border-sky-400 bg-sky-100 text-sky-500 scale-105' :
                  isMatched ? 'border-mint-300 bg-mint-100 text-mint-500' :
                  'border-lavender-100 bg-white text-lavender-500 hover:border-lavender-200'
                }`}
              >
                {item.text} {isMatched && '✓'}
              </button>
            );
          })}
        </div>
        <div className="space-y-2.5">
          {rightItems.map((item) => {
            const matchedBy = Object.entries(matches).find(([, ri]) => ri === item.idx);
            const isMatched = matchedBy !== undefined;
            const isCorrect = isMatched && matchedBy![0] === String(item.idx);
            return (
              <button
                key={item.idx}
                onClick={() => handleRightClick(item.idx)}
                disabled={isMatched || hasResult}
                className={`w-full p-3 sm:p-4 rounded-2xl border-2 font-display font-semibold text-sm sm:text-base transition-all touch-target-sm ${
                  hasResult && isMatched && isCorrect ? 'border-mint-300 bg-mint-100 text-mint-500' :
                  hasResult && isMatched && !isCorrect ? 'border-blush-300 bg-blush-100 text-blush-500' :
                  isMatched ? 'border-lavender-200 bg-lavender-50 text-lavender-400' :
                  'border-lavender-100 bg-white text-lavender-500 hover:border-lavender-200'
                }`}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Sorting Step ───

function SortingStep({ step, onResult, hasResult }: {
  step: Extract<LessonStep, { type: 'sorting' }>;
  onResult: (r: 'correct' | 'wrong') => void;
  hasResult: boolean;
}) {
  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const [unassigned, setUnassigned] = useState<number[]>(step.items.map((_, i) => i));

  const assign = (itemIdx: number, categoryId: string) => {
    if (hasResult) return;
    setAssignments((a) => ({ ...a, [itemIdx]: categoryId }));
    setUnassigned((u) => u.filter((i) => i !== itemIdx));

    const newAssignments = { ...assignments, [itemIdx]: categoryId };
    if (Object.keys(newAssignments).length >= step.items.length) {
      const allCorrect = step.items.every((item, i) => newAssignments[i] === item.category);
      onResult(allCorrect ? 'correct' : 'wrong');
    }
  };

  return (
    <div className="py-2">
      <p className="font-display font-bold text-lavender-500 text-sm sm:text-base mb-1">Sort by Category!</p>
      <h3 className="text-lavender-400 text-sm sm:text-base mb-4">{step.question}</h3>

      {/* Unassigned items */}
      {unassigned.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-lavender-400 font-display font-semibold mb-2">Tap a category for each:</p>
          <div className="flex flex-wrap gap-2">
            {unassigned.map((idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border-2 border-lavender-100 shadow-soft">
                <span className="text-2xl">{step.items[idx].emoji}</span>
                <span className="font-display font-semibold text-sm text-lavender-500">{step.items[idx].label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category bins */}
      <div className="space-y-3">
        {step.categories.map((cat) => {
          const itemsInCat = step.items
            .map((item, i) => ({ ...item, idx: i }))
            .filter((item) => assignments[item.idx] === cat.id);
          return (
            <div key={cat.id} className="rounded-3xl border-2 border-lavender-100 bg-white/50 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{cat.emoji}</span>
                <p className="font-display font-bold text-sm text-lavender-500">{cat.label}</p>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[44px]">
                {itemsInCat.length === 0 ? (
                  <span className="text-xs text-lavender-300 font-medium">Drop items here...</span>
                ) : (
                  itemsInCat.map((item) => (
                    <div key={item.idx} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${
                      hasResult && item.category === cat.id ? 'bg-mint-100 text-mint-500' :
                      hasResult && item.category !== cat.id ? 'bg-blush-100 text-blush-500' :
                      'bg-lavender-100 text-lavender-500'
                    }`}>
                      <span className="text-lg">{item.emoji}</span>
                      <span className="font-display font-semibold text-xs">{item.label}</span>
                      {hasResult && item.category === cat.id && <Check size={12} className="text-mint-500" />}
                    </div>
                  ))
                )}
              </div>
              {!hasResult && unassigned.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {unassigned.map((idx) => (
                    <button
                      key={idx}
                      onClick={() => assign(idx, cat.id)}
                      className="text-xs px-2 py-1 rounded-lg bg-lavender-50 text-lavender-400 hover:bg-lavender-100 font-display font-semibold transition-colors touch-target-sm"
                    >
                      + {step.items[idx].emoji} {step.items[idx].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Story Step ───

function StoryStep({ step, onResult, showHint, hasResult, result }: {
  step: Extract<LessonStep, { type: 'story' }>;
  onResult: (r: 'correct' | 'wrong') => void;
  showHint: boolean;
  hasResult: boolean;
  result: 'correct' | 'wrong' | null | undefined;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (idx: number) => {
    if (hasResult) return;
    setSelected(idx);
    onResult(idx === step.correct ? 'correct' : 'wrong');
  };

  return (
    <div className="py-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{step.emoji}</span>
        <p className="font-display font-bold text-lavender-500 text-sm sm:text-base">{step.title}</p>
      </div>

      <div className="bg-gradient-to-br from-blush-50 to-sky-50 rounded-3xl p-4 sm:p-5 mb-4">
        <p className="text-lavender-500 text-sm sm:text-base leading-relaxed">{step.content}</p>
      </div>

      <p className="font-display font-semibold text-lavender-500 text-sm sm:text-base mb-3">{step.question}</p>

      <div className="space-y-2.5">
        {step.options.map((opt, i) => {
          const isCorrect = i === step.correct;
          const isSelected = selected === i;
          let cls = 'bg-white border-lavender-100 hover:border-lavender-200 text-lavender-500';
          if (hasResult && isCorrect) cls = 'bg-mint-100 border-mint-300 text-mint-500';
          else if (hasResult && isSelected && !isCorrect) cls = 'bg-blush-100 border-blush-300 text-blush-500';
          else if (hasResult) cls = 'bg-white border-lavender-50 text-lavender-300 opacity-60';

          return (
            <motion.button
              key={i}
              whileHover={!hasResult ? { scale: 1.02, x: 4 } : undefined}
              whileTap={!hasResult ? { scale: 0.98 } : undefined}
              onClick={() => handleSelect(i)}
              disabled={hasResult}
              className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border-2 font-display font-semibold text-sm sm:text-base transition-all text-left touch-target-sm ${cls}`}
            >
              <span>{opt}</span>
              {hasResult && isCorrect && <Check size={20} className="text-mint-500 shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {hasResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 rounded-2xl p-3 sm:p-4 ${result === 'correct' ? 'bg-mint-100' : 'bg-blush-100'}`}
        >
          <p className={`text-sm font-medium leading-relaxed ${result === 'correct' ? 'text-mint-600' : 'text-blush-600'}`}>
            {result === 'correct' ? '✅ Correct! ' : '❌ Not quite. '}{step.explanation}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Sequence Step ───

function SequenceStep({ step, onResult, hasResult }: {
  step: Extract<LessonStep, { type: 'sequence' }>;
  onResult: (r: 'correct' | 'wrong') => void;
  hasResult: boolean;
}) {
  const [order, setOrder] = useState<number[]>(step.items.map((_, i) => i));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const swap = (idx: number) => {
    if (hasResult) return;
    if (selectedIndex === null) {
      setSelectedIndex(idx);
    } else {
      const newOrder = [...order];
      [newOrder[selectedIndex], newOrder[idx]] = [newOrder[idx], newOrder[selectedIndex]];
      setOrder(newOrder);
      setSelectedIndex(null);
      // Check if correct
      const isCorrect = newOrder.every((val, i) => val === step.correctOrder[i]);
      if (isCorrect) onResult('correct');
    }
  };

  const checkOrder = () => {
    const isCorrect = order.every((val, i) => val === step.correctOrder[i]);
    onResult(isCorrect ? 'correct' : 'wrong');
  };

  return (
    <div className="py-2">
      <p className="font-display font-bold text-lavender-500 text-sm sm:text-base mb-1">Put in Order!</p>
      <h3 className="text-lavender-400 text-sm sm:text-base mb-2">{step.question}</h3>
      <p className="text-xs text-lavender-400 mb-4">Tap two items to swap them into the right order.</p>

      <div className="space-y-2.5">
        {order.map((itemIdx, position) => {
          const item = step.items[itemIdx];
          const isCorrectPos = hasResult && itemIdx === step.correctOrder[position];
          const isWrongPos = hasResult && itemIdx !== step.correctOrder[position];
          const isSelected = selectedIndex === position;
          return (
            <motion.button
              key={itemIdx}
              whileTap={!hasResult ? { scale: 0.97 } : undefined}
              onClick={() => swap(position)}
              disabled={hasResult}
              className={`w-full flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border-2 font-display font-semibold text-sm sm:text-base transition-all touch-target-sm ${
                isSelected ? 'border-sky-400 bg-sky-100 scale-[1.02]' :
                isCorrectPos ? 'border-mint-300 bg-mint-100 text-mint-500' :
                isWrongPos ? 'border-blush-300 bg-blush-100 text-blush-500' :
                'border-lavender-100 bg-white text-lavender-500 hover:border-lavender-200'
              }`}
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-lavender-100 text-lavender-400 font-bold text-xs shrink-0">
                {position + 1}
              </span>
              <span className="text-2xl shrink-0">{item.emoji}</span>
              <span className="text-left">{item.label}</span>
              {isCorrectPos && <Check size={18} className="text-mint-500 ml-auto shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {!hasResult && selectedIndex !== null && (
        <p className="text-xs text-sky-500 font-display font-semibold mt-3 text-center">Now tap another item to swap!</p>
      )}
      {!hasResult && selectedIndex === null && (
        <button
          onClick={checkOrder}
          className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-sky-300 to-lavender-400 text-white font-display font-bold text-sm shadow-soft touch-target-sm"
        >
          Check Order
        </button>
      )}
    </div>
  );
}

// ─── Completion Screen ───

function CompletionScreen({ lesson, correctCount, onClose }: {
  lesson: Lesson;
  correctCount: number;
  onClose: () => void;
}) {
  const totalSteps = lesson.steps.length;
  const interactiveSteps = lesson.steps.filter((s) => s.type !== 'intro' && s.type !== 'explanation' && s.type !== 'example').length;
  const score = interactiveSteps > 0 ? Math.round((correctCount / interactiveSteps) * 100) : 100;
  const xp = Math.round(lesson.xpReward * (score / 100));
  const stars = score >= 90 ? 3 : score >= 60 ? 2 : score >= 30 ? 1 : 0;

  return (
    <div className="text-center py-4 px-2">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="mx-auto mb-4"
      >
        <Mascot size={120} expression="excited" className="mx-auto w-[100px] h-[100px] sm:w-[120px] sm:h-[120px]" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-display text-2xl sm:text-3xl font-bold text-lavender-500"
      >
        Lesson Complete!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lavender-400 text-sm sm:text-base mt-1"
      >
        You did amazing! Here's what you earned:
      </motion.p>

      {/* Stars */}
      <div className="flex justify-center gap-2 sm:gap-3 my-5">
        {[1, 2, 3].map((s) => (
          <motion.div
            key={s}
            initial={{ scale: 0, rotate: -30, y: -40 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            transition={{ delay: 0.5 + s * 0.15, type: 'spring', stiffness: 200, damping: 12 }}
          >
            <Star
              size={44}
              className={s <= stars ? 'text-lemon-400 drop-shadow-md' : 'text-lavender-200'}
              fill={s <= stars ? 'currentColor' : 'none'}
              strokeWidth={s <= stars ? 0 : 2}
            />
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-5">
        <div className="bg-mint-100 rounded-2xl p-3">
          <p className="font-display font-bold text-2xl text-mint-500">{score}%</p>
          <p className="text-xs text-mint-400 font-semibold">Score</p>
        </div>
        <div className="bg-lemon-100 rounded-2xl p-3">
          <p className="font-display font-bold text-2xl text-lemon-500">+{xp}</p>
          <p className="text-xs text-lemon-400 font-semibold">XP</p>
        </div>
        <div className="bg-sky-100 rounded-2xl p-3">
          <p className="font-display font-bold text-2xl text-sky-500">{correctCount}/{totalSteps}</p>
          <p className="text-xs text-sky-400 font-semibold">Correct</p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-300 to-lavender-400 text-white font-display font-bold shadow-soft touch-target-sm"
      >
        Back to Learning Hub
      </motion.button>
    </div>
  );
}
