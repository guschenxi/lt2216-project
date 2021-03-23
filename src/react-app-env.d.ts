/// <reference types="react-scripts" />

declare module 'react-speech-kit';

interface SDSContext {
    recResult: string;
    nluData: any;
    ttsAgenda: string;
    from: string;
    to: string;
    day: string;
    time: string;
    confirm: boolen;
    text: string;
    intent: Object;
    count: number;
    order: string;
    output_text: string;
    temp: string,

}

type SDSEvent =
    | { type: 'CLICK' }
    | { type: 'RECOGNISED' }
    | { type: 'ASRRESULT', value: string }
    | { type: 'ENDSPEECH' }
    | { type: 'LISTEN' }
    | { type: 'MAXSPEECH' }
    | { type: 'CHECK' }
    | { type: 'SPEAK', value: string };
