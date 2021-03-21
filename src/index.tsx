import "./styles.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Machine, assign, send, State } from "xstate";
import { useMachine, asEffect } from "@xstate/react";
import { inspect } from "@xstate/inspect";
import { departureMachine } from "./dmDeparture";
import { IntentMachine } from "./dmIntent";
import { SmartHomeMachine } from "./dmSmartHome";


inspect({
    url: "https://statecharts.io/inspect",
    iframe: false
});

import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';


function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}

const machine = Machine<SDSContext, any, SDSEvent>({
    id: 'root',
    type: 'parallel',
    context: {count : 0},
    states: {
        dm: {
          initial: 'init',
          id: "dm",
          states:{


check: {
			                invoke: {
                                id: 'tvrequest',
                                src: (context, event) => tvRequest,
                                onDone: {
                                  //target: 'success',
                                  actions: [(context, event) => console.log(event.data), assign({ result: (context, event) => event.data.RESPONSE.RESULT[0].TrainAnnouncement[0] }), (context, event) => console.log(context.result)], 
                                },
                                onError: {
                                  //target: 'failure',
                                  actions: assign({ error: (context, event) => event.data })
                                }
                            }
                        },

                        
                        
              init: {on: {CLICK: 'dmDeparture'}
              //init: {on: {CLICK: 'IntentMachine'}
        },
                //IntentMachine: {...IntentMachine},
                //dmAppointment: {...dmMachine},
                dmDeparture: {...departureMachine},
            }


        },
        asrtts: {
            initial: 'idle',
            states: {
                idle: {
                    on: {
                        LISTEN: 'recognising',
                        SPEAK: {
                            target: 'speaking',
                            actions: assign((_context, event) => { return { ttsAgenda: event.value } })
                        }
                    }
                },
                recognising: {
                    entry: 'recStart',
                    exit: 'recStop',
                    on: {
                        ASRRESULT: {
                            actions: ['recLogResult',
                                assign((_context, event) => { return { recResult: event.value } })],
                            target: '.match'
                        },
                        RECOGNISED: {
                            actions: assign((context) => { return { count: 0 } }),
                            target:'idle'
                        },
                        MAXSPEECH: 'idle',
                    },
                    states: {
                        match: {
                            entry: send('RECOGNISED'),
                        },
                    }
                },
                speaking: {
                    entry: 'ttsStart',
                    on: {
                        ENDSPEECH: 'idle',
                    }
                }
            }
        }
    },
},
    {
        actions: {
            recLogResult: (context: SDSContext) => {
                /* context.recResult = event.recResult; */
                console.log('<< ASR: ' + context.recResult);
            },
            test: () => {
                console.log('test')
            },
            logIntent: (context: SDSContext) => {
                /* context.nluData = event.data */
                console.log('<< NLU intent: ' + context.nluData.intent.name)
            }
        },
    });



interface Props extends React.HTMLAttributes<HTMLElement> {
    state: State<SDSContext, any, any, any>;
}
const ReactiveButton = (props: Props): JSX.Element => {
    switch (true) {
        case props.state.matches({ asrtts: 'recognising' }):
            return (
                <button type="button" className="glow-on-hover"
                    style={{ animation: "glowing 20s linear" }} {...props}>
                    Listening...
                </button>
            );
        case props.state.matches({ asrtts: 'speaking' }):
            return (
                <button type="button" className="glow-on-hover"
                    style={{ animation: "bordering 1s infinite" }} {...props}>
                    Speaking...
                </button>
            );
        default:
            return (
                <button type="button" className="glow-on-hover" {...props}>
                    Click to start
                </button >
            );
    }
}

function App() {
    const { speak, cancel, speaking } = useSpeechSynthesis({
        onEnd: () => {
            send('ENDSPEECH');
        },
    });
    const { listen, listening, stop } = useSpeechRecognition({
        onResult: (result: any) => {
            send({ type: "ASRRESULT", value: result });
        },
    });
    const [current, send, service] = useMachine(machine, {
        devTools: true,
        actions: {
            recStart: asEffect(() => {
                console.log('Ready to receive a input.');
                listen({
                    interimResults: false,
                    continuous: true,
                    lang: "sv-SE",
                });
            }),
            recStop: asEffect(() => {
                console.log('Recognition stopped.');
                stop()
            }),
            changeColour: asEffect((context) => {
                console.log('Repainting...');
                document.body.style.background = context.recResult;
            }),
            ttsStart: asEffect((context, effect) => {
                console.log('Speaking...');
                speak({ text: context.ttsAgenda, lang: "en-US" });
                  /*var u = new SpeechSynthesisUtterance();
                  u.text = context.ttsAgenda;
                  u.lang = 'sv-SE';
                console.log(u)
                speechSynthesis.speak(u);*/
            }),
            ttsCancel: asEffect((context, effect) => {
                console.log('TTS STOP...');
                cancel()
            })
            /* speak: asEffect((context) => {
	     * console.log('Speaking...');
             *     speak({text: context.ttsAgenda })
             * } */
        }
    });


    return (
        <div className="App">
            <ReactiveButton state={current} onClick={() => send('CLICK')} />
        </div>
    )
};



/* RASA API
 *  
const proxyurl = "https://cors-anywhere.herokuapp.com/";
const rasaurl = 'https://lt2216-a2.herokuapp.com/model/parse'
const nluRequest = (text: string) =>
    fetch(new Request(proxyurl + rasaurl, {
        method: 'POST',
        headers: { 'Origin': 'http://maraev.me' }, // only required with proxy
        body: `{"text": "${text}"}`
    }))
        .then(data => data.json());
*/
/* TV API
 *  */
var text = `	<REQUEST>
      <LOGIN authenticationkey="f16eb462dbdb435a8f3c22829c0e13bf" />
      <QUERY objecttype="TrainAnnouncement" schemaversion="1.3" orderby="AdvertisedTimeAtLocation">
            <FILTER>
                  <AND>
                        <EQ name="ActivityType" value="Avgang" />
                        <EQ name="LocationSignature" value="Em" />
                        <EQ name="ToLocation.LocationName" value="Kac" />
                        <GTE name="AdvertisedTimeAtLocation" value="2021-3-20T08:00" />
                        <LTE name="AdvertisedTimeAtLocation" value="2021-3-20T23:59:59" />
                  </AND>
            </FILTER>
            <INCLUDE>AdvertisedTrainIdent</INCLUDE>
            <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
            <INCLUDE>TrackAtLocation</INCLUDE>
      </QUERY>
    </REQUEST>`

const proxyurl = "";
const rasaurl = 'https://api.trafikinfo.trafikverket.se/v2/data.json'
const tvRequest = //(text: string) =>
    fetch(new Request(proxyurl + rasaurl, {
        method: 'POST',
       // headers: { 'Origin': 'http://maraev.me' }, // only required with proxy
        body: text
    }))
        .then(data => data.json());

const rootElement = document.getElementById("root");
ReactDOM.render(
    <App />,
    rootElement);



