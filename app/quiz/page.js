"use client";
/************************************************************************
 * OLIPOP Apothecary-Style Quiz Page
 * Features a mint-sage (#fae3e5) question card, cream selection buttons,
 * and a personalized results page with a visual flavor-locked box stack.
 ************************************************************************/

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import ScrollReveal from '../components/ScrollReveal';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    title: "How would you describe your typical flow volume on your heaviest days?",
    options: [
      { text: "Light - Spotting or occasional drops", points: { Regular: 3, Large: 1 } },
      { text: "Medium - Steady but manageable flow", points: { Regular: 1, Large: 3, XL: 1 } },
      { text: "Heavy - Rapid soaking, needing frequent changes", points: { Large: 1, XL: 3, Overnight: 1 } },
      { text: "Gushing - Intense flow that feels hard to control", points: { XL: 1, Overnight: 3 } }
    ]
  },
  {
    id: 2,
    title: "Where do you experience leaks most frequently?",
    options: [
      { text: "Mainly in the center/sides of the pad", points: { Regular: 2, Large: 2 } },
      { text: "Front or back overflow during active hours", points: { Large: 1, XL: 3 } },
      { text: "At night, leaking from the rear while lying down", points: { Overnight: 4 } },
      { text: "Hardly ever leak, just looking for comfort", points: { Regular: 3, Large: 1 } }
    ]
  },
  {
    id: 3,
    title: "What is your main priority during your cycle?",
    options: [
      { text: "Zero skin irritation, soft organic cotton texture", points: { Regular: 2, Large: 2 } },
      { text: "Ultra-thin profile so it feels like wearing nothing", points: { Regular: 3, Large: 1 } },
      { text: "Maximum area coverage to run/exercise worry-free", points: { XL: 3, Overnight: 1 } },
      { text: "Total overnight safety for uninterrupted sleep", points: { Overnight: 4 } }
    ]
  },
  {
    id: 4,
    title: "What is your typical physical activity profile on your period?",
    options: [
      { text: "Mild - Mostly seated desk work or relaxing", points: { Regular: 3, Overnight: 1 } },
      { text: "Active - Walking, running errands, moderate chores", points: { Regular: 1, Large: 3, XL: 1 } },
      { text: "High intensity - Workouts, sports, lifting, or long shifts", points: { Large: 1, XL: 3 } },
      { text: "Resting - Sleeping or lying in bed", points: { Overnight: 4 } }
    ]
  }
];

export default function Quiz() {
  const router = useRouter();
  const { addToCart, user } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const handleSelectOption = (points) => {
    const nextAnswers = [...answers, points];
    setAnswers(nextAnswers);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      calculateResult(nextAnswers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setAnswers(answers.slice(0, -1));
      setCurrentStep(prev => prev - 1);
    }
  };

  const calculateResult = (finalAnswers) => {
    const scores = {
      Regular: 0,
      Large: 0,
      XL: 0,
      Overnight: 0
    };

    finalAnswers.forEach(answer => {
      Object.entries(answer).forEach(([size, pts]) => {
        scores[size] = (scores[size] || 0) + pts;
      });
    });

    // Determine the user's primary need
    let primarySize = 'Regular';
    let highestScore = -1;
    Object.entries(scores).forEach(([size, score]) => {
      if (score > highestScore) {
        highestScore = score;
        primarySize = size;
      }
    });

    // Create a personalized 20-pad custom mix based on the score patterns
    let mix = { Regular: 0, Large: 0, XL: 0, Overnight: 0 };
    
    if (primarySize === 'Regular') {
      mix.Regular = 10;
      mix.Large = 5;
      mix.XL = 5;
      mix.Overnight = 0;
    } else if (primarySize === 'Large') {
      mix.Regular = 5;
      mix.Large = 10;
      mix.XL = 5;
      mix.Overnight = 0;
    } else if (primarySize === 'XL') {
      mix.Regular = 0;
      mix.Large = 5;
      mix.XL = 10;
      mix.Overnight = 5;
    } else {
      mix.Regular = 5;
      mix.Large = 5;
      mix.XL = 5;
      mix.Overnight = 5;
    }

    const totalPads = Object.values(mix).reduce((a, b) => a + b, 0);

    const getPadUnitPrice = (size) => {
      switch (size) {
        case 'Regular': return 19.9;
        case 'Large': return 24.9;
        case 'XL': return 29.9;
        case 'Overnight': return 34.9;
        default: return 20;
      }
    };

    const rawPrice = Object.entries(mix).reduce((sum, [size, qty]) => {
      return sum + (qty * getPadUnitPrice(size));
    }, 0);

    const discount = totalPads >= 20 ? rawPrice * 0.10 : 0;
    const finalPrice = Math.round(rawPrice - discount);

    setResult({
      isBundle: true,
      name: "Your Custom Comfi Pack",
      badge: "PERSONALIZED HYGIENE MIX",
      mix,
      price: finalPrice,
      rawPrice: Math.round(rawPrice),
      discount: Math.round(discount),
      primarySize,
      desc: `Based on your cycle profile, a single pad size won't cover everything. We've built a personalized 20-pad pack for you: ${mix.Regular > 0 ? `${mix.Regular} Regular, ` : ''}${mix.Large > 0 ? `${mix.Large} Large, ` : ''}${mix.XL > 0 ? `${mix.XL} XL, ` : ''}${mix.Overnight > 0 ? `${mix.Overnight} Overnight` : ''}. This mix covers light, active, and sleeping hours, and automatically qualifies you for our 10% bundle discount!`
    });
  };

  const handleAddToCart = () => {
    if (!user) {
      alert("Please log in or sign up to add the recommended pack to your cart.");
      router.push(`/account?redirect=${encodeURIComponent('/quiz')}`);
      return;
    }

    const bundleItem = {
      id: `quiz_recommendation_${Date.now()}`,
      name: `Comfi Custom Box - ${result.name}`,
      size: "Custom Mix",
      packCount: 20,
      price: result.price,
      stock: 100
    };

    const details = Object.entries(result.mix).reduce((acc, [size, qty]) => {
      if (qty > 0) acc[size] = qty;
      return acc;
    }, {});

    addToCart(bundleItem, 1, details);
    alert("Recommended Custom Bundle has been added to your cart!");
    router.push('/cart');
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResult(null);
  };

  return (
    <div className="bg-[#fdf7e7] min-h-[85vh] py-12 px-6 md:px-12 flex items-center justify-center select-none">
      <div className="max-w-xl w-full">
        
        {!result ? (
          /* Quiz Questionnaire UI (mint sage background card) */
          <div className="bg-[#fae3e5] rounded-3xl p-8 border border-[#d0385c]/10 relative overflow-hidden shadow-xs">
            
            {/* Progress indicators */}
            <div className="flex gap-2 mb-6">
              {QUIZ_QUESTIONS.map((q, idx) => (
                <div 
                  key={q.id} 
                  className={`h-1.5 flex-1 rounded transition-all duration-500 ${
                    idx <= currentStep ? 'bg-[#d0385c]' : 'bg-[#d0385c]/10'
                  }`}
                />
              ))}
            </div>

            {/* Back button */}
            {currentStep > 0 && (
              <button 
                onClick={handleBack}
                className="flex items-center gap-1 text-xs font-bold text-[#3a3a3a]/60 hover:text-[#d0385c] mb-4 transition-colors cursor-pointer"
              >
                <ArrowLeft size={12} /> BACK
              </button>
            )}

            {/* Question Text */}
            <ScrollReveal key={currentStep}>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#7e0022] uppercase block mb-2">Question {currentStep + 1} of 4</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#d0385c] mb-6 leading-tight">
                {QUIZ_QUESTIONS[currentStep].title}
              </h2>

              {/* Options buttons styled as cream cards */}
              <div className="flex flex-col gap-3">
                {QUIZ_QUESTIONS[currentStep].options.map((opt, i) => {
                  const hasDash = opt.text.includes(' - ');
                  const [title, desc] = hasDash ? opt.text.split(' - ') : [null, opt.text];
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(opt.points)}
                      className="w-full text-left bg-[#fdf7e7] hover:bg-[#d0385c]/10 border border-[#d0385c]/10 p-5 rounded-2xl transition-all duration-300 hover:scale-[1.01] hover:border-[#d0385c]/30 active:scale-[0.99] group shadow-2xs flex flex-col gap-1 cursor-pointer animate-fade-in"
                    >
                      {title ? (
                        <>
                          <span className="font-bold text-sm text-[#d0385c] transition-colors">{title}</span>
                          <span className="text-xs text-[#3a3a3a]/80 leading-relaxed font-light font-sans">{desc}</span>
                        </>
                      ) : (
                        <span className="font-bold text-sm text-[#d0385c] leading-relaxed font-light font-sans">{desc}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollReveal>

          </div>
        ) : (
          /* Recommendation Screen (mint sage card background) */
          <ScrollReveal className="bg-[#fae3e5] rounded-3xl p-8 border border-[#d0385c]/15 text-center relative overflow-hidden shadow-xs">
            
            {/* Sparkles Celebration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              <div className="absolute top-8 left-8 text-[#7e0022] animate-float" style={{ animationDelay: '0s', animationDuration: '3.5s' }}><Sparkles size={16} /></div>
              <div className="absolute top-16 right-16 text-[#d0385c] animate-float" style={{ animationDelay: '1s', animationDuration: '4.8s' }}><Sparkles size={20} /></div>
              <div className="absolute bottom-16 left-12 text-[#d0385c] animate-float" style={{ animationDelay: '0.5s', animationDuration: '4.2s' }}><Sparkles size={24} /></div>
              <div className="absolute bottom-24 right-10 text-[#7e0022] animate-float" style={{ animationDelay: '1.8s', animationDuration: '5.5s' }}><Sparkles size={14} /></div>
            </div>

            <div className="w-16 h-16 rounded-full bg-[#d0385c]/10 flex items-center justify-center text-[#d0385c] mx-auto mb-6 shadow-2xs">
              <Sparkles size={28} />
            </div>

            <span className="text-[10px] font-bold tracking-[0.25em] text-[#7e0022] uppercase block mb-2">
              {result.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#d0385c] mb-4 uppercase tracking-tighter">
              {result.name}
            </h2>

            {/* Visual box stack preview (cream card background) */}
            <div className="my-6 max-w-xs mx-auto border border-[#d0385c]/15 rounded-2xl p-4 bg-[#fdf7e7] flex flex-col gap-1.5 shadow-2xs">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#3a3a3a]/45 mb-2 block">Box Breakdown</span>
              {Object.entries(result.mix).map(([size, qty]) => {
                if (qty === 0) return null;
                const color = size === 'Regular' ? 'bg-[#fdf4b5] text-[#d0385c]' : size === 'Large' ? 'bg-[#a9df71] text-[#d0385c]' : size === 'XL' ? 'bg-[#febac4] text-[#d0385c]' : 'bg-[#e3d2ed] text-[#d0385c]';
                return (
                  <div key={size} className={`${color} py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase shadow-2xs border border-[#d0385c]/10 flex justify-between px-4`}>
                    <span>{size}</span>
                    <span>{qty} PADS</span>
                  </div>
                );
              })}
            </div>

            {/* Price section (cream card background) */}
            <div className="bg-[#fdf7e7] p-6 rounded-2xl border border-[#d0385c]/10 mb-6 max-w-sm mx-auto shadow-2xs flex justify-between items-center px-8">
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#3a3a3a]/40">Total Price</div>
                <div className="text-2xl font-serif font-black text-[#d0385c]">₹{result.price}</div>
              </div>
              <div className="text-right">
                <span className="text-xs line-through text-[#3a3a3a]/40 block">₹{result.rawPrice}</span>
                <span className="text-[9px] font-bold uppercase text-white bg-[#7e0022] px-2 py-0.5 rounded">10% OFF</span>
              </div>
            </div>

            <p className="text-sm text-[#3a3a3a]/80 leading-relaxed font-light mb-8 max-w-md mx-auto font-sans">
              {result.desc}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button
                onClick={handleAddToCart}
                className="bg-[#d0385c] text-white hover:bg-[#5c0018] px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Add Recommended Box
              </button>
              <button
                onClick={handleReset}
                className="bg-[#fdf7e7] text-[#d0385c] border border-[#d0385c]/15 px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-2xs hover:bg-[#d0385c]/10"
              >
                Retake Quiz
              </button>
            </div>

          </ScrollReveal>
        )}

      </div>
    </div>
  );
}
