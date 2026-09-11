// Speech Synthesis Service for MindBridge 360 (English, Tamil & Tanglish)
import { AppLanguage, CompanionTone, CompanionAvatarType } from '../types';

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;

// Tamil Unicode to Phonetic Tanglish transliterator (ensures audio plays even on devices lacking Tamil TTS voice pack)
export function transliterateTamilToPhoneticTanglish(text: string): string {
  if (!text) return '';

  // Common phrase shortcuts for ultra natural pronunciation
  const commonMap: [RegExp, string][] = [
    [/வணக்கம்/g, 'Vanakkam'],
    [/மித்ரா/g, 'Mithra'],
    [/எப்படி/g, 'eppadi'],
    [/இருக்கீங்க/g, 'irukkeenga'],
    [/இருக்கிறீர்கள்/g, 'irukkeereergal'],
    [/நன்றி/g, 'nandri'],
    [/கல்லூரி/g, 'college'],
    [/பயப்படாதீங்க/g, 'bayappadadheenga'],
    [/மன அமைதி/g, 'mana amaithi'],
    [/மூச்சு/g, 'moochu'],
    [/ஆரோக்கியம்/g, 'aarokkiyam'],
    [/நான்/g, 'naan'],
    [/உங்களுடன்/g, 'ungaludan'],
    [/இருக்கிறேன்/g, 'irukkiraen'],
    [/உதவி/g, 'udhavi'],
    [/தேவையா/g, 'thevayaa'],
    [/இளைப்பாறுங்கள்/g, 'ilaippaarungal'],
    [/நண்பா/g, 'nanbaa'],
    [/தோழா/g, 'thozhaa'],
  ];

  let converted = text;
  for (const [pattern, replacement] of commonMap) {
    converted = converted.replace(pattern, replacement);
  }

  // If text contains remaining Tamil characters, do character-level mapping
  const hasTamil = /[\u0B80-\u0BFF]/.test(converted);
  if (!hasTamil) return converted;

  const vowels: Record<string, string> = {
    'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ee', 'உ': 'u', 'ஊ': 'oo',
    'எ': 'e', 'ஏ': 'ae', 'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'oh', 'ஔ': 'au',
    'ஃ': 'h'
  };

  const vowelSigns: Record<string, string> = {
    'ா': 'aa', 'ி': 'i', 'ீ': 'ee', 'ு': 'u', 'ூ': 'oo',
    'ெ': 'e', 'ே': 'ae', 'ை': 'ai', 'ொ': 'o', 'ோ': 'oh', 'ௌ': 'au',
    '்': ''
  };

  const consonants: Record<string, string> = {
    'க': 'k', 'ங': 'ng', 'ச': 's', 'ஞ': 'gn', 'ட': 't',
    'ண': 'n', 'த': 'th', 'ந': 'n', 'ப': 'p', 'ம': 'm',
    'ய': 'y', 'ர': 'r', 'ல': 'l', 'வ': 'v', 'ழ': 'zh',
    'ள': 'l', 'ற': 'r', 'ன': 'n', 'ஜ': 'j', 'ஷ': 'sh',
    'ஸ': 's', 'ஹ': 'h'
  };

  let result = '';
  const len = converted.length;
  for (let i = 0; i < len; i++) {
    const char = converted[i];
    const nextChar = i + 1 < len ? converted[i + 1] : '';

    if (vowels[char]) {
      result += vowels[char];
    } else if (consonants[char]) {
      const base = consonants[char];
      if (nextChar && vowelSigns[nextChar] !== undefined) {
        result += base + vowelSigns[nextChar];
        i++; // skip vowel sign
      } else {
        result += base + 'a';
      }
    } else if (vowelSigns[char]) {
      result += vowelSigns[char];
    } else {
      result += char;
    }
  }

  return result;
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
      voicesLoaded = true;
      resolve(voices);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      const updated = window.speechSynthesis.getVoices();
      cachedVoices = updated;
      voicesLoaded = true;
      resolve(updated);
    };

    // Fallback if event doesn't fire promptly
    setTimeout(() => {
      const fallback = window.speechSynthesis.getVoices();
      cachedVoices = fallback;
      voicesLoaded = true;
      resolve(fallback);
    }, 400);
  });
}

// Ensure voices are loaded immediately
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
}

export function findBestVoice(
  language: AppLanguage,
  gender: 'female' | 'male' = 'female'
): { voice: SpeechSynthesisVoice | null; langCode: string; useTransliteration: boolean } {
  const voices = cachedVoices.length > 0 ? cachedVoices : (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []);

  const isFemale = gender === 'female';

  if (language === 'ta') {
    // 1. Look for native Tamil voice
    const tamilVoices = voices.filter(v => 
      v.lang.toLowerCase().startsWith('ta') || 
      v.lang.toLowerCase().includes('tam') ||
      v.name.toLowerCase().includes('tamil') ||
      v.name.toLowerCase().includes('தமிழ்')
    );

    if (tamilVoices.length > 0) {
      // If female preferred, try female named voice
      const preferred = tamilVoices.find(v => {
        const lower = v.name.toLowerCase();
        return isFemale ? (lower.includes('female') || lower.includes('valluvar') || lower.includes('vani') || !lower.includes('male')) : lower.includes('male');
      }) || tamilVoices[0];
      return { voice: preferred, langCode: 'ta-IN', useTransliteration: false };
    }

    // 2. Fallback: If device lacks Tamil TTS voice engine, pick Indian English or smooth English voice with phonetics
    const indianVoices = voices.filter(v => v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('en_in') || v.name.toLowerCase().includes('india'));
    const matchedIndian = indianVoices.find(v => {
      const lower = v.name.toLowerCase();
      return isFemale ? (lower.includes('female') || lower.includes('heera') || lower.includes('veena') || lower.includes('priya')) : (lower.includes('male') || lower.includes('ravi') || lower.includes('prabhat'));
    }) || indianVoices[0];

    const anyEnglish = matchedIndian || voices.find(v => v.lang.toLowerCase().startsWith('en')) || voices[0] || null;

    return { voice: anyEnglish, langCode: 'en-IN', useTransliteration: true };
  }

  if (language === 'tanglish') {
    const indianVoices = voices.filter(v => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india'));
    const matchedIndian = indianVoices.find(v => {
      const lower = v.name.toLowerCase();
      return isFemale ? (lower.includes('female') || lower.includes('zira') || lower.includes('samantha')) : (lower.includes('male') || lower.includes('david') || lower.includes('ravi'));
    }) || indianVoices[0];

    const englishVoice = matchedIndian || voices.find(v => v.lang.toLowerCase().startsWith('en')) || voices[0] || null;
    return { voice: englishVoice, langCode: 'en-IN', useTransliteration: false };
  }

  // English (en)
  const indianVoices = voices.filter(v => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india'));
  const matchedVoice = indianVoices.find(v => {
    const lower = v.name.toLowerCase();
    return isFemale ? (lower.includes('female') || lower.includes('natural')) : lower.includes('male');
  }) || indianVoices[0];

  const naturalEnglish = matchedVoice || voices.find(v => {
    const lower = v.name.toLowerCase();
    const isLangEn = v.lang.toLowerCase().startsWith('en');
    if (!isLangEn) return false;
    return isFemale ? (lower.includes('female') || lower.includes('samantha') || lower.includes('zira') || lower.includes('victoria')) : (lower.includes('male') || lower.includes('david') || lower.includes('george'));
  }) || voices.find(v => v.lang.toLowerCase().startsWith('en')) || voices[0] || null;

  return { voice: naturalEnglish, langCode: 'en-IN', useTransliteration: false };
}

export interface SpeakOptions {
  text: string;
  language: AppLanguage;
  tone?: CompanionTone;
  avatar?: CompanionAvatarType;
  gender?: 'female' | 'male';
  voicePitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onViseme?: (visemeIndex: number) => void;
}

// Play soft calming audio chimes for voice feedback (Web Audio API)
export function playToneCue(type: 'listen' | 'speak' | 'end' = 'listen') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'listen') {
      // Soft uplifting chime (E5 -> G#5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(830.61, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === 'speak') {
      // Gentle ready chime (A5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.19);
    } else {
      // Soft calming outro (G4 -> E4)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(392.00, now);
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.18);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.31);
    }
  } catch (e) {
    // Audio Context might require user interaction, silently ignore
  }
}

export function speakText({
  text,
  language,
  tone = 'gentle',
  avatar = 'mithra',
  gender = 'female',
  voicePitch,
  onStart,
  onEnd,
  onError,
  onViseme,
}: SpeakOptions): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.(new Error('Speech synthesis not supported on this browser.'));
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    // Clean markdown and symbols
    let cleaned = text
      .replace(/[*_#`~>[\]()]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleaned) {
      onEnd?.();
      return false;
    }

    const effectiveGender = avatar === 'mithran' ? 'male' : (gender || (avatar === 'mithra' ? 'female' : 'female'));
    const { voice, langCode, useTransliteration } = findBestVoice(language, effectiveGender);

    // If Tamil and no Tamil voice installed in browser, transliterate to phonetic Tanglish
    if (language === 'ta' && useTransliteration) {
      cleaned = transliterateTamilToPhoneticTanglish(cleaned);
    }

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = langCode;

    if (voice) {
      utterance.voice = voice;
    }

    // Set natural rate and pitch based on companion tone, gender and avatar
    if (tone === 'gentle') {
      utterance.rate = 0.90;
    } else if (tone === 'upbeat') {
      utterance.rate = 1.02;
    } else {
      utterance.rate = 0.95;
    }

    if (voicePitch !== undefined) {
      utterance.pitch = voicePitch;
    } else if (avatar === 'mithra') {
      utterance.pitch = 1.08;
    } else if (avatar === 'mithran') {
      utterance.pitch = 0.92;
    } else if (avatar === 'blob') {
      utterance.pitch = 1.1;
    } else if (avatar === 'owl') {
      utterance.pitch = 0.95;
    } else if (avatar === 'sprout') {
      utterance.pitch = 1.05;
    } else {
      utterance.pitch = effectiveGender === 'female' ? 1.05 : 0.92;
    }

    let visemeInterval: NodeJS.Timeout | null = null;

    const startVisemeLoop = () => {
      if (!onViseme) return;
      const visemes = [1, 2, 0, 3, 5, 1, 4, 2, 3, 0];
      let idx = 0;
      visemeInterval = setInterval(() => {
        idx = (idx + 1) % visemes.length;
        onViseme(visemes[idx]);
      }, 130);
    };

    const stopVisemeLoop = () => {
      if (visemeInterval) {
        clearInterval(visemeInterval);
        visemeInterval = null;
      }
      onViseme?.(0);
    };

    utterance.onstart = () => {
      startVisemeLoop();
      onStart?.();
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word' && onViseme) {
        const char = cleaned[event.charIndex]?.toLowerCase() || 'a';
        if (['a', 'aa', 'ா', 'அ', 'ஆ'].includes(char)) onViseme(1);
        else if (['o', 'u', 'oo', 'ொ', 'ோ', 'ஒ', 'ஓ', 'உ'].includes(char)) onViseme(2);
        else if (['e', 'i', 'ee', 'ெ', 'ே', 'ை', 'இ', 'ஈ', 'எ', 'ஏ'].includes(char)) onViseme(3);
        else if (['m', 'p', 'b', 'ம', 'ப'].includes(char)) onViseme(4);
        else if (['t', 'd', 'th', 'l', 'த', 'ட', 'ல', 'ழ', 'ள'].includes(char)) onViseme(5);
        else onViseme(1);
      }
    };

    utterance.onend = () => {
      stopVisemeLoop();
      onEnd?.();
    };

    utterance.onerror = (e) => {
      stopVisemeLoop();
      // Ignore normal cancel interruptions
      if (e.error === 'canceled' || e.error === 'interrupted') {
        onEnd?.();
      } else {
        console.warn('SpeechSynthesis error:', e);
        onError?.(e);
        onEnd?.();
      }
    };

    // Unpause in case synthesis was paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech invocation failed:', err);
    onError?.(err);
    onEnd?.();
    return false;
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Auto-detect language of text (Tamil, Tanglish, or English)
export function detectTextLanguage(text: string): 'ta' | 'tanglish' | 'en' {
  if (!text) return 'en';

  // Check for Tamil Unicode characters
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return 'ta';
  }

  // Common conversational Tanglish tokens
  const tanglishPatterns = [
    /\b(vanakkam|eppadi|irukku|irukken|irukkeenga|aachu|romba|panna|pannunga|mudiyala|mudiyum|enna|enga|inga|illana|theriyala|solla|pesu|pesunga|nanba|thozha|thozhi|machan|bro|akka|anna|amma|appa|veedu|college|exam|tension|bayam|porumai|kooda|mattum|seri|aama|illa|kavalapadatheenga|sapteengala|saptiya)\b/i,
    /\b(feel panren|stress aagudhu|bayama irukku|lonely-aa|tired-aa|overload-aa|tension-aa)\b/i,
  ];

  const lower = text.toLowerCase();
  for (const pattern of tanglishPatterns) {
    if (pattern.test(lower)) {
      return 'tanglish';
    }
  }

  return 'en';
}

// Check if browser supports Speech Recognition
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export interface SpeechRecognitionOptions {
  language: 'ta' | 'en' | 'tanglish';
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
  onStart?: () => void;
}

export interface RecognizerInstance {
  start: () => void;
  stop: () => void;
  abort: () => void;
}

// Create and configure a Speech Recognition instance
export function createSpeechRecognizer(options: SpeechRecognitionOptions): RecognizerInstance | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    options.onError?.(new Error('Speech recognition not supported in this browser.'));
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // For Tamil use ta-IN; for English and Tanglish use en-IN / en-US
    if (options.language === 'ta') {
      recognition.lang = 'ta-IN';
    } else if (options.language === 'tanglish') {
      // Tanglish recognition: en-IN captures Romanized/Indian English phonetics well
      recognition.lang = 'en-IN';
    } else {
      recognition.lang = 'en-IN';
    }

    recognition.onstart = () => {
      options.onStart?.();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      const isFinal = Boolean(finalTranscript);
      options.onResult(text, isFinal);
    };

    recognition.onerror = (event: any) => {
      // Don't treat normal 'no-speech' or 'aborted' as fatal errors
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('SpeechRecognition error:', event.error);
        options.onError?.(event);
      }
    };

    recognition.onend = () => {
      options.onEnd?.();
    };

    return {
      start: () => {
        try {
          recognition.start();
        } catch (e) {
          console.warn('Recognizer already running or failed to start:', e);
        }
      },
      stop: () => {
        try {
          recognition.stop();
        } catch (e) {
          // ignore
        }
      },
      abort: () => {
        try {
          recognition.abort();
        } catch (e) {
          // ignore
        }
      },
    };
  } catch (err) {
    console.error('Failed to init speech recognition:', err);
    options.onError?.(err);
    return null;
  }
}

