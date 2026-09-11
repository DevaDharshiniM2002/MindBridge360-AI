import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Heart,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  Clock,
  Lightbulb,
  Send,
  Languages,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AppLanguage, ParentMessageTemplate } from '../types';

interface ParentToolkitViewProps {
  language: AppLanguage;
}

const SCENARIOS = [
  { id: 'burnout', label: 'Exhaustion & Needing Rest', desc: 'Explaining study burnout without sounding lazy' },
  { id: 'counselling', label: 'Seeing a Campus Counsellor', desc: 'Framing therapy/counselling as healthy coaching' },
  { id: 'grades', label: 'Handling Lower Marks / Arrear', desc: 'Discussing exam setbacks with focus on recovery' },
  { id: 'placements', label: 'Placement / Non-Tech Career Path', desc: 'Communicating alternative career choices respectfully' },
  { id: 'hostel-stress', label: 'Hostel & Commute Fatigue', desc: 'Expressing loneliness or food stress constructively' },
];

const PARENT_DYNAMICS = [
  { id: 'traditional', label: 'Traditional / Strict Academic Focus', desc: 'Respectful, emphasizes dedication & discipline' },
  { id: 'worried', label: 'Loving but Easily Anxious', desc: 'Reassuring, minimizes panic, highlights support' },
  { id: 'open', label: 'Open & Friendly', desc: 'Direct, honest, conversational' },
];

export const ParentToolkitView: React.FC<ParentToolkitViewProps> = ({ language: initialLang }) => {
  const [selectedScenario, setSelectedScenario] = useState('burnout');
  const [parentStyle, setParentStyle] = useState('traditional');
  const [customNotes, setCustomNotes] = useState('');
  const [targetLang, setTargetLang] = useState<AppLanguage>(initialLang);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<ParentMessageTemplate | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate on first mount with defaults
  React.useEffect(() => {
    handleGenerate();
  }, [selectedScenario, parentStyle, targetLang]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/parent-toolkit/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedScenario,
          customDetails: customNotes,
          language: targetLang,
          parentStyle,
        }),
      });

      const data = await res.json();
      setGeneratedResult(data);
    } catch (err) {
      console.error('Parent toolkit generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedResult?.message) {
      navigator.clipboard.writeText(generatedResult.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-[#E8E4D9] shadow-sm space-y-3">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-[#D1E5E6]/50 rounded-[22px] border border-[#4A8B8D]/20 text-[#4A8B8D]">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif italic text-2xl sm:text-3xl font-normal text-[#2D2D2B]">
                "Explain This to My Parents" Toolkit
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-[#F5D5CB] text-[#A84832] rounded-full border border-[#E98A72]/30">
                AI Guided
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#7A756D] mt-1 leading-relaxed">
              Softens and de-stigmatizes your college experience for Indian parents in respectful, culturally resonant terms.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-[#E8E4D9] shadow-sm space-y-6">
        {/* Language selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E4D9]">
          <label className="text-xs font-bold uppercase tracking-wider text-[#7A756D] flex items-center gap-2">
            <Languages className="w-4 h-4 text-[#4A8B8D]" />
            Message Language
          </label>
          <div className="inline-flex bg-[#F0EDE4] p-1 rounded-full border border-[#E8E4D9] self-start sm:self-auto">
            {[
              { id: 'en', label: 'English' },
              { id: 'ta', label: 'தமிழ் (Tamil)' },
              { id: 'tanglish', label: 'Tanglish' },
            ].map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setTargetLang(l.id as AppLanguage)}
                className={`px-3.5 py-1 text-xs rounded-full font-semibold transition-all cursor-pointer ${
                  targetLang === l.id
                    ? 'bg-[#4A8B8D] text-white shadow-xs'
                    : 'text-[#7A756D] hover:text-[#2D2D2B]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario selection */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D]">
            1. What do you want to talk about?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedScenario(s.id)}
                className={`p-4 rounded-[24px] border text-left transition-all cursor-pointer ${
                  selectedScenario === s.id
                    ? 'bg-[#D1E5E6]/30 border-[#4A8B8D] ring-2 ring-[#4A8B8D]/20 shadow-xs'
                    : 'bg-[#F9F7F2] border-[#E8E4D9] hover:bg-[#F0EDE4]'
                }`}
              >
                <div className="text-xs sm:text-sm font-bold text-[#2D2D2B]">{s.label}</div>
                <div className="text-xs text-[#7A756D] mt-1 leading-relaxed">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Parent dynamic style */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D]">
            2. Family Dynamic / Tone
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PARENT_DYNAMICS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setParentStyle(p.id)}
                className={`p-3.5 rounded-[20px] border text-left transition-all cursor-pointer ${
                  parentStyle === p.id
                    ? 'bg-[#D1E5E6]/30 border-[#4A8B8D] ring-2 ring-[#4A8B8D]/20 shadow-xs'
                    : 'bg-[#F9F7F2] border-[#E8E4D9] hover:bg-[#F0EDE4]'
                }`}
              >
                <div className="text-xs font-bold text-[#2D2D2B]">{p.label}</div>
                <div className="text-[11px] text-[#7A756D] mt-1">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Custom Context */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#7A756D]">
            3. Any specific context to include? (Optional)
          </label>
          <input
            type="text"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="e.g. Preparing for upcoming Semester 5 exams; want to stay in hostel this weekend to rest."
            className="w-full p-3.5 bg-[#F9F7F2] border border-[#E8E4D9] rounded-xl text-xs sm:text-sm text-[#2D2D2B] focus:outline-hidden focus:ring-2 focus:ring-[#4A8B8D]"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 bg-[#4A8B8D] hover:bg-[#376F71] disabled:opacity-50 text-white rounded-full font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#F5D5CB]" />
          <span>{isGenerating ? 'Generating Respectful Template...' : 'Regenerate Message Template'}</span>
        </button>
      </div>

      {/* Generated Result Card */}
      {generatedResult && (
        <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-[#E8E4D9] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-[#4A8B8D]" />
              <h3 className="font-serif italic font-bold text-lg text-[#2D2D2B]">
                Suggested WhatsApp / Message Draft
              </h3>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 bg-[#D1E5E6] hover:bg-[#BFE0E1] text-[#1F4647] border border-[#4A8B8D]/30 px-4 py-2 rounded-full text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#4A8B8D]" />
                  <span className="text-[#1F4647]">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Message</span>
                </>
              )}
            </button>
          </div>

          {/* Message Box */}
          <div className="p-5 bg-[#F9F7F2] rounded-[24px] border border-[#E8E4D9] text-xs sm:text-sm text-[#2D2D2B] leading-relaxed font-sans whitespace-pre-wrap">
            {generatedResult.message}
          </div>

          {/* Conversation Guidance & Tips */}
          <div className="p-5 bg-[#F0EDE4] rounded-[24px] border border-[#E8E4D9] space-y-2.5 text-xs sm:text-sm">
            <div className="font-bold text-[#2D2D2B] flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#E98A72]" />
              <span>Conversation Tips & Timing:</span>
            </div>

            {generatedResult.suggestedTiming && (
              <div className="text-xs text-[#7A756D] font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#4A8B8D]" />
                <span>Best Timing: {generatedResult.suggestedTiming}</span>
              </div>
            )}

            <ul className="space-y-1.5 text-xs text-[#3D3A35] list-disc list-inside">
              {generatedResult.tips?.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
