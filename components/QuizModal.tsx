import React, { useState, useEffect } from 'react';
import { CloseIcon, ChevronDownIcon } from '../constants';
import { Genre, PlatformCore, Game } from '../types';
import LoadingSpinner from './LoadingSpinner';
import GameCard from './GameCard'; // Re-use GameCard for displaying recommendations

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  genres: Genre[];
  platforms: PlatformCore[];
  onSubmitQuiz: (answers: QuizAnswers) => Promise<Game[] | null>; // Returns recommendations or null
  onViewDetails: (gameId: number) => void;
  onToggleWishlist: (gameId: number, gameDetails?: Game) => void;
  wishlist: number[];
}

export interface QuizAnswers {
  genres: string[]; // slugs
  platforms: string[]; // ids
  experience: string;
  age: string;
}

interface QuizQuestion {
  id: keyof QuizAnswers;
  text: string;
  type: 'multi-select' | 'single-select';
  optionsKey?: 'genres' | 'platforms'; // For dynamic options
  options?: { label: string; value: string; tags?: string[] }[];
  maxSelections?: number;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'genres',
    text: 'What are your favorite game genres? (Select up to 3)',
    type: 'multi-select',
    optionsKey: 'genres',
    maxSelections: 3,
  },
  {
    id: 'platforms',
    text: 'Which platforms do you play on?',
    type: 'multi-select',
    optionsKey: 'platforms',
  },
  {
    id: 'experience',
    text: 'What kind of experience are you looking for?',
    type: 'single-select',
    options: [
      { label: 'A deep story to get lost in', value: 'story', tags: ['story-rich', 'singleplayer', 'atmospheric', 'rpg'] },
      { label: 'Something to play with friends', value: 'multiplayer', tags: ['multiplayer', 'co-op', 'online-co-op', 'local-multiplayer'] },
      { label: 'A quick, action-packed game', value: 'action', tags: ['action', 'fast-paced', 'shooter', 'arcade'] },
      { label: 'A challenging strategic experience', value: 'strategy', tags: ['difficult', 'roguelike', 'strategy', 'rts', 'turn-based-strategy', 'puzzle'] },
      { label: 'Something relaxing and creative', value: 'relaxing', tags: ['casual', 'simulation', 'building', 'family-friendly', 'sandbox'] },
    ],
  },
  {
    id: 'age',
    text: 'How old should the games be?',
    type: 'single-select',
    options: [
      { label: 'Brand new (last 1-2 years)', value: 'new' },
      { label: 'Relatively recent (last 5 years)', value: 'recent' },
      { label: "Doesn't matter, classics are great!", value: 'any' },
    ],
  },
];

const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  genres: availableGenres,
  platforms: availablePlatforms,
  onSubmitQuiz,
  onViewDetails,
  onToggleWishlist,
  wishlist
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    genres: [],
    platforms: [],
    experience: '',
    age: '',
  });
  const [recommendations, setRecommendations] = useState<Game[] | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleId = 'quiz-modal-title';

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setCurrentStep(0);
      setAnswers({ genres: [], platforms: [], experience: '', age: '' });
      setRecommendations(null);
      setIsLoadingRecommendations(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQuestion = QUIZ_QUESTIONS[currentStep];

  const handleAnswerChange = (questionId: keyof QuizAnswers, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleMultiSelect = (questionId: keyof QuizAnswers, optionValue: string) => {
    const currentSelection = answers[questionId] as string[];
    const maxSelections = QUIZ_QUESTIONS.find(q => q.id === questionId)?.maxSelections;
    
    if (currentSelection.includes(optionValue)) {
      handleAnswerChange(questionId, currentSelection.filter((v) => v !== optionValue));
    } else {
      if (maxSelections && currentSelection.length >= maxSelections) {
        // Optional: provide feedback if max selections reached
        return; 
      }
      handleAnswerChange(questionId, [...currentSelection, optionValue]);
    }
  };

  const handleSubmit = async () => {
    setIsLoadingRecommendations(true);
    setError(null);
    try {
      const result = await onSubmitQuiz(answers);
      setRecommendations(result);
      if (!result || result.length === 0) {
        setError("No games found matching your criteria. Try different options!");
      }
    } catch (err) {
        console.error("Quiz submission error:", err);
        setError(err instanceof Error ? err.message : "Failed to get recommendations.");
        setRecommendations([]);
    } finally {
        setIsLoadingRecommendations(false);
    }
  };

  const nextStep = () => {
    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
       setRecommendations(null); // Clear recommendations if going back
       setError(null);
    }
  };

  const getOptionsForQuestion = (question: QuizQuestion) => {
    if (question.optionsKey === 'genres') {
      return availableGenres.map(g => ({ label: g.name, value: g.slug }));
    }
    if (question.optionsKey === 'platforms') {
      return availablePlatforms.map(p => ({ label: p.name, value: String(p.id) }));
    }
    return question.options || [];
  };
  
  const renderOptions = (question: QuizQuestion) => {
    const options = getOptionsForQuestion(question);
    const selection = answers[question.id];

    return options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => question.type === 'multi-select' ? handleMultiSelect(question.id, opt.value) : handleAnswerChange(question.id, opt.value)}
        className={`w-full text-left p-3 my-1.5 rounded-md border transition-all duration-150 ease-in-out
          ${ (question.type === 'multi-select' && (selection as string[]).includes(opt.value)) || (question.type === 'single-select' && selection === opt.value)
            ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-lg scale-105' 
            : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-fuchsia-500/50 text-slate-200'
          } focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800`}
        aria-pressed={(question.type === 'multi-select' && (selection as string[]).includes(opt.value)) || (question.type === 'single-select' && selection === opt.value)}
      >
        {opt.label}
      </button>
    ));
  };

  const progressPercentage = recommendations || isLoadingRecommendations ? 100 : ((currentStep +1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex justify-center items-center z-50 p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="bg-slate-800/90 glassmorphic rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-fuchsia-600/30"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <header className="flex justify-between items-center p-5 border-b border-slate-700/70">
          <h2 id={titleId} className="text-xl font-bold text-gradient-fuchsia font-heading">
            {recommendations ? "Your Game Recommendations!" : "Find Your Next Game"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors p-1.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
            aria-label="Close quiz"
          >
            {CloseIcon}
          </button>
        </header>

        <div className="p-6 overflow-y-auto custom-scrollbar-thin flex-grow">
          {isLoadingRecommendations ? (
            <div className="flex flex-col items-center justify-center h-full">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-fuchsia-400 font-semibold">Finding your perfect games...</p>
            </div>
          ) : recommendations ? (
             <>
              {error && <p className="text-center text-red-400 mb-4 p-3 bg-red-900/30 rounded-md">{error}</p>}
              {recommendations.length > 0 ? (
                <div className="space-y-4 animate-fadeInSlow">
                  {recommendations.map(game => (
                    <GameCard 
                        key={game.id} 
                        game={game} 
                        onViewDetails={() => { onClose(); onViewDetails(game.id);}} 
                        onToggleWishlist={(gameId) => onToggleWishlist(gameId, game)}
                        isFavorite={wishlist.includes(game.id)}
                    />
                  ))}
                </div>
              ) : !error && ( 
                <p className="text-center text-slate-400">No recommendations found with these criteria. Try again!</p>
              )}
            </>
          ) : (
            <div className="animate-fadeInSlow">
              <p className="text-lg text-slate-100 mb-1 font-semibold">{currentQuestion.text}</p>
              <p className="text-sm text-slate-400 mb-4">Question {currentStep + 1} of {QUIZ_QUESTIONS.length}</p>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar-thin pr-2">
                 {renderOptions(currentQuestion)}
              </div>
            </div>
          )}
        </div>

        <footer className="p-5 border-t border-slate-700/70 space-y-3">
          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div
              className="bg-fuchsia-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
              aria-label={`Quiz progress: ${Math.round(progressPercentage)}%`}
            ></div>
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0 || isLoadingRecommendations || !!recommendations}
              className="px-6 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
            >
              Back
            </button>
            {!recommendations && !isLoadingRecommendations ? (
                 <button
                    onClick={nextStep}
                    className="px-6 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-md font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
                >
                    {currentStep === QUIZ_QUESTIONS.length - 1 ? 'Get Recommendations' : 'Next'}
                </button>
            ): (
                 <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-md font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
                >
                    Close
                </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default QuizModal;
