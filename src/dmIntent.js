import { MachineConfig, send, Action, assign } from "xstate";
import * as React from "react";
import * as ReactDOM from "react-dom";

function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}

export const IntentMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
/* Intent Machine START*/
  id: 'intent',
  initial: 'welcome',
  context: {
    text: undefined,
    intent: undefined,
    error: undefined
  },
  states: {

        welcome: {
            initial: "prompt",
            on: { ENDSPEECH: "intent" },
            states: {
                prompt: { entry: say("Welcome!") }
            }
        },
        intent: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    actions: assign((context) => { return { text: context.recResult } }),
                    target: "loading"
                }]
            },
            states: {
                prompt: {
                    entry: say("What would you like to do?"),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
            }
        },

    loading: {
      invoke: {
        id: 'getIntent',
        src: (context) => nluRequest(context.text),
        onDone: {
          target: 'success',
          actions: assign({ intent: (context, event) => event.data })
        },
        onError: {
          target: 'failure',
          actions: assign({ error: (context, event) => event.data })
        }
      }
    },
    success: {
            on: {
              "": [
                   {target: 'more_info', cond: (context) => context.intent.intent.confidence < 0.70 },
                   {target: '#root.dm.dmAppointment', cond: (context) => context.intent.intent.name === "Appointment" },
                   {target: '#root.dm.TODOitem', cond: (context) => context.intent.intent.name === "TODOitem" },
                   {target: '#root.dm.Timer', cond: (context) => context.intent.intent.name === "Timer" },
                   {target: 'more_info' }
                  ] 
                 }
    },
    failure: {
      entry: say("I can't figure out what you want me to do."),
      on: { ENDSPEECH: "intent" }
    },
    more_info: {
      entry: say("I'm not very sure about your intent. Try to specify it."),
      on: { ENDSPEECH: "intent" }
    }
  }


/* Intent Machine END*/
})

/* RASA API
 *  */
const proxyurl = "https://cors-anywhere.herokuapp.com/";
const rasaurl = 'https://lt2216-a2.herokuapp.com/model/parse'
const nluRequest = (text: string) =>
    fetch(new Request(proxyurl + rasaurl, {
        method: 'POST',
        headers: { 'Origin': 'http://maraev.me' }, // only required with proxy
        body: `{"text": "${text}"}`
    }))
        .then(data => data.json());


