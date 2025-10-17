
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mic, StopCircle, Languages, Volume2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { translateAudio } from '@/ai/flows/translate-audio';
import { textToSpeech } from '@/ai/flows/text-to-speech';

export default function TranslatePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleStartRecording = async () => {
    setError(null);
    setTranscription('');
    setTranslation('');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current.addEventListener(
          'dataavailable',
          handleDataAvailable
        );
        mediaRecorderRef.current.addEventListener('stop', handleStop);
        audioChunksRef.current = [];
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        setError(
          'Could not access microphone. Please grant permission in your browser settings.'
        );
      }
    } else {
      setError('Audio recording is not supported by your browser.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDataAvailable = (event: BlobEvent) => {
    audioChunksRef.current.push(event.data);
  };

  const handleStop = async () => {
    setLoading(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      try {
        const result = await translateAudio({ audio: base64Audio });
        setTranscription(result.transcription);
        setTranslation(result.translation);
      } catch (e) {
        console.error(e);
        setError('Failed to translate audio. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  };

  const handlePlayTranslation = async () => {
    if (!translation || isPlaying) return;

    setIsPlaying(true);
    try {
      const { audio } = await textToSpeech({ text: translation });
      if (audioRef.current) {
        audioRef.current.src = audio;
        audioRef.current.play();
        audioRef.current.onended = () => setIsPlaying(false);
      }
    } catch (e) {
      console.error('Failed to generate speech:', e);
      setError('Could not play audio. Please try again.');
      setIsPlaying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <header className="text-center mb-12 flex flex-col items-center">
        <Link href="/" className="w-full max-w-md mb-8">
            <svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                <g id="logo-icon">
                <circle cx="60" cy="60" r="35" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"/>
                <line x1="60" y1="28" x2="60" y2="35" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"/>
                <line x1="60" y1="85" x2="60" y2="92" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"/>
                <line x1="28" y1="60" x2="35" y2="60" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"/>
                <line x1="85" y1="60" x2="92" y2="60" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"/>
                <path d="M 60 45 C 52 45 46 51 46 59 C 46 69 60 80 60 80 C 60 80 74 69 74 59 C 74 51 68 45 60 45 Z" 
                        fill="hsl(var(--primary))" stroke="hsl(var(--destructive))" strokeWidth="2"/>
                <circle cx="60" cy="59" r="5" fill="hsl(var(--primary-foreground))"/>
                <g transform="rotate(45 60 60)">
                    <path d="M 60 50 L 65 60 L 60 70 L 55 60 Z" fill="hsl(var(--foreground))" opacity="0.8"/>
                </g>
                </g>
                <g id="logo-text">
                <text x="110" y="70" fontFamily="var(--font-headline), serif" fontSize="40" fontWeight="700" fill="hsl(var(--foreground))">
                    Get<tspan fill="hsl(var(--primary))">Wander</tspan><tspan>Wise</tspan>
                </text>
                <text x="110" y="90" fontFamily="var(--font-body), sans-serif" fontSize="12" fontWeight="400" fill="hsl(var(--muted-foreground))" letterSpacing="1">
                    YOUR PERSONAL TRAVEL GUIDE
                </text>
                </g>
            </svg>
        </Link>
        <h1 className="text-4xl font-bold font-headline">Talk. Tap. Understand.</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          “Record local speech and get instant English translations — simple, fast, and accurate.”
        </p>
      </header>

      <main className="max-w-2xl mx-auto">
        <Card className="shadow-lg w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages />
              Audio Translator
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <Button
                size="lg"
                variant={isRecording ? 'destructive' : 'default'}
                className="w-40 h-16 rounded-full text-lg"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={loading}
              >
                {isRecording ? (
                  <>
                    <StopCircle className="mr-2 h-6 w-6" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-6 w-6" />
                    Record
                  </>
                )}
              </Button>
            </div>

            {loading && (
              <div className="text-center mt-4 flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-lg">Translating...</span>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {(transcription || translation) && !loading && (
              <div className="mt-6 text-left space-y-4 p-4 bg-muted rounded-md">
                <div>
                  <h3 className="font-semibold text-muted-foreground">Transcription</h3>
                  <p>{transcription}</p>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-muted-foreground">Translation</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handlePlayTranslation} 
                      disabled={isPlaying || !translation}
                      aria-label="Play translation"
                    >
                      {isPlaying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                  </div>
                  <p className="text-lg font-medium">{translation}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
