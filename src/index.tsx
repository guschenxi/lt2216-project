import "./styles.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Machine, assign, send, State } from "xstate";
import { useMachine, asEffect } from "@xstate/react";
import { inspect } from "@xstate/inspect";
import { departureMachine } from "./dmDeparture";
import { stationName } from './grammars/stationName';

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
                        
              init: {on: {CLICK: 'dmDeparture'}},
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
                        //MAXSPEECH: 'idle',
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
            },
            clear_context: assign((context) => { return { from: undefined, to: undefined, time: undefined, date: undefined, order: undefined, result: undefined, output_text: undefined, temp: undefined } }),
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
                    Start dialog...
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
            <h1>Train Info System</h1>
            <ReactiveButton state={current} onClick={() => send('CLICK')} /><br/>
            
            <h3>Frame-Based Dialog:</h3>

            <table>
              <tr>
                <th>FROM:</th>
                <th>TO:</th>
                <th>TIME:</th>
                <th>DATE:</th>
                <th>Train No:</th>
                
              </tr>
              <tr>
                <td>{stationName[current.context.from]} </td>
                <td>{stationName[current.context.to]}</td>
                <td>{current.context.time}</td>
                <td>{current.context.date}</td>
                <td>{current.context.temp}</td>
              </tr>
            </table>
            <br/>    
            <table>
              <tr>
                <th>TTS: (in English)</th>
              </tr>
              <tr>
                <td>{current.context.ttsAgenda}</td>
              </tr>
            </table>
            <br/>
              <table>
              <tr>
                <th>ASR: (in Swedish)</th>
              </tr>
              <tr>
                <td>{current.context.recResult}</td>
              </tr>
            </table>
            <br/>
            <table>
              <tr>
                <th>Output Text</th>
              </tr>
              <tr>
                <td>{current.context.output_text}</td>
              </tr>
            </table>
        </div>
    )
};


const rootElement = document.getElementById("root");
ReactDOM.render(
    <App />,
    rootElement);



