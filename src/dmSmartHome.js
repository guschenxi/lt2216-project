import { MachineConfig, send, Action, assign } from "xstate";

import { loadGrammar } from './runparser';
import { parse } from './chartparser';
import { grammar } from './grammars/smart';

const gram = loadGrammar(grammar)
function prs_grammar(input: string) {
  //prs = parse(input.split(/\s+/), gram);
  return parse(input.split(/\s+/), gram).resultsForRule(gram.$root);
  //console.log(result);
  //return result;
}

function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}

function final_word(result){console.log(result);
    if (["light","heat","air conditioning"].indexOf(result.object) !== -1) {
        if (result.action == "on") { return "turn on the " + result.object}
        else {return "turn off the " + result.object}
    }
    else {
        if (result.action == "on") { return "open the " + result.object}
        else { return "close the " + result.object}
    }
}

export const SmartHomeMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'welcome',
    id: "SmartHomeMachine",
    context: {},
    states: {

        welcome: {
            initial: "prompt",
            on: { ENDSPEECH: "what_to_do" },
            states: {
                prompt: { entry: say("Welcome to the Smart Home!") }
            }
        },
        what_to_do: {
            initial: "prompt",
            on: {
                RECOGNISED: [

                    {
                    cond: (context) => "object" in (prs_grammar(context.recResult)[0] || {}),
                    actions: assign((context) => { return { results: (prs_grammar(context.recResult)[0]) } }),
                    target: "end"

                },
                    {
                     target: ".nomatch" },
                ]
            },
            states: {
                prompt: {
                    entry: say("What to you want me to do?"),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I don't understand"),
                    on: { ENDSPEECH: "#root.dm.TODOitem.what_to_do" }
                }
            }
        },
        end: {
            initial: "prompt",
            states:{
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `OK. I will ${final_word(context.results)}.`
                    })),
                    on:{ENDSPEECH: "#root.dm.TODOitem.welcome"}
                },
            }
        },
    }
})
