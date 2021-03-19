import { MachineConfig, actions, Action, assign } from "xstate";
const { send, cancel } = actions;
import { loadGrammar } from './runparser';
import { parse } from './chartparser';
import { grammar, yesnogrammar } from './grammars/appoint';

const gram = loadGrammar(grammar);
const yesnogram = loadGrammar(yesnogrammar);

function prs_grammar(input: string, grammar) {
  console.log(input)
  var prs = parse(input.split(/\s+/), grammar);
  var result = prs.resultsForRule(gram.$root);
  console.log(result);
  return result[0];
}

function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

function listen(): Action<SDSContext, SDSEvent> {
    return [send("LISTEN"), send('MAXSPEECH', {delay: 6000, id:'maxsp'}) ]
}

const commands=["stop","start over","help","go back"];

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = (
{
    initial: 'main_function',
    id: "appointmentMachine",
    states: {
      	hist: {
            type: "history",
            history: "shallow",
            //target: "main_function",
        },

        startover: {
            entry: say("Ok. starting over."),
            on: { ENDSPEECH: "main_function" }
        },

        stop: {
            entry: say("Going back to the root menu."),
            always: '#root'
        },
/*
        goback: {
            entry: say("Going back to the previous step."),
            always: '#main.hist'
        },
*/
        help: {
            entry: say("I can't help you at the moment. Going back to the previous step."),
            on: {'ENDSPEECH': '#main.hist'}
        },

        maxspeech: {
            entry: [say("timeout. say help if you need personal help"), assign((context) => { return { count: context.count + 1 } }), (context) => console.log("Reprompt : " + (4 - context.count) )],
            on: {
                'ENDSPEECH': [
                    {actions: [assign((context) => { return { count: 0 } }), 
                               send((context) => ({type: "SPEAK", value: 'Sorry. Going back to the root menu now.'}))],
	             target: '#root', cond: (context) => context.count === 4},
                    {target: '#main.hist'},
                ]
            }
        },

        main_function: {
            initial: "welcome",
            id: "main",
            on: {
                RECOGNISED: [
                   { target: '#appointmentMachine.stop', cond: (context) => context.recResult === 'stop' },
                   //{ target: '#appointmentMachine.goback', cond: (context) => context.recResult === 'go back' },
	           { target: '#appointmentMachine.help', cond: (context) => context.recResult === 'help' },
                   { target: '#appointmentMachine.startover', cond: (context) => context.recResult === 'start over' }
                ],
                MAXSPEECH: "#appointmentMachine.maxspeech",
            },
            states:{
      	        hist: {
                    type: "history",
                    history: "shallow",
                    target: "#main",
                },
        	welcome: {
                    initial: "prompt",
 	            on: { ENDSPEECH: "who" },
        	    states: {
        	        prompt: { entry: say("Let's create an appointment") }
        	    }
        	},

        	who: {
        	    initial: "prompt",
        	    on: {
        	        RECOGNISED: [
                        {
        	            cond: (context) => "person" in (prs_grammar(context.recResult, gram) || {}),
        	            actions: [assign((context) => { return { person: prs_grammar(context.recResult, gram).person } }), cancel('maxsp')],
        	            target: "day"
        	        },
        	        { target: ".nomatch", cond: (context) => !(commands.includes(context.recResult)) }],
                    },
        	    states: {
        	        prompt: {
                            entry: send((context) => ({
        	                type: "SPEAK",
        	                value: 'Who are you meeting with?'
        	            })),
        	            on: { ENDSPEECH: "ask"}
        	        },
        	        ask: {
        	            entry: listen()
        	        },
        	        nomatch: {
        	            entry: say("Sorry I don't know them. Say for example Monica"),
        	            on: { ENDSPEECH: "prompt" }
        	        }
        	    }
        	},
        	day: {
        	    initial: "repeat",
        	    on: {
        	        RECOGNISED: [
        	        {
        	            cond: (context) => "day" in (prs_grammar(context.recResult, gram) || {}),
        	            actions: [assign((context) => { return { day: prs_grammar(context.recResult, gram).day } }),cancel('maxsp')],
        	            target: "whole_day"
        	        },
        	        { target: ".nomatch", cond: (context) => !(commands.includes(context.recResult)),}]
        	    },
        	    states: {
        	        repeat: {
        	            entry: send((context) => ({
        	                type: "SPEAK",
        	                value: `OK. Meeting with ${context.person}.`
        	            })),
        	            on: { ENDSPEECH: "prompt" }
        	        },
        	        prompt: {
        	            entry: send((context) => ({
        	                type: "SPEAK",
        	                value: " On which day is your meeting? "
        	            })),
        	            on: { ENDSPEECH: "ask" }
        	        },
        	        ask: {
        	            entry: listen()
        	        },
        	        nomatch: {
        	            entry: say("Sorry I don't understand which day you mean. Say for example on Tuesday"),
        	            on: { ENDSPEECH: "prompt" }
        	        }
        	    }
        	},
        	whole_day: {
        	    initial: "repeat",
        	    on: {
        	        RECOGNISED: [
        	        {
        	            cond: (context) => "yesnoanswer" in (prs_grammar(context.recResult, yesnogram) || {}),
        	            actions: [assign((context) => { return { whole_day: prs_grammar(context.recResult, yesnogram).yesnoanswer } }), cancel('maxsp')],
        	            target: ".choose"
        	        },
        	        { target: ".nomatch", cond: (context) => !(commands.includes(context.recResult)) }]
        	    },
        	    states: {
        	        repeat: {
        	            entry: send((context) => ({
        	                type: "SPEAK",
        	                value: `OK. Meeting with ${context.person} on ${context.day}.`
        	            })),
        	            on: { ENDSPEECH: "prompt" }
        	        },
        	        prompt: {
        	            entry: send((context) => ({
        	                type: "SPEAK",
        	                value: " Will it take the whole day?"
        	            })),
        	            on: { ENDSPEECH: "ask" }
        	        },
        	        ask: {
        	            entry: listen()
        	        },
        	        choose: {
        	              always:[
        	                     {target: '#main.time', cond: (context) => context.whole_day === false},	
        	                     {target: '#main.confirm_without_time'}] 
        	        },
        	        nomatch: {
        	            entry: say("Sorry I don't understand. Say yes or no."),
        	            on: { ENDSPEECH: "prompt" }
        	        }
        	    }
        	},
        	time: {
        	    initial: "repeat",
        	    on: {
        	        RECOGNISED: [
        	        {
        	            cond: (context) => "time" in (prs_grammar(context.recResult.replace(':', ' : '), gram) || {}),	
        	            actions: [assign((context) => { return { time: prs_grammar(context.recResult.replace(':',' : '), gram).time } }), cancel('maxsp')],
        	            target: "confirm_with_time"
        	        },
        	        { target: ".nomatch", cond: (context) => !(commands.includes(context.recResult)) }]
        	    },
        	    states: {
        	        repeat: {
        	            entry: send((context) => ({
        	                type: "SPEAK",
        	                value: `OK. `
        	            })),
        	            on: { ENDSPEECH: "prompt" }
        	        },
        	        prompt: {
        	            entry: send((context) => ({
        	                type: "SPEAK",
        	                value: `What time is your meeting?`
        	            })),
        	            on: { ENDSPEECH: "ask" }
        	        },
        	        ask: {
        	            entry: listen()
        	        },
        	        nomatch: {
        	            entry: say("Sorry I don't understand which time you mean. Say for example at eleven"),
        	            on: { ENDSPEECH: "prompt" }
        	        }
        	    }
        	},
        	confirm_without_time: {
        	    initial: "prompt",
        	    on: {
        	        RECOGNISED: [
        	        {
        	            cond: (context) => "yesnoanswer" in (prs_grammar(context.recResult, yesnogram) || {}),
        	            actions: [assign((context) => { return { confirm: prs_grammar(context.recResult, yesnogram).yesnoanswer } }), cancel('maxsp')],
        	            target: ".choose"
        	        },
        	        { target: ".nomatch", cond: (context) => !(commands.includes(context.recResult)) }]
	            },
	            states: {
	                prompt: {
	                    entry: send((context) => ({
	                        type: "SPEAK",
	                        value: `Do you want me to creat an appointment with ${context.person} on ${context.day} for the whole day?`
	                    })),
        	            on: { ENDSPEECH: "ask" }
	                },
	                ask: {
	                    entry: listen()
	                },
	                choose: {
	                      always: [
	                             {target: '#main.final', cond: (context) => context.confirm === true },
	                             {target: '#main.who', cond: (context) => context.confirm === false }
	                            ] 
	                },
	                nomatch: {
	                    entry: say("Sorry I don't understand. Say yes or no."),
	                    on: { ENDSPEECH: "prompt" }
	                }
	            }
	        },
	        confirm_with_time: {
	            initial: "prompt",
	            on: {
        	        RECOGNISED: [
        	        {
        	            cond: (context) => "yesnoanswer" in (prs_grammar(context.recResult, yesnogram) || {}),
        	            actions: [assign((context) => { return { confirm: prs_grammar(context.recResult, yesnogram).yesnoanswer } }), cancel('maxsp')],
        	            target: ".choose"
        	        },
        	        { target: ".nomatch", cond: (context) => !(commands.includes(context.recResult)) }]
        	    },
        	    states: {
        	        prompt: {
        	            entry: send((context) => ({
        	                type: "SPEAK",
        	                value: `Do you want me to creat an appointment with ${context.person} on ${context.day} at ${context.time.hour}:${context.time.minute} ${context.time.ampm}?`
        	            })),
        	            on: { ENDSPEECH: "ask" }
        	        },
        	        ask: {
        	            entry: listen()
        	        },
        	        choose: {
        	              always:  [
        	                     {target: '#main.final', cond: (context) => context.confirm === true },
                	             {target: '#main.who', cond: (context) => context.confirm === false }
                	            ] 
                	},
                	nomatch: {
                	    entry: say("Sorry I don't understand. Say yes or no."),
                	    on: { ENDSPEECH: "prompt" }
                	}
           	     }	
        	},
       	        final: {
         	    initial: "prompt",
       	            states: {
        	        prompt: { 
              	            type: "final",
                	    entry: say("Your appointment has been created! Going back to the root menu now."),
                            on : { ENDSPEECH: "#root"} 
			}
            	    }
        	}
	    }
        }
    },
}
/*{
    guards: {
      isNotCommand: (context) => !(commands.includes(context.recResult)),
      isPersonGrammar: (context) => "person" in (prs_grammar(context.recResult, gram) || {}),
      isDayGrammar: (context) => "day" in (prs_grammar(context.recResult, gram) || {}),
      isTimeGrammar: (context) => "time" in (prs_grammar(context.recResult.replace(':', ' : '), gram) || {}),
      isYesNoGrammar: (context) => "yesnoanswer" in (prs_grammar(context.recResult, yesnogram) || {}),
      
    }
}*/
)


export const TODOitem: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'welcome',
    id: "TODOitem",
    states: {
        welcome: {
            initial: "prompt",
            states: {
                prompt: { entry: say("Choose an item to do.") }
            }
        },
    }
})

export const Timer: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'welcome',
    id: "Timer",
    states: {
        welcome: {
            initial: "prompt",
            states: {
                prompt: { entry: say("Let's set a timer.") }
            }
        },
    }
})
