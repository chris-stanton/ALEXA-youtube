
// Lambda Function code for Alexa.
// Paste this into your index.js file.

const Alexa = require("ask-sdk");
const https = require("https");

// AIzaSyB0W49-YWqGEJxi0uxc1ABltRl_1N8As5I

const invocationName = "youtube";

// Session Attributes
//   Alexa will track attributes for you, by default only during the lifespan of your session.
//   The history[] array will track previous request(s), used for contextual Help/Yes/No handling.
//   Set up DynamoDB persistence to have the skill save and reload these attributes between skill sessions.

function getMemoryAttributes() {   const memoryAttributes = {
       "history":[],

        // The remaining attributes will be useful after DynamoDB persistence is configured
       "launchCount":0,
       "lastUseTimestamp":0,

       "lastSpeechOutput":{},
       "nextIntent":[]

       // "favoriteColor":"",
       // "name":"",
       // "namePronounce":"",
       // "email":"",
       // "mobileNumber":"",
       // "city":"",
       // "state":"",
       // "postcode":"",
       // "birthday":"",
       // "bookmark":0,
       // "wishlist":[],
   };
   return memoryAttributes;
};

const maxHistorySize = 20; // remember only latest 20 intents


// 1. Intent Handlers =============================================

const AMAZON_CancelIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_HelpIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let intents = getCustomIntents();
        let sampleIntent = randomElement(intents);

        let say = 'You asked for help. ';

        // let previousIntent = getPreviousIntent(sessionAttributes);
        // if (previousIntent && !handlerInput.requestEnvelope.session.new) {
        //     say += 'Your last intent was ' + previousIntent + '. ';
        // }
        // say +=  'I understand  ' + intents.length + ' intents, '

        say += ' Here something you can ask me, ' + getSampleUtterance(sampleIntent);

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_StopIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_PauseIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PauseIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.PauseIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_ResumeIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.ResumeIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.ResumeIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const SearchIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'SearchIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from SearchIntent. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: query
        if (slotValues.query.heardAs) {
            slotStatus += ' slot query was heard as ' + slotValues.query.heardAs + '. ';
        } else {
            slotStatus += 'slot query is empty. ';
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.query.resolved !== slotValues.query.heardAs) {
                slotStatus += 'synonym for ' + slotValues.query.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.query.heardAs + '" to the custom slot type used by slot query! ');
        }

        if( (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.query.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('SearchIntent','query'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const PlayOneIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'PlayOneIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from PlayOneIntent. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: query
        if (slotValues.query.heardAs) {
            slotStatus += ' slot query was heard as ' + slotValues.query.heardAs + '. ';
        } else {
            slotStatus += 'slot query is empty. ';
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.query.resolved !== slotValues.query.heardAs) {
                slotStatus += 'synonym for ' + slotValues.query.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.query.heardAs + '" to the custom slot type used by slot query! ');
        }

        if( (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.query.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('PlayOneIntent','query'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const ShuffleIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ShuffleIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from ShuffleIntent. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: query
        if (slotValues.query.heardAs) {
            slotStatus += ' slot query was heard as ' + slotValues.query.heardAs + '. ';
        } else {
            slotStatus += 'slot query is empty. ';
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.query.resolved !== slotValues.query.heardAs) {
                slotStatus += 'synonym for ' + slotValues.query.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.query.heardAs + '" to the custom slot type used by slot query! ');
        }

        if( (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.query.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('ShuffleIntent','query'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const PlaylistIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'PlaylistIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from PlaylistIntent. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: query
        if (slotValues.query.heardAs) {
            slotStatus += ' slot query was heard as ' + slotValues.query.heardAs + '. ';
        } else {
            slotStatus += 'slot query is empty. ';
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.query.resolved !== slotValues.query.heardAs) {
                slotStatus += 'synonym for ' + slotValues.query.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.query.heardAs + '" to the custom slot type used by slot query! ');
        }

        if( (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.query.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('PlaylistIntent','query'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const ShufflePlaylistIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ShufflePlaylistIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from ShufflePlaylistIntent. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: query
        if (slotValues.query.heardAs) {
            slotStatus += ' slot query was heard as ' + slotValues.query.heardAs + '. ';
        } else {
            slotStatus += 'slot query is empty. ';
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.query.resolved !== slotValues.query.heardAs) {
                slotStatus += 'synonym for ' + slotValues.query.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.query.heardAs + '" to the custom slot type used by slot query! ');
        }

        if( (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.query.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('ShufflePlaylistIntent','query'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const SearchMyPlaylistsIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'SearchMyPlaylistsIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from SearchMyPlaylistsIntent. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: query
        if (slotValues.query.heardAs) {
            slotStatus += ' slot query was heard as ' + slotValues.query.heardAs + '. ';
        } else {
            slotStatus += 'slot query is empty. ';
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.query.resolved !== slotValues.query.heardAs) {
                slotStatus += 'synonym for ' + slotValues.query.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.query.heardAs + '" to the custom slot type used by slot query! ');
        }

        if( (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.query.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('SearchMyPlaylistsIntent','query'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const NextPlaylistIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'NextPlaylistIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from NextPlaylistIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const ShuffleMyPlaylistsIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ShuffleMyPlaylistsIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from ShuffleMyPlaylistsIntent. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: query
        if (slotValues.query.heardAs) {
            slotStatus += ' slot query was heard as ' + slotValues.query.heardAs + '. ';
        } else {
            slotStatus += 'slot query is empty. ';
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.query.resolved !== slotValues.query.heardAs) {
                slotStatus += 'synonym for ' + slotValues.query.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.query.heardAs + '" to the custom slot type used by slot query! ');
        }

        if( (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.query.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('ShuffleMyPlaylistsIntent','query'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const PlayMyLatestVideoIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'PlayMyLatestVideoIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from PlayMyLatestVideoIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const ChannelIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ChannelIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from ChannelIntent. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: query
        if (slotValues.query.heardAs) {
            slotStatus += ' slot query was heard as ' + slotValues.query.heardAs + '. ';
        } else {
            slotStatus += 'slot query is empty. ';
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.query.resolved !== slotValues.query.heardAs) {
                slotStatus += 'synonym for ' + slotValues.query.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.query.heardAs + '" to the custom slot type used by slot query! ');
        }

        if( (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.query.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('ChannelIntent','query'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const ShuffleChannelIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ShuffleChannelIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from ShuffleChannelIntent. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: query
        if (slotValues.query.heardAs) {
            slotStatus += ' slot query was heard as ' + slotValues.query.heardAs + '. ';
        } else {
            slotStatus += 'slot query is empty. ';
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.query.resolved !== slotValues.query.heardAs) {
                slotStatus += 'synonym for ' + slotValues.query.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.query.heardAs + '" to the custom slot type used by slot query! ');
        }

        if( (slotValues.query.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.query.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('ShuffleChannelIntent','query'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const NowPlayingIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'NowPlayingIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from NowPlayingIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const PlayMoreLikeThisIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'PlayMoreLikeThisIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from PlayMoreLikeThisIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AutoplayOnIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AutoplayOnIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AutoplayOnIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AutoplayOffIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AutoplayOffIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AutoplayOffIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const SayTimestampIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'SayTimestampIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from SayTimestampIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AddVideoToFavoritesIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AddVideoToFavoritesIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AddVideoToFavoritesIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AddChannelToFavoritesIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AddChannelToFavoritesIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AddChannelToFavoritesIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AddPlaylistToFavoritesIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AddPlaylistToFavoritesIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AddPlaylistToFavoritesIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AlexaPlaylistIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AlexaPlaylistIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AlexaPlaylistIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const SkipToIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'SkipToIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from SkipToIntent. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: minutes
        if (slotValues.minutes.heardAs) {
            slotStatus += ' slot minutes was heard as ' + slotValues.minutes.heardAs + '. ';
        } else {
            slotStatus += 'slot minutes is empty. ';
        }
        if (slotValues.minutes.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.minutes.resolved !== slotValues.minutes.heardAs) {
                slotStatus += 'synonym for ' + slotValues.minutes.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.minutes.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.minutes.heardAs + '" to the custom slot type used by slot minutes! ');
        }

        if( (slotValues.minutes.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.minutes.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('SkipToIntent','minutes'), 'or');
        }
        //   SLOT: seconds
        if (slotValues.seconds.heardAs) {
            slotStatus += ' slot seconds was heard as ' + slotValues.seconds.heardAs + '. ';
        } else {
            slotStatus += 'slot seconds is empty. ';
        }
        if (slotValues.seconds.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.seconds.resolved !== slotValues.seconds.heardAs) {
                slotStatus += 'synonym for ' + slotValues.seconds.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.seconds.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.seconds.heardAs + '" to the custom slot type used by slot seconds! ');
        }

        if( (slotValues.seconds.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.seconds.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('SkipToIntent','seconds'), 'or');
        }
        //   SLOT: hours
        if (slotValues.hours.heardAs) {
            slotStatus += ' slot hours was heard as ' + slotValues.hours.heardAs + '. ';
        } else {
            slotStatus += 'slot hours is empty. ';
        }
        if (slotValues.hours.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.hours.resolved !== slotValues.hours.heardAs) {
                slotStatus += 'synonym for ' + slotValues.hours.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.hours.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.hours.heardAs + '" to the custom slot type used by slot hours! ');
        }

        if( (slotValues.hours.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.hours.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('SkipToIntent','hours'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const SkipForwardIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'SkipForwardIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from SkipForwardIntent. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: minutes
        if (slotValues.minutes.heardAs) {
            slotStatus += ' slot minutes was heard as ' + slotValues.minutes.heardAs + '. ';
        } else {
            slotStatus += 'slot minutes is empty. ';
        }
        if (slotValues.minutes.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.minutes.resolved !== slotValues.minutes.heardAs) {
                slotStatus += 'synonym for ' + slotValues.minutes.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.minutes.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.minutes.heardAs + '" to the custom slot type used by slot minutes! ');
        }

        if( (slotValues.minutes.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.minutes.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('SkipForwardIntent','minutes'), 'or');
        }
        //   SLOT: seconds
        if (slotValues.seconds.heardAs) {
            slotStatus += ' slot seconds was heard as ' + slotValues.seconds.heardAs + '. ';
        } else {
            slotStatus += 'slot seconds is empty. ';
        }
        if (slotValues.seconds.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.seconds.resolved !== slotValues.seconds.heardAs) {
                slotStatus += 'synonym for ' + slotValues.seconds.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.seconds.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.seconds.heardAs + '" to the custom slot type used by slot seconds! ');
        }

        if( (slotValues.seconds.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.seconds.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('SkipForwardIntent','seconds'), 'or');
        }
        //   SLOT: hours
        if (slotValues.hours.heardAs) {
            slotStatus += ' slot hours was heard as ' + slotValues.hours.heardAs + '. ';
        } else {
            slotStatus += 'slot hours is empty. ';
        }
        if (slotValues.hours.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.hours.resolved !== slotValues.hours.heardAs) {
                slotStatus += 'synonym for ' + slotValues.hours.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.hours.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.hours.heardAs + '" to the custom slot type used by slot hours! ');
        }

        if( (slotValues.hours.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.hours.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('SkipForwardIntent','hours'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const SkipBackwardIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'SkipBackwardIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from SkipBackwardIntent. ';

        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: minutes
        if (slotValues.minutes.heardAs) {
            slotStatus += ' slot minutes was heard as ' + slotValues.minutes.heardAs + '. ';
        } else {
            slotStatus += 'slot minutes is empty. ';
        }
        if (slotValues.minutes.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.minutes.resolved !== slotValues.minutes.heardAs) {
                slotStatus += 'synonym for ' + slotValues.minutes.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.minutes.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.minutes.heardAs + '" to the custom slot type used by slot minutes! ');
        }

        if( (slotValues.minutes.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.minutes.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('SkipBackwardIntent','minutes'), 'or');
        }
        //   SLOT: seconds
        if (slotValues.seconds.heardAs) {
            slotStatus += ' slot seconds was heard as ' + slotValues.seconds.heardAs + '. ';
        } else {
            slotStatus += 'slot seconds is empty. ';
        }
        if (slotValues.seconds.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.seconds.resolved !== slotValues.seconds.heardAs) {
                slotStatus += 'synonym for ' + slotValues.seconds.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.seconds.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.seconds.heardAs + '" to the custom slot type used by slot seconds! ');
        }

        if( (slotValues.seconds.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.seconds.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('SkipBackwardIntent','seconds'), 'or');
        }
        //   SLOT: hours
        if (slotValues.hours.heardAs) {
            slotStatus += ' slot hours was heard as ' + slotValues.hours.heardAs + '. ';
        } else {
            slotStatus += 'slot hours is empty. ';
        }
        if (slotValues.hours.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if(slotValues.hours.resolved !== slotValues.hours.heardAs) {
                slotStatus += 'synonym for ' + slotValues.hours.resolved + '. ';
                } else {
                slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.hours.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.hours.heardAs + '" to the custom slot type used by slot hours! ');
        }

        if( (slotValues.hours.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.hours.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('SkipBackwardIntent','hours'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_YesIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'You said Yes. ';
        let previousIntent = getPreviousIntent(sessionAttributes);

        if (previousIntent && !handlerInput.requestEnvelope.session.new) {
            say += 'Your last intent was ' + previousIntent + '. ';
        }

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_NoIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'You said No. ';
        let previousIntent = getPreviousIntent(sessionAttributes);

        if (previousIntent && !handlerInput.requestEnvelope.session.new) {
            say += 'Your last intent was ' + previousIntent + '. ';
        }

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_NavigateHomeIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NavigateHomeIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.NavigateHomeIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const LaunchRequest_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;

        let say = 'hello' + ' and welcome to ' + invocationName + ' ! Say help to hear some options.';

        let skillTitle = capitalize(invocationName);


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .withStandardCard('Welcome!',
              'Hello!\nThis is a card for your skill, ' + skillTitle,
               welcomeCardImg.smallImageUrl, welcomeCardImg.largeImageUrl)
            .getResponse();
    },
};

const SessionEndedHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler =  {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;

        console.log(`Error handled: ${error.message}`);
        // console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

        return handlerInput.responseBuilder
            .speak('Sorry, an error occurred.  Please say again.')
            .reprompt('Sorry, an error occurred.  Please say again.')
            .getResponse();
    }
};


// 2. Constants ===========================================================================

    // Here you can define static data, to be used elsewhere in your code.  For example:
    //    const myString = "Hello World";
    //    const myArray  = [ "orange", "grape", "strawberry" ];
    //    const myObject = { "city": "Boston",  "state":"Massachusetts" };

const APP_ID = undefined;  // TODO replace with your Skill ID (OPTIONAL).

// 3.  Helper Functions ===================================================================

function capitalize(myString) {

     return myString.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); }) ;
}


function randomElement(myArray) {
    return(myArray[Math.floor(Math.random() * myArray.length)]);
}

function stripSpeak(str) {
    return(str.replace('<speak>', '').replace('</speak>', ''));
}




function getSlotValues(filledSlots) {
    const slotValues = {};

    Object.keys(filledSlots).forEach((item) => {
        const name  = filledSlots[item].name;

        if (filledSlots[item] &&
            filledSlots[item].resolutions &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
                case 'ER_SUCCESS_MATCH':
                    slotValues[name] = {
                        heardAs: filledSlots[item].value,
                        resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                        ERstatus: 'ER_SUCCESS_MATCH'
                    };
                    break;
                case 'ER_SUCCESS_NO_MATCH':
                    slotValues[name] = {
                        heardAs: filledSlots[item].value,
                        resolved: '',
                        ERstatus: 'ER_SUCCESS_NO_MATCH'
                    };
                    break;
                default:
                    break;
            }
        } else {
            slotValues[name] = {
                heardAs: filledSlots[item].value,
                resolved: '',
                ERstatus: ''
            };
        }
    }, this);

    return slotValues;
}

function getExampleSlotValues(intentName, slotName) {

    let examples = [];
    let slotType = '';
    let slotValuesFull = [];

    let intents = model.interactionModel.languageModel.intents;
    for (let i = 0; i < intents.length; i++) {
        if (intents[i].name == intentName) {
            let slots = intents[i].slots;
            for (let j = 0; j < slots.length; j++) {
                if (slots[j].name === slotName) {
                    slotType = slots[j].type;

                }
            }
        }

    }
    let types = model.interactionModel.languageModel.types;
    for (let i = 0; i < types.length; i++) {
        if (types[i].name === slotType) {
            slotValuesFull = types[i].values;
        }
    }


    examples.push(slotValuesFull[0].name.value);
    examples.push(slotValuesFull[1].name.value);
    if (slotValuesFull.length > 2) {
        examples.push(slotValuesFull[2].name.value);
    }


    return examples;
}

function sayArray(myData, penultimateWord = 'and') {
    let result = '';

    myData.forEach(function(element, index, arr) {

        if (index === 0) {
            result = element;
        } else if (index === myData.length - 1) {
            result += ` ${penultimateWord} ${element}`;
        } else {
            result += `, ${element}`;
        }
    });
    return result;
}
function supportsDisplay(handlerInput) // returns true if the skill is running on a device with a display (Echo Show, Echo Spot, etc.)
{                                      //  Enable your skill for display as shown here: https://alexa.design/enabledisplay
    const hasDisplay =
        handlerInput.requestEnvelope.context &&
        handlerInput.requestEnvelope.context.System &&
        handlerInput.requestEnvelope.context.System.device &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;

    return hasDisplay;
}


const welcomeCardImg = {
    smallImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane720_480.png",
    largeImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane1200_800.png"


};

const DisplayImg1 = {
    title: 'Jet Plane',
    url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png'
};
const DisplayImg2 = {
    title: 'Starry Sky',
    url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png'

};

function getCustomIntents() {
    const modelIntents = model.interactionModel.languageModel.intents;

    let customIntents = [];


    for (let i = 0; i < modelIntents.length; i++) {

        if(modelIntents[i].name.substring(0,7) != "AMAZON." && modelIntents[i].name !== "LaunchRequest" ) {
            customIntents.push(modelIntents[i]);
        }
    }
    return customIntents;
}

function getSampleUtterance(intent) {

    return randomElement(intent.samples);

}

function getPreviousIntent(attrs) {

    if (attrs.history && attrs.history.length > 1) {
        return attrs.history[attrs.history.length - 2].IntentRequest;

    } else {
        return false;
    }

}

function getPreviousSpeechOutput(attrs) {

    if (attrs.lastSpeechOutput && attrs.history.length > 1) {
        return attrs.lastSpeechOutput;

    } else {
        return false;
    }

}

function timeDelta(t1, t2) {

    const dt1 = new Date(t1);
    const dt2 = new Date(t2);
    const timeSpanMS = dt2.getTime() - dt1.getTime();
    const span = {
        "timeSpanMIN": Math.floor(timeSpanMS / (1000 * 60 )),
        "timeSpanHR": Math.floor(timeSpanMS / (1000 * 60 * 60)),
        "timeSpanDAY": Math.floor(timeSpanMS / (1000 * 60 * 60 * 24)),
        "timeSpanDesc" : ""
    };


    if (span.timeSpanHR < 2) {
        span.timeSpanDesc = span.timeSpanMIN + " minutes";
    } else if (span.timeSpanDAY < 2) {
        span.timeSpanDesc = span.timeSpanHR + " hours";
    } else {
        span.timeSpanDesc = span.timeSpanDAY + " days";
    }


    return span;

}


const InitMemoryAttributesInterceptor = {
    process(handlerInput) {
        let sessionAttributes = {};
        if(handlerInput.requestEnvelope.session['new']) {

            sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

            let memoryAttributes = getMemoryAttributes();

            if(Object.keys(sessionAttributes).length === 0) {

                Object.keys(memoryAttributes).forEach(function(key) {  // initialize all attributes from global list

                    sessionAttributes[key] = memoryAttributes[key];

                });

            }
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);


        }
    }
};

const RequestHistoryInterceptor = {
    process(handlerInput) {

        const thisRequest = handlerInput.requestEnvelope.request;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let history = sessionAttributes['history'] || [];

        let IntentRequest = {};
        if (thisRequest.type === 'IntentRequest' ) {

            let slots = [];

            IntentRequest = {
                'IntentRequest' : thisRequest.intent.name
            };

            if (thisRequest.intent.slots) {

                for (let slot in thisRequest.intent.slots) {
                    let slotObj = {};
                    slotObj[slot] = thisRequest.intent.slots[slot].value;
                    slots.push(slotObj);
                }

                IntentRequest = {
                    'IntentRequest' : thisRequest.intent.name,
                    'slots' : slots
                };

            }

        } else {
            IntentRequest = {'IntentRequest' : thisRequest.type};
        }
        if(history.length > maxHistorySize - 1) {
            history.shift();
        }
        history.push(IntentRequest);

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    }

};




const RequestPersistenceInterceptor = {
    process(handlerInput) {

        if(handlerInput.requestEnvelope.session['new']) {

            return new Promise((resolve, reject) => {

                handlerInput.attributesManager.getPersistentAttributes()

                    .then((sessionAttributes) => {
                        sessionAttributes = sessionAttributes || {};


                        sessionAttributes['launchCount'] += 1;

                        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                        handlerInput.attributesManager.savePersistentAttributes()
                            .then(() => {
                                resolve();
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    });

            });

        } // end session['new']
    }
};


const ResponseRecordSpeechOutputInterceptor = {
    process(handlerInput, responseOutput) {

        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let lastSpeechOutput = {
            "outputSpeech":responseOutput.outputSpeech.ssml,
            "reprompt":responseOutput.reprompt.outputSpeech.ssml
        };

        sessionAttributes['lastSpeechOutput'] = lastSpeechOutput;

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    }
};

const ResponsePersistenceInterceptor = {
    process(handlerInput, responseOutput) {

        const ses = (typeof responseOutput.shouldEndSession == "undefined" ? true : responseOutput.shouldEndSession);

        if(ses || handlerInput.requestEnvelope.request.type == 'SessionEndedRequest') { // skill was stopped or timed out

            let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

            sessionAttributes['lastUseTimestamp'] = new Date(handlerInput.requestEnvelope.request.timestamp).getTime();

            handlerInput.attributesManager.setPersistentAttributes(sessionAttributes);

            return new Promise((resolve, reject) => {
                handlerInput.attributesManager.savePersistentAttributes()
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });

            });

        }

    }
};



// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
    .addRequestHandlers(
        AMAZON_CancelIntent_Handler,
        AMAZON_HelpIntent_Handler,
        AMAZON_StopIntent_Handler,
        AMAZON_PauseIntent_Handler,
        AMAZON_ResumeIntent_Handler,
        SearchIntent_Handler,
        PlayOneIntent_Handler,
        ShuffleIntent_Handler,
        PlaylistIntent_Handler,
        ShufflePlaylistIntent_Handler,
        SearchMyPlaylistsIntent_Handler,
        NextPlaylistIntent_Handler,
        ShuffleMyPlaylistsIntent_Handler,
        PlayMyLatestVideoIntent_Handler,
        ChannelIntent_Handler,
        ShuffleChannelIntent_Handler,
        NowPlayingIntent_Handler,
        PlayMoreLikeThisIntent_Handler,
        AutoplayOnIntent_Handler,
        AutoplayOffIntent_Handler,
        SayTimestampIntent_Handler,
        AddVideoToFavoritesIntent_Handler,
        AddChannelToFavoritesIntent_Handler,
        AddPlaylistToFavoritesIntent_Handler,
        AlexaPlaylistIntent_Handler,
        SkipToIntent_Handler,
        SkipForwardIntent_Handler,
        SkipBackwardIntent_Handler,
        AMAZON_YesIntent_Handler,
        AMAZON_NoIntent_Handler,
        AMAZON_NavigateHomeIntent_Handler,
        LaunchRequest_Handler,
        SessionEndedHandler
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(InitMemoryAttributesInterceptor)
    .addRequestInterceptors(RequestHistoryInterceptor)

   // .addResponseInterceptors(ResponseRecordSpeechOutputInterceptor)

 // .addRequestInterceptors(RequestPersistenceInterceptor)
 // .addResponseInterceptors(ResponsePersistenceInterceptor)

 // .withTableName("askMemorySkillTable")
 // .withAutoCreateTable(true)

    .lambda();


// End of Skill code -------------------------------------------------------------
// Static Language Model for reference

const model = {
  "interactionModel": {
    "languageModel": {
      "invocationName": "youtube",
      "intents": [
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        },
        {
          "name": "AMAZON.PauseIntent",
          "samples": []
        },
        {
          "name": "AMAZON.ResumeIntent",
          "samples": []
        },
        {
          "name": "SearchIntent",
          "slots": [
            {
              "name": "query",
              "type": "AMAZON.SearchQuery"
            }
          ],
          "samples": [
            "play music by {query}",
            "play songs by {query}",
            "play videos by {query}",
            "search for {query}",
            "Play {query}"
          ]
        },
        {
          "name": "PlayOneIntent",
          "slots": [
            {
              "name": "query",
              "type": "AMAZON.SearchQuery"
            }
          ],
          "samples": [
            "play the song {query}",
            "play the video {query}",
            "play the track {query}",
            "play one song {query}",
            "play one video {query}",
            "play one track {query}"
          ]
        },
        {
          "name": "ShuffleIntent",
          "slots": [
            {
              "name": "query",
              "type": "AMAZON.SearchQuery"
            }
          ],
          "samples": [
            "shuffle {query}",
            "shuffle songs by {query}",
            "shuffle music by {query}",
            "shuffle videos by {query}"
          ]
        },
        {
          "name": "PlaylistIntent",
          "slots": [
            {
              "name": "query",
              "type": "AMAZON.SearchQuery"
            }
          ],
          "samples": [
            "Start playlist {query}",
            "Listen to playlist {query}",
            "Play playlist {query}"
          ]
        },
        {
          "name": "ShufflePlaylistIntent",
          "slots": [
            {
              "name": "query",
              "type": "AMAZON.SearchQuery"
            }
          ],
          "samples": [
            "Shuffle playlist {query}"
          ]
        },
        {
          "name": "SearchMyPlaylistsIntent",
          "slots": [
            {
              "name": "query",
              "type": "AMAZON.SearchQuery"
            }
          ],
          "samples": [
            "Start my playlist {query}",
            "Listen to my playlist {query}",
            "Play my playlist {query}"
          ]
        },
        {
          "name": "NextPlaylistIntent",
          "slots": [],
          "samples": [
            "Next playlist"
          ]
        },
        {
          "name": "ShuffleMyPlaylistsIntent",
          "slots": [
            {
              "name": "query",
              "type": "AMAZON.SearchQuery"
            }
          ],
          "samples": [
            "Shuffle my playlist {query}"
          ]
        },
        {
          "name": "PlayMyLatestVideoIntent",
          "slots": [],
          "samples": [
            "Play my latest video"
          ]
        },
        {
          "name": "ChannelIntent",
          "slots": [
            {
              "name": "query",
              "type": "AMAZON.SearchQuery"
            }
          ],
          "samples": [
            "Listen to channel {query}",
            "Start channel {query} ",
            "Play channel {query}"
          ]
        },
        {
          "name": "ShuffleChannelIntent",
          "slots": [
            {
              "name": "query",
              "type": "AMAZON.SearchQuery"
            }
          ],
          "samples": [
            "Shuffle channel {query}"
          ]
        },
        {
          "name": "NowPlayingIntent",
          "slots": [],
          "samples": [
            "Who is this",
            "What video is playing",
            "What song is playing",
            "What is this",
            "What is playing"
          ]
        },
        {
          "name": "PlayMoreLikeThisIntent",
          "slots": [],
          "samples": [
            "Play more like this",
            "Play videos like this",
            "Play similar videos"
          ]
        },
        {
          "name": "AutoplayOnIntent",
          "slots": [],
          "samples": [
            "Turn on autoplay",
            "Turn autoplay on",
            "Switch autoplay on",
            "Switch on autoplay"
          ]
        },
        {
          "name": "AutoplayOffIntent",
          "slots": [],
          "samples": [
            "Turn off autoplay",
            "Turn autoplay off",
            "Switch autoplay off",
            "Switch off autoplay",
            "Play this one video"
          ]
        },
        {
          "name": "SayTimestampIntent",
          "slots": [],
          "samples": [
            "How far into this video are we",
            "What is the current timestamp",
            "What is the time",
            "What is the timestamp"
          ]
        },
        {
          "name": "AddVideoToFavoritesIntent",
          "slots": [],
          "samples": [
            "Add to favorites",
            "Make this a favorite",
            "Add this video to favorites",
            "Add this song to favorites"
          ]
        },
        {
          "name": "AddChannelToFavoritesIntent",
          "slots": [],
          "samples": [
            "Add channel to favorites",
            "Add this channel to my favorites"
          ]
        },
        {
          "name": "AddPlaylistToFavoritesIntent",
          "slots": [],
          "samples": [
            "Add this playlist to my favorites",
            "Add playlist to favorites"
          ]
        },
        {
          "name": "AlexaPlaylistIntent",
          "slots": [],
          "samples": [
            "play the requests playlist",
            "play the alexa playlist",
            "play my requests playlist",
            "play my alexa playlist"
          ]
        },
        {
          "name": "SkipToIntent",
          "slots": [
            {
              "name": "minutes",
              "type": "AMAZON.NUMBER"
            },
            {
              "name": "seconds",
              "type": "AMAZON.NUMBER"
            },
            {
              "name": "hours",
              "type": "AMAZON.NUMBER"
            }
          ],
          "samples": [
            "Skip to {hours} hours",
            "Skip to {hours} hour",
            "Skip to {hours} {minutes} {seconds}",
            "Skip to {hours} hours {minutes} minutes and {seconds} seconds",
            "Skip to {hours} hour {minutes} minutes and {seconds} seconds",
            "Skip to {hours} hour {minutes} minute and {seconds} seconds",
            "Skip to {hours} hours {minutes} minute and {seconds} seconds",
            "Skip to {hours} hours {minutes} minutes and {seconds} second",
            "Skip to {hours} hour {minutes} minutes and {seconds} second",
            "Skip to {hours} hour {minutes} minute and {seconds} second",
            "Skip to {hours} hours {minutes} minute and {seconds} second",
            "Skip to {hours} hours {minutes} minutes",
            "Skip to {hours} hour {minutes} minutes",
            "Skip to {hours} hours {minutes} minute",
            "Skip to {hours} hour {minutes} minute",
            "Skip to {minutes} {seconds}",
            "Skip to {minutes} minutes and {seconds} seconds",
            "Skip to {minutes} minute and {seconds} seconds",
            "Skip to {minutes} minutes and {seconds} second",
            "Skip to {minutes} minute and {seconds} second",
            "Skip to {minutes} minutes",
            "Skip to {minutes} minute",
            "Skip to {seconds} seconds",
            "Skip to {seconds} second",
            "Jump to {hours} hours",
            "Jump to {hours} hour",
            "Jump to {hours} {minutes} {seconds}",
            "Jump to {hours} hours {minutes} minutes and {seconds} seconds",
            "Jump to {hours} hour {minutes} minutes and {seconds} seconds",
            "Jump to {hours} hour {minutes} minute and {seconds} seconds",
            "Jump to {hours} hours {minutes} minute and {seconds} seconds",
            "Jump to {hours} hours {minutes} minutes and {seconds} second",
            "Jump to {hours} hour {minutes} minutes and {seconds} second",
            "Jump to {hours} hour {minutes} minute and {seconds} second",
            "Jump to {hours} hours {minutes} minute and {seconds} second",
            "Jump to {hours} hours {minutes} minutes",
            "Jump to {hours} hour {minutes} minutes",
            "Jump to {hours} hours {minutes} minute",
            "Jump to {hours} hour {minutes} minute",
            "Jump to {minutes} {seconds}",
            "Jump to {minutes} minutes and {seconds} seconds",
            "Jump to {minutes} minute and {seconds} seconds",
            "Jump to {minutes} minutes and {seconds} second",
            "Jump to {minutes} minute and {seconds} second",
            "Jump to {minutes} minutes",
            "Jump to {minutes} minute",
            "Jump to {seconds} seconds",
            "Jump to {seconds} second",
            "Go to {hours} hours",
            "Go to {hours} hour",
            "Go to {hours} {minutes} {seconds}",
            "Go to {hours} hours {minutes} minutes and {seconds} seconds",
            "Go to {hours} hour {minutes} minutes and {seconds} seconds",
            "Go to {hours} hour {minutes} minute and {seconds} seconds",
            "Go to {hours} hours {minutes} minute and {seconds} seconds",
            "Go to {hours} hours {minutes} minutes and {seconds} second",
            "Go to {hours} hour {minutes} minutes and {seconds} second",
            "Go to {hours} hour {minutes} minute and {seconds} second",
            "Go to {hours} hours {minutes} minute and {seconds} second",
            "Go to {hours} hours {minutes} minutes",
            "Go to {hours} hour {minutes} minutes",
            "Go to {hours} hours {minutes} minute",
            "Go to {hours} hour {minutes} minute",
            "Go to {minutes} {seconds}",
            "Go to {minutes} minutes and {seconds} seconds",
            "Go to {minutes} minute and {seconds} seconds",
            "Go to {minutes} minutes and {seconds} second",
            "Go to {minutes} minute and {seconds} second",
            "Go to {minutes} minutes",
            "Go to {minutes} minute",
            "Go to {seconds} seconds",
            "Go to {seconds} second",
            "Fast forward to {hours} hours",
            "Fast forward to {hours} hour",
            "Fast forward to {hours} {minutes} {seconds}",
            "Fast forward to {hours} hours {minutes} minutes and {seconds} seconds",
            "Fast forward to {hours} hour {minutes} minutes and {seconds} seconds",
            "Fast forward to {hours} hour {minutes} minute and {seconds} seconds",
            "Fast forward to {hours} hours {minutes} minute and {seconds} seconds",
            "Fast forward to {hours} hours {minutes} minutes and {seconds} second",
            "Fast forward to {hours} hour {minutes} minutes and {seconds} second",
            "Fast forward to {hours} hour {minutes} minute and {seconds} second",
            "Fast forward to {hours} hours {minutes} minute and {seconds} second",
            "Fast forward to {hours} hours {minutes} minutes",
            "Fast forward to {hours} hour {minutes} minutes",
            "Fast forward to {hours} hours {minutes} minute",
            "Fast forward to {hours} hour {minutes} minute",
            "Fast forward to {minutes} {seconds}",
            "Fast forward to {minutes} minutes and {seconds} seconds",
            "Fast forward to {minutes} minute and {seconds} seconds",
            "Fast forward to {minutes} minutes and {seconds} second",
            "Fast forward to {minutes} minute and {seconds} second",
            "Fast forward to {minutes} minutes",
            "Fast forward to {minutes} minute",
            "Fast forward to {seconds} seconds",
            "Fast forward to {seconds} second",
            "Rewind to {hours} hours",
            "Rewind to {hours} hour",
            "Rewind to {hours} {minutes} {seconds}",
            "Rewind to {hours} hours {minutes} minutes and {seconds} seconds",
            "Rewind to {hours} hour {minutes} minutes and {seconds} seconds",
            "Rewind to {hours} hour {minutes} minute and {seconds} seconds",
            "Rewind to {hours} hours {minutes} minute and {seconds} seconds",
            "Rewind to {hours} hours {minutes} minutes and {seconds} second",
            "Rewind to {hours} hour {minutes} minutes and {seconds} second",
            "Rewind to {hours} hour {minutes} minute and {seconds} second",
            "Rewind to {hours} hours {minutes} minute and {seconds} second",
            "Rewind to {hours} hours {minutes} minutes",
            "Rewind to {hours} hour {minutes} minutes",
            "Rewind to {hours} hours {minutes} minute",
            "Rewind to {hours} hour {minutes} minute",
            "Rewind to {minutes} {seconds}",
            "Rewind to {minutes} minutes and {seconds} seconds",
            "Rewind to {minutes} minute and {seconds} seconds",
            "Rewind to {minutes} minutes and {seconds} second",
            "Rewind to {minutes} minute and {seconds} second",
            "Rewind to {minutes} minutes",
            "Rewind to {minutes} minute",
            "Rewind to {seconds} seconds",
            "Rewind to {seconds} second"
          ]
        },
        {
          "name": "SkipForwardIntent",
          "slots": [
            {
              "name": "minutes",
              "type": "AMAZON.NUMBER"
            },
            {
              "name": "seconds",
              "type": "AMAZON.NUMBER"
            },
            {
              "name": "hours",
              "type": "AMAZON.NUMBER"
            }
          ],
          "samples": [
            "Fast forward {hours} hours",
            "Fast forward {hours} hour",
            "Fast forward {hours} hours {minutes} minutes and {seconds} seconds",
            "Fast forward {hours} hour {minutes} minutes and {seconds} seconds",
            "Fast forward {hours} hour {minutes} minute and {seconds} seconds",
            "Fast forward {hours} hours {minutes} minute and {seconds} seconds",
            "Fast forward {hours} hours {minutes} minutes and {seconds} second",
            "Fast forward {hours} hour {minutes} minutes and {seconds} second",
            "Fast forward {hours} hour {minutes} minute and {seconds} second",
            "Fast forward {hours} hours {minutes} minute and {seconds} second",
            "Fast forward {hours} hours {minutes} minutes",
            "Fast forward {hours} hours {minutes} minute",
            "Fast forward {hours} hour {minutes} minute",
            "Fast forward {hours} hour {minutes} minutes",
            "Fast forward {minutes} minutes and {seconds} seconds",
            "Fast forward {minutes} minutes and {seconds} second",
            "Fast forward {minutes} minute and {seconds} seconds",
            "Fast forward {minutes} minute and {seconds} second",
            "Fast forward {minutes} minutes",
            "Fast forward {seconds} seconds",
            "Fast forward {minutes} minute",
            "Fast forward {seconds} second",
            "Skip forward {hours} hours",
            "Skip forward {hours} hour",
            "Skip forward {hours} hours {minutes} minutes and {seconds} seconds",
            "Skip forward {hours} hour {minutes} minutes and {seconds} seconds",
            "Skip forward {hours} hour {minutes} minute and {seconds} seconds",
            "Skip forward {hours} hours {minutes} minute and {seconds} seconds",
            "Skip forward {hours} hours {minutes} minutes and {seconds} second",
            "Skip forward {hours} hour {minutes} minutes and {seconds} second",
            "Skip forward {hours} hour {minutes} minute and {seconds} second",
            "Skip forward {hours} hours {minutes} minute and {seconds} second",
            "Skip forward {hours} hours {minutes} minutes",
            "Skip forward {hours} hours {minutes} minute",
            "Skip forward {hours} hour {minutes} minute",
            "Skip forward {hours} hour {minutes} minutes",
            "Skip forward {minutes} minutes and {seconds} seconds",
            "Skip forward {minutes} minutes and {seconds} second",
            "Skip forward {minutes} minute and {seconds} seconds",
            "Skip forward {minutes} minute and {seconds} second",
            "Skip forward {minutes} minutes",
            "Skip forward {seconds} seconds",
            "Skip forward {minutes} minute",
            "Skip forward {seconds} second",
            "Skip {hours} hours",
            "Skip {hours} hour",
            "Skip {hours} hours {minutes} minutes and {seconds} seconds",
            "Skip {hours} hour {minutes} minutes and {seconds} seconds",
            "Skip {hours} hour {minutes} minute and {seconds} seconds",
            "Skip {hours} hours {minutes} minute and {seconds} seconds",
            "Skip {hours} hours {minutes} minutes and {seconds} second",
            "Skip {hours} hour {minutes} minutes and {seconds} second",
            "Skip {hours} hour {minutes} minute and {seconds} second",
            "Skip {hours} hours {minutes} minute and {seconds} second",
            "Skip {hours} hours {minutes} minutes",
            "Skip {hours} hours {minutes} minute",
            "Skip {hours} hour {minutes} minute",
            "Skip {hours} hour {minutes} minutes",
            "Skip {minutes} minutes and {seconds} seconds",
            "Skip {minutes} minutes and {seconds} second",
            "Skip {minutes} minute and {seconds} seconds",
            "Skip {minutes} minute and {seconds} second",
            "Skip {minutes} minutes",
            "Skip {seconds} seconds",
            "Skip {minutes} minute",
            "Skip {seconds} second",
            "Jump forward {hours} hours",
            "Jump forward {hours} hour",
            "Jump forward {hours} hours {minutes} minutes and {seconds} seconds",
            "Jump forward {hours} hour {minutes} minutes and {seconds} seconds",
            "Jump forward {hours} hour {minutes} minute and {seconds} seconds",
            "Jump forward {hours} hours {minutes} minute and {seconds} seconds",
            "Jump forward {hours} hours {minutes} minutes and {seconds} second",
            "Jump forward {hours} hour {minutes} minutes and {seconds} second",
            "Jump forward {hours} hour {minutes} minute and {seconds} second",
            "Jump forward {hours} hours {minutes} minute and {seconds} second",
            "Jump forward {hours} hours {minutes} minutes",
            "Jump forward {hours} hours {minutes} minute",
            "Jump forward {hours} hour {minutes} minute",
            "Jump forward {hours} hour {minutes} minutes",
            "Jump forward {minutes} minutes and {seconds} seconds",
            "Jump forward {minutes} minutes and {seconds} second",
            "Jump forward {minutes} minute and {seconds} seconds",
            "Jump forward {minutes} minute and {seconds} second",
            "Jump forward {minutes} minutes",
            "Jump forward {seconds} seconds",
            "Jump forward {minutes} minute",
            "Jump forward {seconds} second",
            "Go forward {hours} hours",
            "Go forward {hours} hour",
            "Go forward {hours} hours {minutes} minutes and {seconds} seconds",
            "Go forward {hours} hour {minutes} minutes and {seconds} seconds",
            "Go forward {hours} hour {minutes} minute and {seconds} seconds",
            "Go forward {hours} hours {minutes} minute and {seconds} seconds",
            "Go forward {hours} hours {minutes} minutes and {seconds} second",
            "Go forward {hours} hour {minutes} minutes and {seconds} second",
            "Go forward {hours} hour {minutes} minute and {seconds} second",
            "Go forward {hours} hours {minutes} minute and {seconds} second",
            "Go forward {hours} hours {minutes} minutes",
            "Go forward {hours} hours {minutes} minute",
            "Go forward {hours} hour {minutes} minute",
            "Go forward {hours} hour {minutes} minutes",
            "Go forward {minutes} minutes and {seconds} seconds",
            "Go forward {minutes} minutes and {seconds} second",
            "Go forward {minutes} minute and {seconds} seconds",
            "Go forward {minutes} minute and {seconds} second",
            "Go forward {minutes} minutes",
            "Go forward {seconds} seconds",
            "Go forward {minutes} minute",
            "Go forward {seconds} second",
            "Go on {hours} hours",
            "Go on {hours} hour",
            "Go on {hours} hours {minutes} minutes and {seconds} seconds",
            "Go on {hours} hour {minutes} minutes and {seconds} seconds",
            "Go on {hours} hour {minutes} minute and {seconds} seconds",
            "Go on {hours} hours {minutes} minute and {seconds} seconds",
            "Go on {hours} hours {minutes} minutes and {seconds} second",
            "Go on {hours} hour {minutes} minutes and {seconds} second",
            "Go on {hours} hour {minutes} minute and {seconds} second",
            "Go on {hours} hours {minutes} minute and {seconds} second",
            "Go on {hours} hours {minutes} minutes",
            "Go on {hours} hours {minutes} minute",
            "Go on {hours} hour {minutes} minute",
            "Go on {hours} hour {minutes} minutes",
            "Go on {minutes} minutes and {seconds} seconds",
            "Go on {minutes} minutes and {seconds} second",
            "Go on {minutes} minute and {seconds} seconds",
            "Go on {minutes} minute and {seconds} second",
            "Go on {minutes} minutes",
            "Go on {seconds} seconds",
            "Go on {minutes} minute",
            "Go on {seconds} second"
          ]
        },
        {
          "name": "SkipBackwardIntent",
          "slots": [
            {
              "name": "minutes",
              "type": "AMAZON.NUMBER"
            },
            {
              "name": "seconds",
              "type": "AMAZON.NUMBER"
            },
            {
              "name": "hours",
              "type": "AMAZON.NUMBER"
            }
          ],
          "samples": [
            "Rewind {hours} hours",
            "Rewind {hours} hour",
            "Rewind {hours} hours {minutes} minutes and {seconds} seconds",
            "Rewind {hours} hours {minutes} minute and {seconds} seconds",
            "Rewind {hours} hour {minutes} minutes and {seconds} seconds",
            "Rewind {hours} hour {minutes} minute and {seconds} seconds",
            "Rewind {hours} hours {minutes} minutes and {seconds} second",
            "Rewind {hours} hours {minutes} minute and {seconds} second",
            "Rewind {hours} hour {minutes} minutes and {seconds} second",
            "Rewind {hours} hour {minutes} minute and {seconds} second",
            "Rewind {hours} hours {minutes} minutes",
            "Rewind {hours} hours {minutes} minute",
            "Rewind {hours} hour {minutes} minutes",
            "Rewind {hours} hour {minutes} minute",
            "Rewind {minutes} minutes and {seconds} seconds",
            "Rewind {minutes} minutes and {seconds} second",
            "Rewind {minutes} minute and {seconds} seconds",
            "Rewind {minutes} minute and {seconds} second",
            "Rewind {minutes} minutes",
            "Rewind {seconds} seconds",
            "Rewind {minutes} minute",
            "Rewind {seconds} second",
            "Skip back {hours} hours",
            "Skip back {hours} hour",
            "Skip back {hours} hours {minutes} minutes and {seconds} seconds",
            "Skip back {hours} hours {minutes} minute and {seconds} seconds",
            "Skip back {hours} hour {minutes} minutes and {seconds} seconds",
            "Skip back {hours} hour {minutes} minute and {seconds} seconds",
            "Skip back {hours} hours {minutes} minutes and {seconds} second",
            "Skip back {hours} hours {minutes} minute and {seconds} second",
            "Skip back {hours} hour {minutes} minutes and {seconds} second",
            "Skip back {hours} hour {minutes} minute and {seconds} second",
            "Skip back {hours} hours {minutes} minutes",
            "Skip back {hours} hours {minutes} minute",
            "Skip back {hours} hour {minutes} minutes",
            "Skip back {hours} hour {minutes} minute",
            "Skip back {minutes} minutes and {seconds} seconds",
            "Skip back {minutes} minutes and {seconds} second",
            "Skip back {minutes} minute and {seconds} seconds",
            "Skip back {minutes} minute and {seconds} second",
            "Skip back {minutes} minutes",
            "Skip back {seconds} seconds",
            "Skip back {minutes} minute",
            "Skip back {seconds} second",
            "Back {hours} hours",
            "Back {hours} hour",
            "Back {hours} hours {minutes} minutes and {seconds} seconds",
            "Back {hours} hours {minutes} minute and {seconds} seconds",
            "Back {hours} hour {minutes} minutes and {seconds} seconds",
            "Back {hours} hour {minutes} minute and {seconds} seconds",
            "Back {hours} hours {minutes} minutes and {seconds} second",
            "Back {hours} hours {minutes} minute and {seconds} second",
            "Back {hours} hour {minutes} minutes and {seconds} second",
            "Back {hours} hour {minutes} minute and {seconds} second",
            "Back {hours} hours {minutes} minutes",
            "Back {hours} hours {minutes} minute",
            "Back {hours} hour {minutes} minutes",
            "Back {hours} hour {minutes} minute",
            "Back {minutes} minutes and {seconds} seconds",
            "Back {minutes} minutes and {seconds} second",
            "Back {minutes} minute and {seconds} seconds",
            "Back {minutes} minute and {seconds} second",
            "Back {minutes} minutes",
            "Back {seconds} seconds",
            "Back {minutes} minute",
            "Back {seconds} second",
            "Jump back {hours} hours",
            "Jump back {hours} hour",
            "Jump back {hours} hours {minutes} minutes and {seconds} seconds",
            "Jump back {hours} hours {minutes} minute and {seconds} seconds",
            "Jump back {hours} hour {minutes} minutes and {seconds} seconds",
            "Jump back {hours} hour {minutes} minute and {seconds} seconds",
            "Jump back {hours} hours {minutes} minutes and {seconds} second",
            "Jump back {hours} hours {minutes} minute and {seconds} second",
            "Jump back {hours} hour {minutes} minutes and {seconds} second",
            "Jump back {hours} hour {minutes} minute and {seconds} second",
            "Jump back {hours} hours {minutes} minutes",
            "Jump back {hours} hours {minutes} minute",
            "Jump back {hours} hour {minutes} minutes",
            "Jump back {hours} hour {minutes} minute",
            "Jump back {minutes} minutes and {seconds} seconds",
            "Jump back {minutes} minutes and {seconds} second",
            "Jump back {minutes} minute and {seconds} seconds",
            "Jump back {minutes} minute and {seconds} second",
            "Jump back {minutes} minutes",
            "Jump back {seconds} seconds",
            "Jump back {minutes} minute",
            "Jump back {seconds} second",
            "Go back {hours} hours",
            "Go back {hours} hour",
            "Go back {hours} hours {minutes} minutes and {seconds} seconds",
            "Go back {hours} hours {minutes} minute and {seconds} seconds",
            "Go back {hours} hour {minutes} minutes and {seconds} seconds",
            "Go back {hours} hour {minutes} minute and {seconds} seconds",
            "Go back {hours} hours {minutes} minutes and {seconds} second",
            "Go back {hours} hours {minutes} minute and {seconds} second",
            "Go back {hours} hour {minutes} minutes and {seconds} second",
            "Go back {hours} hour {minutes} minute and {seconds} second",
            "Go back {hours} hours {minutes} minutes",
            "Go back {hours} hours {minutes} minute",
            "Go back {hours} hour {minutes} minutes",
            "Go back {hours} hour {minutes} minute",
            "Go back {minutes} minutes and {seconds} seconds",
            "Go back {minutes} minutes and {seconds} second",
            "Go back {minutes} minute and {seconds} seconds",
            "Go back {minutes} minute and {seconds} second",
            "Go back {minutes} minutes",
            "Go back {seconds} seconds",
            "Go back {minutes} minute",
            "Go back {seconds} second"
          ]
        },
        {
          "name": "AMAZON.YesIntent",
          "samples": []
        },
        {
          "name": "AMAZON.NoIntent",
          "samples": []
        },
        {
          "name": "AMAZON.NavigateHomeIntent",
          "samples": []
        },
        {
          "name": "LaunchRequest"
        }
      ],
      "types": []
    }
  }
};
