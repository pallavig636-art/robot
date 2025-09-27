import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { RotateCcw, Sparkles, Play, Volume2, Trophy, Star, Home, Lightbulb, CheckCircle, XCircle } from 'lucide-react';

// --- Utility Functions for Quiz ---
/**
 * Generates a slightly more advanced math quiz question, including:
 * 1. Simple Multiplication (e.g., 8 x 7)
 * 2. Two-Digit Addition/Subtraction (e.g., 18 + 12 or 20 - 7)
 * 3. Simple Two-Step (e.g., 4 x 5 + 3)
 */
const generateQuiz = () => {
  const complexity = Math.random();

  if (complexity < 0.4) { // 40% chance: Simple Multiplication
    const num1 = Math.floor(Math.random() * 8) + 2; // 2-9
    const num2 = Math.floor(Math.random() * 8) + 2; // 2-9
    const question = `${num1} × ${num2}`;
    const answer = num1 * num2;
    return { question, answer };
  } else if (complexity < 0.8) { // 40% chance: Two-Digit Addition/Subtraction
    const num1 = Math.floor(Math.random() * 15) + 5; // 5-19
    const num2 = Math.floor(Math.random() * 15) + 5; // 5-19
    const op = Math.random() < 0.5 ? '+' : '-';

    if (op === '+') {
      const question = `${num1} + ${num2}`;
      const answer = num1 + num2;
      return { question, answer };
    } else { // Subtraction
      const bigger = Math.max(num1, num2) + 1; // Ensure it's slightly larger range
      const smaller = Math.min(num1, num2);
      const question = `${bigger} - ${smaller}`;
      const answer = bigger - smaller;
      return { question, answer };
    }
  } else { // 20% chance: Simple Two-Step
    const num1 = Math.floor(Math.random() * 5) + 2; // 2-6
    const num2 = Math.floor(Math.random() * 5) + 2; // 2-6
    const num3 = Math.floor(Math.random() * 5) + 1; // 1-5
    const question = `${num1} × ${num2} + ${num3}`;
    const answer = (num1 * num2) + num3;
    return { question, answer };
  }
};


const App = () => {
  // --- Refs ---
  const robotRef = useRef(null); 

  // --- States ---
  const [robotParts, setRobotParts] = useState({
    head: null,
    body: null,
    leftArm: null,
    rightArm: null,
    leftLeg: null,
    rightLeg: null
  });
  const [isComplete, setIsComplete] = useState(false);
  const [currentAction, setCurrentAction] = useState('idle');
  const [robotMessage, setRobotMessage] = useState('Hi! Click on parts to build me, then give me commands!');
  const [selectedCommand, setSelectedCommand] = useState('');
  const [selectedPart, setSelectedPart] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [robotName, setRobotName] = useState('');
  const [completedRobots, setCompletedRobots] = useState(0);
  const [currentTheme, setCurrentTheme] = useState('space');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- Quiz States ---
  const [quiz, setQuiz] = useState(null); // { question, answer }
  const [quizInput, setQuizInput] = useState('');
  const [quizStatus, setQuizStatus] = useState(null); // 'correct', 'incorrect'

  // Memoized theme data
  const themes = useMemo(() => ({
    space: {
      name: '🚀 Space Adventure',
      bg: 'from-purple-400 via-pink-500 to-red-500',
      parts: {
        heads: [
          { id: 'head1', emoji: '🤖', color: 'bg-blue-400', name: 'Cyber Head' },
          { id: 'head2', emoji: '👾', color: 'bg-purple-400', name: 'Alien Head' },
          { id: 'head3', emoji: '🛸', color: 'bg-green-400', name: 'UFO Head' }
        ],
        bodies: [
          { id: 'body1', emoji: '⚙️', color: 'bg-red-400', name: 'Gear Body' },
          { id: 'body2', emoji: '🔋', color: 'bg-yellow-400', name: 'Power Core' },
          { id: 'body3', emoji: '💎', color: 'bg-pink-400', name: 'Crystal Core' }
        ],
        arms: [
          { id: 'arm1', emoji: '🦾', color: 'bg-orange-400', name: 'Rocket Arm' },
          { id: 'arm2', emoji: '🔧', color: 'bg-teal-400', name: 'Tool Arm' },
          { id: 'arm3', emoji: '⚡', color: 'bg-indigo-400', name: 'Lightning Arm' }
        ],
        legs: [
          { id: 'leg1', emoji: '🦵', color: 'bg-emerald-400', name: 'Jet Leg' },
          { id: 'leg2', emoji: '⚡', color: 'bg-amber-400', name: 'Speed Leg' },
          { id: 'leg3', emoji: '🌟', color: 'bg-rose-400', name: 'Star Leg' }
        ]
      }
    },
    ocean: {
      name: '🌊 Ocean Explorer',
      bg: 'from-blue-400 via-cyan-500 to-teal-500',
      parts: {
        heads: [
          { id: 'head4', emoji: '🐙', color: 'bg-blue-500', name: 'Octopus Head' },
          { id: 'head5', emoji: '🦈', color: 'bg-gray-500', name: 'Shark Head' },
          { id: 'head6', emoji: '🐠', color: 'bg-orange-500', name: 'Fish Head' }
        ],
        bodies: [
          { id: 'body4', emoji: '🌊', color: 'bg-cyan-400', name: 'Wave Body' },
          { id: 'body5', emoji: '⚓', color: 'bg-blue-600', name: 'Anchor Body' },
          { id: 'body6', emoji: '💙', color: 'bg-blue-300', name: 'Ocean Heart' }
        ],
        arms: [
          { id: 'arm4', emoji: '🦀', color: 'bg-red-500', name: 'Crab Claw' },
          { id: 'arm5', emoji: '🔱', color: 'bg-blue-700', name: 'Trident Arm' },
          { id: 'arm6', emoji: '🐚', color: 'bg-pink-300', name: 'Shell Arm' }
        ],
        legs: [
          { id: 'leg4', emoji: '🐟', color: 'bg-teal-400', name: 'Fin Leg' },
          { id: 'leg5', emoji: '🌊', color: 'bg-cyan-500', name: 'Wave Leg' },
          { id: 'leg6', emoji: '⭐', color: 'bg-yellow-400', name: 'Starfish Leg' }
        ]
      }
    },
    jungle: {
      name: '🌿 Jungle Adventure',
      bg: 'from-green-400 via-lime-500 to-yellow-500',
      parts: {
        heads: [
          { id: 'head7', emoji: '🐵', color: 'bg-amber-600', name: 'Monkey Head' },
          { id: 'head8', emoji: '🦜', color: 'bg-red-500', name: 'Parrot Head' },
          { id: 'head9', emoji: '🐸', color: 'bg-green-500', name: 'Frog Head' }
        ],
        bodies: [
          { id: 'body7', emoji: '🌳', color: 'bg-green-600', name: 'Tree Body' },
          { id: 'body8', emoji: '🍃', color: 'bg-lime-500', name: 'Leaf Body' },
          { id: 'body9', emoji: '🌺', color: 'bg-pink-500', name: 'Flower Body' }
        ],
        arms: [
          { id: 'arm7', emoji: '🐍', color: 'bg-green-700', name: 'Snake Arm' },
          { id: 'arm8', emoji: '🌿', color: 'bg-green-400', name: 'Vine Arm' },
          { id: 'arm9', emoji: '🥥', color: 'bg-amber-700', name: 'Coconut Arm' }
        ],
        legs: [
          { id: 'leg7', emoji: '🦎', color: 'bg-lime-600', name: 'Lizard Leg' },
          { id: 'leg8', emoji: '🌱', color: 'bg-green-300', name: 'Sprout Leg' },
          { id: 'leg9', emoji: '🍌', color: 'bg-yellow-500', name: 'Banana Leg' }
        ]
      }
    }
  }), []);

  // Memoized robot command list (Removed 'flex' and 'bow' as requested)
  const robotCommands = useMemo(() => [
    // CUSTOM ACTIONS
    { id: 'wave', name: 'Wave Hello', message: '👋 Hello there! Nice to meet you!', animation: 'animate-wave-shake', duration: 3000 },
    { id: 'dance', name: 'Dance Party', message: '💃 Let\'s boogie! Dancing makes me happy!', animation: 'animate-dance-body', duration: 3000 },
    { id: 'jump', name: 'Super Jump', message: '⬆️ Wheee! Look how high I can jump!', animation: 'animate-jump-and-return', duration: 3000 },
    { id: 'spin', name: 'Tornado Spin', message: '🌪️ Spinning like a tornado! Woooosh!', animation: 'animate-spin-360', duration: 3000 },
    { id: 'think', name: 'Brain Power', message: '🧠 Computing... Processing... Got it!', animation: 'animate-think-head', duration: 3000 },
    { id: 'celebrate', name: 'Victory Dance', message: '🎉 We did it! Time to celebrate!', animation: 'animate-victory-wiggle', duration: 3000 },
    // GENERIC ACTIONS (Reduced for simplicity)
    { id: 'laugh', name: 'Giggle Mode', message: '😂 Hehehe! That tickles my circuits!', animation: 'animate-laugh-shiver', duration: 3000 },
    { id: 'fly', name: 'Pretend Flight', message: '✈️ Zoom zoom! Flying through the clouds!', animation: 'translate-y-[-4rem]', duration: 3000 },
    { id: 'sleep', name: 'Power Nap', message: '😴 Zzz... Recharging my batteries...', animation: 'opacity-50', duration: 3000 },
    { id: 'surprise', name: 'Big Surprise', message: '😲 WOW! That\'s absolutely amazing!', animation: 'scale-125', duration: 3000 },
  ], []);

  // --- Define executeCommand first to prevent ReferenceError ---
  const executeCommand = useCallback((commandId) => {
    if (!isComplete) {
      setRobotMessage('🔧 Please build me first before giving commands!');
      return;
    }

    const command = robotCommands.find(cmd => cmd.id === commandId);
    if (command) {
      // 1. Scroll the robot into view immediately
      if (robotRef.current) {
        robotRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // 2. Set the action on the main robot container
      setCurrentAction(commandId); 
      setRobotMessage(command.message);
      
      // 3. Reset action after duration
      setTimeout(() => {
        setCurrentAction('idle'); 
        const responses = [
          'That was so much fun! What\'s next?',
          'I love doing that! Give me another command!',
          'Awesome! I\'m getting better at this!',
          'That made my circuits happy! More please!',
          'What should I try next? I\'m ready!'
        ];
        setRobotMessage(responses[Math.floor(Math.random() * responses.length)]);
      }, command.duration);
    }
  }, [isComplete, robotCommands]);
  // --- End executeCommand definition ---

  // --- Check completion after state update ---
  useEffect(() => {
    const allPartsPresent = Object.values(robotParts).every(part => part !== null);
    
    if (allPartsPresent && !isComplete) {
      setIsComplete(true);
      setCompletedRobots(prev => prev + 1);
      setRobotMessage('🎉 AMAZING! I\'m complete! What should I call myself?');
      executeCommand('celebrate'); // Automatically celebrate
      setTimeout(() => {
        setCurrentAction('idle');
        setRobotMessage('Now you can give me commands! What would you like me to do?');
      }, 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [robotParts, isComplete]); 

  // --- Quiz Logic ---
  const handlePartClick = (part, category) => {
    // 1. Set the part to be selected
    setSelectedPart({ part, category });
    
    // 2. Generate a new quiz
    const newQuiz = generateQuiz();
    setQuiz(newQuiz);
    setQuizInput('');
    setQuizStatus(null);
    
    // 3. Open the quiz modal
    setRobotMessage(`💡 To use the **${part.name}**, solve this challenge first:`);
  };

  const submitQuiz = () => {
    if (!quiz) return;

    const correct = parseInt(quizInput) === quiz.answer;
    setQuizStatus(correct ? 'correct' : 'incorrect');

    if (correct) {
      setRobotMessage(`✅ Correct! You earned the **${selectedPart.part.name}**! Now click where to place it!`);
      // Quiz remains open until dismissed, but selectedPart is now active
    } else {
      setRobotMessage(`❌ Incorrect. Try again! What is ${quiz.question}?`);
      setTimeout(() => {
        setQuiz(generateQuiz()); // Generate a new quiz for next try
        setQuizInput('');
        setQuizStatus(null);
      }, 2000);
    }
  };

  const handleSlotClick = useCallback((targetSlot) => {
    // Only allow placement if a part is selected AND the quiz was solved correctly
    if (!selectedPart || !quiz || quizStatus !== 'correct') {
      setRobotMessage('👆 First, select a part and solve the math challenge to unlock it!');
      return;
    }

    const { part, category } = selectedPart;
    
    // Mapping part categories to their valid assembly slots
    const validPlacements = {
      head: 'heads',
      body: 'bodies',
      leftArm: 'arms',
      rightArm: 'arms',
      leftLeg: 'legs',
      rightLeg: 'legs'
    };

    if (validPlacements[targetSlot] === category) {
      // Place the part
      setRobotParts(prev => ({
        ...prev,
        [targetSlot]: part
      }));
      
      // Reset selection and quiz state
      setSelectedPart(null);
      setQuiz(null); // Close the quiz
      setRobotMessage('🎯 Perfect fit! Keep building me!');
      
    } else {
      setRobotMessage('🚫 Oops! That part doesn\'t go there. Try a different spot!');
      setTimeout(() => {
        setRobotMessage(`Click where you want to place the ${part.name}!`);
      }, 2000);
    }
  }, [selectedPart, quiz, quizStatus]);


  const resetRobot = () => {
    setRobotParts({
      head: null,
      body: null,
      leftArm: null,
      rightArm: null,
      leftLeg: null,
      rightLeg: null
    });
    setIsComplete(false);
    setCurrentAction('idle');
    setRobotMessage('Hi! Click on parts to build me, then give me commands!');
    setSelectedCommand('');
    setSelectedPart(null);
    setRobotName('');
    setQuiz(null); // Clear quiz state on reset
    setQuizStatus(null);
    setQuizInput('');
  };

  const switchTheme = (themeKey) => {
    setCurrentTheme(themeKey);
    resetRobot();
    setRobotMessage(`Welcome to ${themes[themeKey].name}! Let's build an awesome robot!`);
  };

  /**
   * Applies custom CSS animation class based on the current command.
   */
  const getRobotAnimationClass = () => {
    switch (currentAction) {
      case 'wave':
        return 'animate-wave-shake'; // Wave Hello: Subtle side shake (for hands)
      case 'dance':
        return 'animate-dance-body'; // Dance Party: Distinct side-to-side tilt
      case 'jump':
        return 'animate-jump-and-return'; // Super Jump: Big jump
      case 'spin':
        return 'animate-spin-360'; // Tornado Spin: Full 360 spin
      case 'laugh':
        return 'animate-laugh-shiver'; // Giggle Mode: Fast, small side-to-side shake
      case 'think':
        return 'animate-think-head'; // Brain Power: Gentle vertical nod (shake head)
      case 'celebrate':
        return 'animate-victory-wiggle'; // Victory Dance: Unique bounce and slight rotation
      case 'fly':
        return 'translate-y-[-4rem] shadow-2xl transition-transform duration-500'; // Pretend Flight
      case 'sleep':
        return 'opacity-50 transition-opacity duration-500'; // Power Nap
      case 'surprise':
        return 'scale-125 transition-transform duration-500'; // Big Surprise
      default:
        return '';
    }
  };


  const currentParts = themes[currentTheme].parts;

  // Component for displaying a selectable part
  const PartItem = ({ part, category }) => (
    <div
      onClick={() => handlePartClick(part, category)}
      className={`${part.color} p-3 rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-xl border-2 border-white select-none ${
        selectedPart && selectedPart.part.id === part.id && quizStatus !== 'correct' ? 'ring-4 ring-red-400 scale-105' : '' // Highlight red if quiz is pending
      } ${
        selectedPart && selectedPart.part.id === part.id && quizStatus === 'correct' ? 'ring-4 ring-green-400 scale-105' : '' // Highlight green if quiz is correct
      }`}
    >
      <div className="text-2xl mb-1 text-center pointer-events-none">{part.emoji}</div>
      <div className="text-white text-xs font-bold text-center pointer-events-none">{part.name}</div>
    </div>
  );

  // Component for displaying an assembly slot
  const DropZone = ({ slot, label, className = "" }) => {
    const isValidTarget = selectedPart && quizStatus === 'correct' &&
      ((slot === 'head' && selectedPart.category === 'heads') ||
       (slot === 'body' && selectedPart.category === 'bodies') ||
       ((slot === 'leftArm' || slot === 'rightArm') && selectedPart.category === 'arms') ||
       ((slot === 'leftLeg' || slot === 'rightLeg') && selectedPart.category === 'legs'));

    return (
      <div
        onClick={() => handleSlotClick(slot)}
        className={`w-20 h-20 border-4 border-dashed rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
          isValidTarget
            ? 'border-green-500 bg-green-100 animate-pulse-slow shadow-lg' // Highlight valid target
            : selectedPart
              ? 'border-red-300 bg-red-50' // Highlight non-valid target when part is selected
              : robotParts[slot]
                ? 'border-blue-400 bg-blue-50' // Highlight occupied slot
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50' // Default empty slot
        } ${className}`}
      >
        {robotParts[slot] ? (
          <div className={`${robotParts[slot].color} p-2 rounded-lg w-full h-full flex items-center justify-center`}>
            <span className="text-2xl">{robotParts[slot].emoji}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-xs font-semibold text-center px-1">{label}</span>
        )}
      </div>
    );
  };

  // --- Welcome Screen Render ---
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 flex items-center justify-center p-4 font-['Inter']">
        <div className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🤖🧠✨</div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Super Robot Builder & <span className="text-red-500">Math Challenge!</span>
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Create amazing robots, and prove your engineering skills by solving slightly **more advanced math problems** to unlock parts!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-2xl p-6 text-center shadow-md">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-xl font-bold text-blue-800 mb-2">3 Cool Themes</h3>
              <p className="text-blue-600">Space, Ocean, and Jungle adventures with unique parts!</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-6 text-center shadow-md">
              <div className="text-4xl mb-3">➗</div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Advanced Math</h3>
              <p className="text-red-600">Solve multiplication, two-digit math, or two-step problems!</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-6 text-center shadow-md">
              <div className="text-4xl mb-3">🎮</div>
              <h3 className="text-xl font-bold text-green-800 mb-2">10 Clean Commands</h3>
              <p className="text-green-600">Make your robot dance, jump, laugh, and more!</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-yellow-50 rounded-xl p-4 flex items-center shadow-sm">
              <Star className="text-yellow-600 w-8 h-8 mr-3" />
              <div>
                <h4 className="font-bold text-yellow-800">Perfect for Ages 7-12</h4>
                <p className="text-yellow-600 text-sm">Combines creativity with educational challenges.</p>
              </div>
            </div>
            <div className="bg-pink-50 rounded-xl p-4 flex items-center shadow-sm">
              <Lightbulb className="text-pink-600 w-8 h-8 mr-3" />
              <div>
                <h4 className="font-bold text-pink-800">STEM Learning</h4>
                <p className="text-pink-600 text-sm">Builds logical thinking and core math skills.</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowWelcome(false)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl text-xl flex items-center gap-3 mx-auto transform hover:scale-105 transition-all duration-200 shadow-xl"
            >
              <Sparkles className="w-6 h-6" />
              Start Building & Calculating!
              <Sparkles className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main App Render ---
  return (
    <div className={`min-h-screen bg-gradient-to-br ${themes[currentTheme].bg} p-4 font-['Inter']`}>
      {/* Custom CSS Animations for a more engaging robot experience */}
      <style>{`
        /* --- General Animations (Jump, Spin, Pulse) --- */
        @keyframes jump-and-return {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        .animate-jump-and-return {
          animation: jump-and-return 1s ease-in-out;
        }

        @keyframes spin-360 {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-360 {
            animation: spin-360 1s ease-out forwards;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 1.5s infinite ease-in-out;
        }

        /* 1. Dance Party (Side Tilt) */
        @keyframes dance-move {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(3deg); }
          75% { transform: translateY(-5px) rotate(-3deg); }
        }
        .animate-dance-body {
            animation: dance-move 0.5s infinite ease-in-out;
        }
        
        /* 2. Giggle Mode (Fast Shiver) */
        @keyframes laugh-shiver {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-laugh-shiver {
          animation: laugh-shiver 0.3s infinite;
        }

        /* 3. Victory Dance (Bounce + Wiggle) - UNIQUE DANCE */
        @keyframes victory-wiggle {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-10px) rotate(5deg); }
            75% { transform: translateY(0px) rotate(-5deg); }
        }
        .animate-victory-wiggle {
            animation: victory-wiggle 0.7s infinite ease-in-out;
        }

        /* 4. Wave Hello (Subtle Arm/Body Shake) - SHAKE HANDS */
        @keyframes wave-shake {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(3px); }
        }
        .animate-wave-shake {
            animation: wave-shake 0.5s infinite alternate;
        }
        
        /* 5. Brain Power (Small Head Shake/Nod) - SHAKE BRAIN */
        @keyframes think-head-nod {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
        .animate-think-head {
            animation: think-head-nod 1s infinite alternate;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🤖</div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Super Robot Builder</h1>
                <p className="text-sm text-gray-600">{themes[currentTheme].name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Robot Counter */}
              <div className="flex items-center gap-2 bg-yellow-100 px-3 py-2 rounded-lg shadow-inner">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 font-semibold">{completedRobots} robots built!</span>
              </div>
              
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-md ${soundEnabled ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Volume2 className="w-4 h-4" />
                Sound {soundEnabled ? 'On' : 'Off'}
              </button>
              
              {/* Home Button */}
              <button
                onClick={() => setShowWelcome(true)}
                className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-purple-200 transition-colors shadow-md"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-xl">
          <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">🌟 Choose Your Adventure Theme</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => switchTheme(key)}
                className={`p-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 border-2 ${
                  currentTheme === key 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105 shadow-lg border-purple-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Robot Assembly & Command Feedback (Column 1) */}
          <div 
            ref={robotRef} // Attach ref for scrolling
            className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-yellow-300 flex flex-col items-center"
          >
            <div className="w-full flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-purple-600 flex items-center">
                <Sparkles className="w-6 h-6 mr-2" />
                Your Robot
              </h2>
              <button
                onClick={resetRobot}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-semibold flex items-center transition-colors text-sm shadow-md"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Robot
              </button>
            </div>
            
            {/* Robot Name Input */}
            {isComplete && (
              <div className="w-full mb-4">
                <input
                  type="text"
                  placeholder="What's your robot's name?"
                  value={robotName}
                  onChange={(e) => setRobotName(e.target.value)}
                  className="w-full p-3 border-2 border-blue-300 rounded-lg font-semibold text-center focus:border-blue-500 focus:outline-none shadow-inner"
                  maxLength={20}
                />
              </div>
            )}
            
            {/* Selected Part Indicator - shown only when unlocked part is ready for placement */}
            {selectedPart && quizStatus === 'correct' && (
              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-3 mb-4 text-center w-full">
                <p className="text-yellow-800 font-semibold text-sm">
                  Unlocked: <span className={`${selectedPart.part.color} text-white px-2 py-1 rounded font-bold`}>
                    {selectedPart.part.emoji} {selectedPart.part.name}
                  </span>
                </p>
                <p className="text-yellow-700 text-xs mt-1">✨ Click on the matching empty slot to place it!</p>
              </div>
            )}
            
            {/* Robot Assembly - Apply Animation Class Here */}
            <div className={`flex flex-col items-center space-y-4 mb-6 ${getRobotAnimationClass()} p-4 transition-all duration-500`}>
              <DropZone slot="head" label="Head" className="w-24 h-24" />
              <div className="flex items-center space-x-4">
                <DropZone slot="leftArm" label="L-Arm" className="w-20 h-20" />
                <DropZone slot="body" label="Body" className="w-28 h-28" />
                <DropZone slot="rightArm" label="R-Arm" className="w-20 h-20" />
              </div>
              <div className="flex space-x-8">
                <DropZone slot="leftLeg" label="L-Leg" className="w-20 h-20" />
                <DropZone slot="rightLeg" label="R-Leg" className="w-20 h-20" />
              </div>
            </div>

            {/* Speech Bubble / Quiz Area */}
            <div className="w-full bg-gradient-to-r from-blue-100 to-purple-100 border-4 border-blue-300 rounded-2xl p-4 relative shadow-lg mt-auto">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-100 border-l-4 border-t-4 border-blue-300 rotate-45"></div>
              <div className="flex items-start">
                <Volume2 className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  {(robotName || isComplete) && (
                    <p className="text-purple-700 font-bold text-sm mb-1">{robotName || 'Robot'} says:</p>
                  )}
                  <p className="text-blue-800 font-semibold text-sm">
                    {robotMessage}
                  </p>
                </div>
              </div>

              {/* Quiz Component */}
              {quiz && quizStatus !== 'correct' && (
                <div className="mt-4 p-3 bg-white rounded-lg shadow-inner border-2 border-red-200">
                  <h4 className="font-bold text-lg text-gray-800 mb-2 flex items-center justify-center">
                    {quizStatus === 'incorrect' ? <XCircle className="w-5 h-5 text-red-500 mr-2" /> : <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />}
                    Math Challenge!
                  </h4>
                  <p className="text-center text-xl font-extrabold text-red-600 mb-3">{quiz.question} = ?</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      pattern="[0-9]*"
                      placeholder="Your Answer"
                      value={quizInput}
                      onChange={(e) => setQuizInput(e.target.value)}
                      className="flex-1 p-2 border-2 border-gray-300 rounded-lg text-center font-bold focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={submitQuiz}
                      disabled={!quizInput}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-md"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
              {/* End Quiz Component */}
            </div>
          </div>

          {/* Parts Selection (Column 2) */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-blue-300 lg:col-span-1">
            <h2 className="text-xl md:text-2xl font-bold text-blue-600 mb-6 text-center">
              🔧 Robot Parts 🔧
            </h2>
            <p className="text-center text-gray-600 text-sm mb-4 font-semibold">
              👆 Click a part to start its **Math Challenge** and unlock it!
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2 border-b pb-1 border-gray-200">Heads ({robotParts.head ? '1/1' : '0/1'})</h3>
                <div className="grid grid-cols-3 gap-3">
                  {currentParts.heads.map(part => <PartItem key={part.id} part={part} category="heads" />)}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2 border-b pb-1 border-gray-200">Bodies ({robotParts.body ? '1/1' : '0/1'})</h3>
                <div className="grid grid-cols-3 gap-3">
                  {currentParts.bodies.map(part => <PartItem key={part.id} part={part} category="bodies" />)}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2 border-b pb-1 border-gray-200">Arms ({robotParts.leftArm && robotParts.rightArm ? '2/2' : (robotParts.leftArm || robotParts.rightArm ? '1/2' : '0/2')})</h3>
                <div className="grid grid-cols-3 gap-3">
                  {currentParts.arms.map(part => <PartItem key={part.id} part={part} category="arms" />)}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2 border-b pb-1 border-gray-200">Legs ({robotParts.leftLeg && robotParts.rightLeg ? '2/2' : (robotParts.leftLeg || robotParts.rightLeg ? '1/2' : '0/2')})</h3>
                <div className="grid grid-cols-3 gap-3">
                  {currentParts.legs.map(part => <PartItem key={part.id} part={part} category="legs" />)}
                </div>
              </div>
            </div>
          </div>

          {/* Command Center (Column 3) */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-green-300 lg:col-span-1">
            <h2 className="text-xl md:text-2xl font-bold text-green-600 mb-6 text-center flex items-center justify-center">
              <Play className="w-6 h-6 mr-2" />
              🎮 Command Center
            </h2>

            <div className="mb-4">
              <label className="block text-lg font-bold text-gray-700 mb-3">
                Choose a command:
              </label>
              <select
                value={selectedCommand}
                onChange={(e) => setSelectedCommand(e.target.value)}
                className="w-full p-3 border-4 border-gray-300 rounded-xl text-base font-semibold focus:border-blue-400 focus:outline-none shadow-inner"
                disabled={!isComplete}
              >
                <option value="">🎯 Select an awesome action...</option>
                {robotCommands.map((command) => (
                  <option key={command.id} value={command.id}>
                    {command.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                if (selectedCommand) {
                  executeCommand(selectedCommand);
                }
              }}
              disabled={!isComplete || !selectedCommand}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold text-lg transition-colors flex items-center justify-center mb-6 shadow-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Execute Command!
            </button>

            {/* Quick Action Buttons - Now only showing the working commands */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-700 mb-3 text-center border-b pb-1 border-gray-200">
                ⚡ Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {/* Display the first 8 commands from the clean list */}
                {robotCommands.slice(0, 8).map((command) => (
                  <button
                    key={command.id}
                    onClick={() => executeCommand(command.id)}
                    disabled={!isComplete}
                    className="bg-blue-400 hover:bg-blue-500 disabled:bg-gray-300 text-white px-2 py-2 rounded-lg font-semibold text-sm transition-colors disabled:cursor-not-allowed shadow-md"
                  >
                    {command.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
