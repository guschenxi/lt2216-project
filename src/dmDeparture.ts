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
    initial: 'main_function',
    id: "departureMachine",
    type: 'parallel',
    states: {
	    transitions: {
	        id: "function",
	        on: { 
		        CHECK: [
                    { target: "#main.overall", cond: (context) => context.from === undefined 
                              && context.to === undefined && context.date === undefined && context.time === undefined},
                    { target: "#main.from", cond: (context) => context.from === undefined },
		        	{ target: "#main.to", cond: (context) => context.to === undefined },
		        	{ target: "#main.time", cond: (context) => context.time === undefined },
                    { target: "#main.date", cond: (context) => context.date === undefined },
		        	{ target: "#main.final", 
			          cond: (context) => context.from !== undefined && context.to !== undefined 
                            && context.time !== undefined && context.date !== undefined
                            && context.order !== undefined
                    }
	        	    ],
	        },
	        exit : [(context, event) => console.log(context), cancel("check")],
	    },
	    
        main_function: {
            initial: "welcome",
            id: "main",
            on: {
                RECOGNISED: [
                   { target: '.stop', cond: (context) => ['stopp', 'stop', 'sluta'].includes(context.recResult) },
                   { target: '.startover', cond: (context) => ['start over', 'börja om', 'start from the beginning', 'start from beginning'].includes(context.recResult) },

		   { actions: [
                       assign((context) => { return { from: "from" in (prs_grammar(context.recResult.replace('.',' . '), gram)) ? prs_grammar(context.recResult.replace('.',' . '), gram).from : context.from } }),
                       assign((context) => { return { to: "to" in (prs_grammar(context.recResult.replace('.',' . '), gram)) ? prs_grammar(context.recResult.replace('.',' . '), gram).to : context.to } }),
                       assign((context) => { return { order: "order" in (prs_grammar(context.recResult.replace('.',' . '), gram)) ? prs_grammar(context.recResult.replace('.',' . '), gram).order : context.order } }),
                       assign((context) => { return { time: "time" in (prs_grammar(context.recResult.replace('.',' . '), gram)) ? prs_grammar(context.recResult.replace('.',' . '), gram).time : context.time } }),
                       assign((context) => { return { date: "date" in (prs_grammar(context.recResult.replace('.',' . '), gram)) ? prs_grammar(context.recResult.replace('.',' . '), gram).date : context.date } }),
		       send("CHECK")]
                   }

                 ] 
            },
            states:{
	            startover: {
                    entry: send((_context: SDSContext) => ({ type: "SPEAK", value: "OK. Starting over" })),
                    on: { ENDSPEECH: "#departureMachine" },
                    exit: [assign((context) => { return { from: undefined, to: undefined, time: undefined, date: undefined, order: undefined, result: undefined, output_text: undefined, recResult: undefined } }), cancel("ENDSPEECH")]
                },

                stop: {
                    entry: say("OK. Going back to the root menu."),
                    on: { ENDSPEECH: '#root'},
                    exit: assign((context) => { return { from: undefined, to: undefined, time: undefined, date: undefined, order: undefined, result: undefined, output_text: undefined, recResult: undefined } }),
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
            	                value: `from which station?`
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
            	                value: ` to which station? `
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
            	                value: `After which time? `
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
            	                value: `Which day? `
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
                                          assign((context) => { return { order: undefined } }),
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
                                src: (context) => tvRequest(createText(context.from, context.to, context.time, context.date, context.order)),
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
                               {
                                target: "#main.read_no_result",  
                                cond: (context) => context.result.TrainAnnouncement.length == 0 
                               },
                               {
                                actions: assign({ output_text: (context) => 
                                         createReport(context.result.TrainAnnouncement[0]) }),
                                target: "#main.read_result", 
                                cond: (context) => context.result.TrainAnnouncement.length !=0 
                               }
                           ], 
          
                        },
                        failure: {
                          entry: say("failed to fetch data from the authority. Try again."),
                          on: { ENDSPEECH: "#main" },
                          exit: assign((context) => { return { from: undefined, to: undefined, time: undefined, date: undefined, order: undefined, result: undefined, output_text: undefined } }),
                        },
		            }
            	},

    	        read_no_result: {
                    entry: [say("Sorry, No related info has been found. Try again.")],
                    on : { ENDSPEECH: "#main"}, 
                    exit: assign((context) => { return { from: undefined, to: undefined, time: undefined, date: undefined, order: undefined, result: undefined, output_text: undefined } }),
                },

                read_result: {
                    initial: "prompt",
                    on: {
            	        RECOGNISED: [
            	        {target: ".prompt", cond: (context) => ["en gång till", "igen", "again", "repeat", "listen again"].includes(context.recResult.toLowerCase()) },
            	        {target: ".more_info", cond: (context) => ["mer info", "mer information", "more info"].includes(context.recResult.toLowerCase())},
            	        {actions: assign((context) => { return { from: undefined, to: undefined, time: undefined, date: undefined, order: undefined, result: undefined, output_text: undefined } }), 
            	         target: "#departureMachine", 
            	         cond: (context) => ["gå tillbaka", "börja om", "go back", "start over" ].includes(context.recResult.toLowerCase())},
            	        { target: ".nomatch"}
            	        ]
                    },
                    states: {
                        prompt: {
                            entry: send((context) => ({
                                type: "SPEAK", value: context.output_text 
                                })),
                            on : { ENDSPEECH: "do_next"}
                        },
                        do_next: {
                            entry: send((context) => ({
                                type: "SPEAK", value: `Listen again? or more infomation? or start over?` 
                                })),
                            on : { ENDSPEECH: "ask"}
                        },
                        ask: {
                            entry: send("LISTEN")
                        },
                        nomatch: {
            	            entry: say("Listen again, or, more info, or, start over."),
            	            on: { ENDSPEECH: "ask" }
            	        },
            	        more_info: {
                 	        initial: "prompt",
               	            states: {
                	            prompt: { 
                        	        entry: send((context) => ({
                                type: "SPEAK",
                                value: "checking", 
                                //value: `checking more info about train ${context.result.TrainAnnouncement[0].AdvertisedTrainIdent}` 
                                })),
                                    on : { ENDSPEECH: "check"} 
			                    },
			                    check: {
			                        invoke: {
                                        id: 'tvrequest',
                                        src: (context) => tvRequest(more_info(context.result.TrainAnnouncement[0].AdvertisedTrainIdent, context.time, context.date)),
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
                                       {
                                        target: "#main.read_no_result",  
                                        cond: (context) => context.result.TrainAnnouncement.length == 0 
                                       },
                                       {
                                        actions: assign({ output_text: (context) => 
                                                 createMoreReport(context.result.TrainAnnouncement) }),
                                        target: "#main.read_result", 
                                        cond: (context) => context.result.TrainAnnouncement.length !=0 
                                       }
                                   ], 
                  
                                },
                                failure: {
                                  entry: say("failed to fetch data from the authority. Try again."),
                                  on: { ENDSPEECH: "#main" }
                                },
		                    }            	        
            	        },
                    },     
                },
	        },
        },
    },
}
)

function createText(from, to, time, date, order) {
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
    // console.log(LteDateTime)
    if (order == "desc") {
        var asc_desc = "desc"; 
    } else {
        var asc_desc = "asc"; 
      };
    
	var text = `
	<REQUEST>
      <LOGIN authenticationkey="${openapiconsolekey}" />
      <QUERY objecttype="TrainAnnouncement" schemaversion="1.3" orderby="AdvertisedTimeAtLocation ${asc_desc}" limit="1">
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

function more_info(trainNo, time, date) {
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
    <LOGIN authenticationkey="${openapiconsolekey}"/>
    <QUERY objecttype="TrainAnnouncement" schemaversion="1.3" orderby="AdvertisedTimeAtLocation">
        <FILTER>
            <EQ name="AdvertisedTrainIdent" value="${trainNo}" />
            <EQ name="Advertised" value="true"/>
            <GTE name="AdvertisedTimeAtLocation" value="${DateTime}" />
            <LTE name="AdvertisedTimeAtLocation" value="${LteDateTime}" />
        </FILTER>
        <INCLUDE>AdvertisedTrainIdent</INCLUDE>
        <INCLUDE>LocationSignature</INCLUDE>
        <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
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

function createMoreReport(input) {
    //console.log(input);
    var trainNo=input[0].AdvertisedTrainIdent.slice(0,-4)+" "+input[0].AdvertisedTrainIdent.slice(-4,-2)+" "+input[0].AdvertisedTrainIdent.slice(-2)
    var begin=input[0].LocationSignature
    var begintime=input[0].AdvertisedTimeAtLocation.slice(11,16)
    var final=input[input.length - 1].LocationSignature
    var finaltime=input[input.length - 1].AdvertisedTimeAtLocation.slice(11,16)
    var stations=""    
    for (const [key, value] of Object.entries(input)) {
      //console.log(`${key}`);
      if (key == 0){ continue }; 
      if (key % 2 == 0){ continue };
      if (key == input.length-1){ continue };
      stations = stations + ", " + stationName[value.LocationSignature]
    };
    var text=`
    The train ${trainNo}, will departure from ${stationName[begin]} at ${begintime}. calling at ${stations},
    and finally arrive at ${stationName[final]} at ${finaltime}.
    `
    return text
};


//Trafikverket API
const proxyurl = "";
const rasaurl = 'https://api.trafikinfo.trafikverket.se/v2/data.json'
const tvRequest = (text: string) =>
    fetch(new Request(proxyurl + rasaurl, {
        method: 'POST',
       // headers: { 'Origin': 'http://maraev.me' }, // only required with proxy
        body: text
    }))
        .then(data => data.json());
