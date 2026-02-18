import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import Navbar from './components/Navbar';
import { Button } from './components/ui/button';
import { AudioLines, Mic, MicOff, PhoneOff } from 'lucide-react';
import { Orb } from '@/components/ui/orb';
import { CHILDREN } from './constants';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected';

function App() {
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [micMuted, setMicMuted] = useState(false);
  const [llmIsSpeaking, setIsLlmSpeaking] = useState(false);

  console.log('llm speaking: ', llmIsSpeaking);

  // Toggle mute state and update local audio track
  const toggleMute = () => {
    setMicMuted(prev => {
      const newMuted = !prev;
      const stream = localStreamRef.current;
      if (stream) {
        stream.getAudioTracks().forEach(track => {
          track.enabled = !newMuted;
        });
      }
      return newMuted;
    });
  };

  useEffect(() => {
    return () => {
      dataChannel.current?.close();
      peerConnection.current?.close();
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
      dataChannel.current = null;
      peerConnection.current = null;
      localStreamRef.current = null;
      audioContextRef.current = null;
    };
  }, []);

  const stopVoiceChat = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    dataChannel.current?.close();
    peerConnection.current?.close();
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    dataChannel.current = null;
    peerConnection.current = null;
    localStreamRef.current = null;

    setStatus('disconnected');
    setMicMuted(false);
    setIsLlmSpeaking(false);
  };

  const startVoiceChat = async () => {
    try {
      if (peerConnection.current) return;

      setStatus('connecting');

      const pc = new RTCPeerConnection();
      peerConnection.current = pc;

      pc.onconnectionstatechange = () => {
        switch (pc.connectionState) {
          case 'connected':
            setStatus('connected');
            break;
          case 'disconnected':
          case 'failed':
          case 'closed':
            setStatus('disconnected');
            break;
        }
      };

      // Prepare audio element for remote playback
      if (audioElement.current) audioElement.current.autoplay = true;

      // Get local microphone
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      localStreamRef.current = localStream;
      pc.addTrack(localStream.getTracks()[0]);

      // Set up DataChannel
      const dc = pc.createDataChannel('oai-events');
      dataChannel.current = dc;
      dc.onopen = () => {
        setStatus('connected');

        dc.send(
          JSON.stringify({
            type: 'response.create',
            response: {
              metadata: {
                response_purpose: 'greeting',
              },
              instructions: `Greet the parent (Maria) by name and ask which student (${JSON.stringify(CHILDREN, null, 2)}) will be absent.
              
              When mentioning students, be sure to be personable and mention them all by first name. If the parent mentions a class or period, reference the schedule above to provide details like teacher name and class time.

              Do NOT assume language. Always start in English and let the user update it if need be.
              `,
            },
          }),
        );
      };
      dc.onclose = () => setStatus('disconnected');
      dc.onmessage = e => {
        const serverEvent = JSON.parse(e.data);
        if (serverEvent.type === 'response.done') {
          const newTranscript =
            serverEvent.response.output[0]?.content[0].transcript || null;
          console.log('transcript: ', newTranscript);
        }
      };

      pc.ontrack = e => {
        const remoteStream = e.streams[0];
        if (!audioElement.current) return;

        audioElement.current.srcObject = remoteStream;
        audioElement.current.autoplay = true;

        // Create AudioContext for LLM output
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(remoteStream);

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024; // higher = smoother
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        // ---- speaking detection state ----
        let lastSpeakingTime = 0;
        let smoothedRms = 0;

        const SPEAKING_THRESHOLD = 0.01; // adjust if needed
        const SPEAKING_DECAY = 750; // ms before considering 'not speaking'
        const SMOOTHING = 0.2; // exponential smoothing

        const detectSpeaking = () => {
          analyser.getByteTimeDomainData(dataArray);

          // compute RMS
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sum += normalized * normalized;
          }
          const rms = Math.sqrt(sum / dataArray.length);

          // exponential smoothing
          smoothedRms = SMOOTHING * rms + (1 - SMOOTHING) * smoothedRms;

          const now = performance.now();

          // speaking logic with hysteresis
          if (smoothedRms > SPEAKING_THRESHOLD) {
            lastSpeakingTime = now;
            setIsLlmSpeaking(true);
          } else if (now - lastSpeakingTime > SPEAKING_DECAY) {
            setIsLlmSpeaking(false);
          }

          animationRef.current = requestAnimationFrame(detectSpeaking);
        };

        detectSpeaking();
      };

      // Start the WebRTC session
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch('/session', {
        method: 'POST',
        body: offer.sdp,
        headers: { 'Content-Type': 'application/sdp' },
      });

      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);
    } catch (err) {
      console.error('Error starting voice chat:', err);
      stopVoiceChat();
    }
  };

  return (
    <>
      <audio ref={audioElement} className='hidden' />
      <Navbar />

      <h1 className='text-2xl font-bold text-center mt-6'>
        School Absence System
      </h1>
      <p className='text-center text-sm text-muted-foreground mt-2 max-w-sm mx-auto px-6 sm:px-4 md:px-0'>
        A demonstration of how AI can streamline the process of reporting and
        managing student absences.
      </p>

      <div className='max-w-lg mx-auto mt-12 mb-4 px-4'>
        <Card className='py-4'>
          <CardContent className='px-4'>
            {status !== 'connected' ? (
              <Empty className='p-0 md:p-0'>
                <EmptyHeader>
                  <EmptyMedia variant='default' className='w-12 h-12'>
                    <Orb colors={['#e60076', '']} />
                  </EmptyMedia>
                  <EmptyTitle>Absence Reporting</EmptyTitle>
                  <EmptyDescription>
                    Just start a voice chat and provide the details of the
                    absence, and we'll handle the rest.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    size={'sm'}
                    className='active:scale-95 transition-transform'
                    onClick={startVoiceChat}
                    disabled={status === 'connecting'}
                  >
                    <AudioLines />
                    {status === 'connecting'
                      ? 'Connecting...'
                      : 'Start voice chat'}
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <div className='w-full'>
                <Orb
                  colors={
                    micMuted
                      ? ['#e7000b', '']
                      : llmIsSpeaking
                        ? ['#e60076', '']
                        : ['#4ade80', '']
                  }
                />
              </div>
            )}
          </CardContent>
          {status === 'connected' && (
            <CardFooter className='flex items-center justify-between gap-4 px-4'>
              <div className='flex items-center gap-2'>
                <Button
                  variant={micMuted ? 'secondary' : 'outline'}
                  size={'icon-sm'}
                  className='active:scale-95 transition-transform'
                  aria-pressed={micMuted}
                  onClick={toggleMute}
                  title={micMuted ? 'Unmute mic' : 'Mute mic'}
                >
                  {micMuted ? <MicOff className='text-red-500' /> : <Mic />}
                </Button>
              </div>
              <Button
                size={'sm'}
                variant='destructive'
                className='active:scale-95 transition-transform'
                onClick={stopVoiceChat}
              >
                <PhoneOff />
                End call
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
}

export default App;
