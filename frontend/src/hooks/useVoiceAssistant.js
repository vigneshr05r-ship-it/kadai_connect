import { useState, useCallback, useRef } from 'react';

export const useVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [listeningError, setListeningError] = useState(null);
  const [volume, setVolume] = useState(0);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const speak = useCallback((text, lang = 'en-US') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { console.error("Stop error:", e); }
      setIsListening(false);
      stopVolumeAnalysis();
    }
  }, []);

  const startVolumeAnalysis = async (stream) => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;
        setVolume(Math.min(100, Math.round((average / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };
      
      checkVolume();
    } catch (err) {
      console.error("Audio context error:", err);
    }
  };

  const stopVolumeAnalysis = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close().catch(console.error);
    animationFrameRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    setVolume(0);
  };

  const listen = useCallback((onResult, lang = 'en-US') => {
    setListeningError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setListeningError("Speech Recognition not supported. Please use Chrome.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setListeningError(null);
        console.log("🎤 Voice started (listening...)");
        
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(startVolumeAnalysis)
          .catch(err => console.error("Mic Volume Analysis failed", err));
      };

      recognition.onend = () => {
        setIsListening(false);
        stopVolumeAnalysis();
        console.log("🔇 Voice ended (stopped)");
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        stopVolumeAnalysis();
        const errs = {
          'not-allowed': 'Microphone permission denied.',
          'no-speech': 'No speech detected. Please speak louder or closer to the mic.',
          'network': 'Network error occurred.',
          'audio-capture': 'Microphone not detected.',
        };
        setListeningError(errs[event.error] || `Error: ${event.error}`);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        if (fullTranscript) {
          console.log(`📡 Captured: "${fullTranscript}" (Confidence: ${event.results[0][0].confidence.toFixed(2)})`);
          onResult(fullTranscript, event.results[event.results.length - 1].isFinal);
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Speech Start Error:", err);
      setIsListening(false);
      setListeningError("Could not start microphone.");
    }
  }, []);

  return { speak, listen, stopListening, isListening, listeningError, volume };
};

