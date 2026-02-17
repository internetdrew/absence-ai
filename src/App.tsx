import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import Navbar from './components/Navbar';
import { Button } from './components/ui/button';
import { AudioLines, NotepadText, PhoneOff } from 'lucide-react';
import { Textarea } from './components/ui/textarea';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected';

function App() {
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);

  useEffect(() => {
    return () => {
      dataChannel.current?.close();
      peerConnection.current?.close();
      localStream.current?.getTracks().forEach(track => track.stop());
      dataChannel.current = null;
      peerConnection.current = null;
      localStream.current = null;
    };
  }, []);

  const stopVoiceChat = () => {
    dataChannel.current?.close();
    peerConnection.current?.close();
    localStream.current?.getTracks().forEach(track => track.stop());
    dataChannel.current = null;
    peerConnection.current = null;
    localStream.current = null;
    setStatus('disconnected');
  };

  const startVoiceChat = async () => {
    try {
      if (peerConnection.current) {
        return;
      }

      setStatus('connecting');

      // Create a peer connection
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

      // Set up to play remote audio from the model
      if (audioElement.current) {
        audioElement.current.autoplay = true;
      }
      pc.ontrack = e => {
        if (audioElement.current) {
          audioElement.current.srcObject = e.streams[0];
        }
      };

      // Add local audio track for microphone input in the browser
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      localStream.current = ms;
      pc.addTrack(ms.getTracks()[0]);

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel('oai-events');
      dataChannel.current = dc;
      dc.onerror = e => console.error('Data channel error:', e);
      dc.onopen = () => setStatus('connected');
      dc.onclose = () => setStatus('disconnected');
      dc.onmessage = e => {
        const serverEvent = JSON.parse(e.data);

        // User's speech transcribed
        if (
          serverEvent.type ===
          'conversation.item.input_audio_transcription.completed'
        ) {
          console.log(
            'input transcription completed: ',
            serverEvent.transcription,
          );
          setMessages(prev => [
            ...prev,
            { role: 'user', content: serverEvent.transcript },
          ]);
        }

        if (serverEvent.type === 'response.done') {
          console.log(serverEvent.response.output[0]);
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: serverEvent.response.output[0].content[0].transcript,
            },
          ]);
        }
      };

      // Start the session using the Session Description Protocol (SDP)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch('/session', {
        method: 'POST',
        body: offer.sdp,
        headers: {
          'Content-Type': 'application/sdp',
        },
      });

      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error starting voice chat:', error);
      stopVoiceChat();
      return;
    }
  };

  console.log('current messages: ', messages);

  return (
    <>
      <audio ref={audioElement} className='hidden' />
      <Navbar />
      <span className='mx-auto text-sm mt-4 text-center block font-medium'>
        An AI-Powered Demo
      </span>
      <h1 className='text-2xl font-bold text-center mt-6'>
        School Absence System
      </h1>
      <p className='text-center text-sm text-muted-foreground mt-2 max-w-sm mx-auto px-6 sm:px-4 md:px-0'>
        A demonstration of how AI can streamline the process of reporting and
        managing student absences.
      </p>

      <div className='max-w-xl mx-auto mt-12 mb-4 px-4'>
        <Card>
          <CardHeader className='px-4'>
            <CardTitle>Report a Student Absence</CardTitle>
            <CardDescription>
              Give us the details and we'll take care of the rest.
            </CardDescription>
          </CardHeader>
          <CardContent className='px-4'>
            <ScrollArea className='h-52'>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant='icon' className='size-4'>
                    <NotepadText />
                  </EmptyMedia>
                  <EmptyTitle className='text-base'>
                    Log a new absence
                  </EmptyTitle>
                  <EmptyDescription>
                    Type a message or tap the voice button to tell us which
                    student(s) will be absent, when, and why...
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </ScrollArea>
          </CardContent>
          <CardFooter className='flex flex-col gap-4 px-4'>
            <Textarea
              placeholder='Enter absence details here...'
              className='field-sizing-content resize-none'
            />
            <div className='ml-auto flex gap-2'>
              {status === 'connected' ? (
                <Button
                  size={'sm'}
                  variant='destructive'
                  className='active:scale-95 transition-transform'
                  onClick={stopVoiceChat}
                >
                  <PhoneOff />
                  End call
                </Button>
              ) : (
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
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default App;
