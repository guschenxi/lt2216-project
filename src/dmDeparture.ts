import { MachineConfig, actions, Action, assign } from "xstate";
const { send, cancel } = actions;
import { loadGrammar } from './runparser';
import { parse } from './chartparser';
import { grammar, yesnogrammar } from './grammars/departure';
import { stationName } from './grammars/stationName';

// Trafikverket API's key
const openapiconsolekey = "f16eb462dbdb435a8f3c22829c0e13bf"

const gram = loadGrammar(grammar);
const yesnogram = loadGrammar(yesnogrammar);

function prs_grammar(input: string, grammar) {
  //console.log(input);
  var prs = parse(input.split(/\s+/), grammar);
  var result = prs.resultsForRule(gram.$root);
  if (result[0]===undefined){
     result=[{"reserve":"reserve"}]};
  //console.log(result);
  return result[0];
};

const commands=["stop","start over","help","go back"];

function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
};

function listen(): Action<SDSContext, SDSEvent> {
    return [send("LISTEN"), //send('MAXSPEECH', {delay: 6000, id:'maxsp'}) 
           ]
};

export const departureMachine: MachineConfig<SDSContext, any, SDSEvent> = (
{
    //initial: 'main_function',
    id: "departureMachine",
    type: 'parallel',
    states: {
	    transitions: {
	        on: { 
		        CHECK: [
                    { target: "#main.overall", cond: (context) => context.from === undefined 
                              && context.to === undefined && context.date === undefined },
                    { target: "#main.from", cond: (context) => context.from === undefined },
		        	{ target: "#main.to", cond: (context) => context.to === undefined },
		        	{ target: "#main.time", cond: (context) => context.time === undefined },
                    { target: "#main.date", cond: (context) => context.date === undefined },
		        	{ target: "#main.confirm", 
			          cond: (context) => context.from !== undefined && context.to !== undefined 
                            && context.time !== undefined && context.date !== undefined }
	        	    ],
	        },
	        exit : [(context, event) => console.log(context), cancel("check")],
	    },

        main_function: {
            initial: "overall",
            id: "main",
            on: {
                RECOGNISED: [
                   //{ target: '#departureMachine.stop', cond: (context) => context.recResult === 'stop' },
	           //{ target: '#departureMachine.help', cond: (context) => context.recResult === 'help' },
                   //{ target: '#departureMachine.startover', cond: (context) => context.recResult === 'start over' },

		   { actions: [
                       assign((context) => { return { from: "from" in (prs_grammar(context.recResult.replace('.',' . '), gram)) ? prs_grammar(context.recResult.replace('.',' . '), gram).from : context.from } }),
                       assign((context) => { return { to: "to" in (prs_grammar(context.recResult.replace('.',' . '), gram)) ? prs_grammar(context.recResult.replace('.',' . '), gram).to : context.to } }),
                       assign((context) => { return { time: "time" in (prs_grammar(context.recResult.replace('.',' . '), gram)) ? prs_grammar(context.recResult.replace('.',' . '), gram).time : context.time } }),
                       assign((context) => { return { date: "date" in (prs_grammar(context.recResult.replace('.',' . '), gram)) ? prs_grammar(context.recResult.replace('.',' . '), gram).date : context.date } }),
		       send("CHECK")]
                   }

                 ] 
                //MAXSPEECH: "#departureMachine.maxspeech",
            },
            states:{
      	        hist: {
                    type: "history",
                    history: "shallow",
                    target: "#main",
                },
            	welcome: {
                        initial: "prompt",
                        
     	            on: { ENDSPEECH: "overall" },
            	    states: {
            	        prompt: { entry: say("Hello!") }
            	    }
            	},
            	overall: {
            	    initial: "prompt",
            	    states: {
            	        prompt: {
                                entry: send((context) => ({
            	                type: "SPEAK",
            	                value: `Provide some information about the departure.`
            	            })),
            	            on: { ENDSPEECH: "ask"}
            	        },
            	        ask: {
            	            entry: listen()
            	        },
            	    }
            	},
            	from: {
            	    initial: "prompt",
            	    states: {
            	        prompt: {
                                entry: send((context) => ({
            	                type: "SPEAK",
            	                value: `Give more details. For example, where does the train departure from?`
            	            })),
            	            on: { ENDSPEECH: "ask"}
            	        },
            	        ask: {
            	            entry: listen()
            	        },
            	    }
            	},
            	to: {
            	    initial: "prompt",
            	    states: {
            	        prompt: {
            	            entry: send((context) => ({
            	                type: "SPEAK",
            	                value: ` more details? For example, where is the destination? `
            	            })),
            	            on: { ENDSPEECH: "ask" }
            	        },
            	        ask: {
            	            entry: listen()
            	        },
            	    }
            	},
            	time: {
            	    initial: "prompt",
            	    states: {
            	        prompt: {
            	            entry: send((context) => ({
            	                type: "SPEAK",
            	                value: `More details please. What time? `
            	            })),
            	            on: { ENDSPEECH: "ask" }
            	        },
            	        ask: {
            	            entry: listen()
            	        },
            	    }
            	},
            	date: {
            	    initial: "prompt",
            	    states: {
            	        prompt: {
            	            entry: send((context) => ({
            	                type: "SPEAK",
            	                value: `More details please. Which day? `
            	            })),
            	            on: { ENDSPEECH: "ask" }
            	        },
            	        ask: {
            	            entry: listen()
            	        },
            	    }
            	},
	            confirm: {
	                initial: "prompt",
	                on: {
            	        RECOGNISED: [
            	        {
            	            cond: (context) => "yesnoanswer" in (prs_grammar(context.recResult, yesnogram) || {}),
            	            actions: 
                                    [assign((context) => { return { confirm: prs_grammar(context.recResult, yesnogram).yesnoanswer } }), 
                                    //cancel('maxsp')
                                ],
            	            target: ".choose"
            	        },
            	        { target: ".nomatch", cond: (context) => !(commands.includes(context.recResult)) }]
            	    },
            	    states: {
            	        prompt: {
            	            entry: send((context) => ({
            	                type: "SPEAK", 
            	                //value: `are you sure?`
            	                value: `Do you want to check when the train goes from ${stationName[context.from]} to ${stationName[context.to]} after ${context.time} for ${context.date} ?`
            	            })),
            	            on: { ENDSPEECH: "ask" }
            	        },
            	        ask: {
            	            entry: send("LISTEN")
            	        },
            	        choose: {
            	              always:  [
            	                     {target: '#main.final', cond: (context) => context.confirm === true },
                    	             {actions: [
                                          assign((context) => { return { from: undefined } }),
                                          assign((context) => { return { to: undefined } }),
                                          assign((context) => { return { time: undefined } }),
                                          assign((context) => { return { date: undefined } })],
                                          target: '#main.welcome', cond: (context) => context.confirm === false }
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
                	        entry: say("OK. Checking."),
                            on : { ENDSPEECH: "check"} 
			            },
			            check: {
			                invoke: {
                                id: 'tvrequest',
                                src: (context) => tvRequest(createText(context.from, context.to, context.time, context.date)),
                                onDone: {
                                  actions: [ assign({ result: (context, event) => event.data.RESPONSE.RESULT[0] })], 
                                  target: 'success',
                                },
                                onError: {
                                  target: 'failure',
                                  actions: assign({ error: (context, event) => event.data })
                                }
                            }
                        },
                        success: {
                           always: [
                               {target: "read_no_result",  cond: (context) => context.result.TrainAnnouncement.length == 0 },
                               {target: "read_result", cond: (context) => context.result.TrainAnnouncement.length !=0 }
                           ], 
          
                        },
                        failure: {
                          entry: say("failed to fetch the data. Try again."),
                          on: { ENDSPEECH: "#main" }
                        },
       	                read_no_result: {
                	        entry: [say("Sorry, No train has been found. Try again.")],
                            on : { ENDSPEECH: "#main"} 
                        },
                        read_result: {
                	        entry: send((context) => ({
            	                type: "SPEAK", value: (createReport(context.result.TrainAnnouncement[0])) 
            	                })),
                            on : { ENDSPEECH: "#main"} 
                        }, 
		            }
                    
            	},
	        },
        }
    },
}
)

function createText(from, to, time, date) {
    var currentdate = new Date()
    if (time === "NOW") {
        var time = ("0" + currentdate.getHours()).slice(-2)+":"+("0" + currentdate.getMinutes()).slice(-2)
    };
    if (date === "today") {
        var date = currentdate.getFullYear()+"-"+("0"+(currentdate.getMonth()+1)).slice(-2)+"-"+("0"+currentdate.getDate()).slice(-2)
    }
    if (date === "tomorrow") {
        var date = currentdate.getFullYear()+"-"+("0"+(currentdate.getMonth()+1)).slice(-2)+"-"+("0"+(currentdate.getDate()+1)).slice(-2)
    }    
    var DateTime = date + "T" + time;
    console.log(DateTime)
    var LteDateTime = date + "T" + "23:59:59"
    console.log(LteDateTime)
	var text = `
	<REQUEST>
      <LOGIN authenticationkey="${openapiconsolekey}" />
      <QUERY objecttype="TrainAnnouncement" schemaversion="1.3" orderby="AdvertisedTimeAtLocation" limit="1">
            <FILTER>
                  <AND>
                        <EQ name="ActivityType" value="Avgang" />
                        <EQ name="LocationSignature" value="${from}" />
                        <EQ name="ToLocation.LocationName" value="${to}" />
                        <GTE name="AdvertisedTimeAtLocation" value="${DateTime}" />
                        <LTE name="AdvertisedTimeAtLocation" value="${LteDateTime}" />
                  </AND>
            </FILTER>
            <INCLUDE>AdvertisedTrainIdent</INCLUDE>
            <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
            <INCLUDE>TrackAtLocation</INCLUDE>
            <INCLUDE>LocationSignature</INCLUDE>
            <INCLUDE>ToLocation.LocationName</INCLUDE>
            
      </QUERY>
    </REQUEST>`
    console.log(text)
return text;
}

function createReport(input) {
    var adTime=input.AdvertisedTimeAtLocation
    var trainNo=input.AdvertisedTrainIdent.slice(0,-4)+" "+input.AdvertisedTrainIdent.slice(-4,-2)+" "+input.AdvertisedTrainIdent.slice(-2)
    var track=input.TrackAtLocation
    var begin=input.LocationSignature
    var final=input.ToLocation[0].LocationName
    var departureTime=adTime.slice(11,16)
    if (track=="x"){
        var text = `Train ${trainNo}, from ${stationName[begin]} to ${stationName[final]}, will departure at ${departureTime}, but the train is canceled.`
    }
    else {
        var text = `Train ${trainNo}, from ${stationName[begin]} to ${stationName[final]}, will departure at ${departureTime}, from track ${track}.`
        }
    console.log(text)
    return text
}
const proxyurl = "";
const rasaurl = 'https://api.trafikinfo.trafikverket.se/v2/data.json'
const tvRequest = (text: string) =>
    fetch(new Request(proxyurl + rasaurl, {
        method: 'POST',
       // headers: { 'Origin': 'http://maraev.me' }, // only required with proxy
        body: text
    }))
        .then(data => data.json());
