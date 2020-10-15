import { batchCreateEntities } from '../units/batch-create-entities.js';
import { batchDeleteEntities } from '../units/batch-delete-entities.js';
import { getEntities } from '../units/get-entities.js';
import { createSubscription } from '../units/create-subscription.js';
import { deleteSubscription } from '../units/delete-subscription.js';
import { retrieveSubscriptions } from '../units/retrieve-subscriptions.js';
import { updateAttributes } from '../units/update-attributes.js';
import { retrieveTemporalEvolutionLastN } from '../units/retrieve-temporal-evolution.js';

import { group, sleep } from 'k6';

export let options = {
    thresholds: {
        'create_subscription_duration': ['avg<100'],  // threshold on the average request duration
        'retrieve_subscriptions_duration': ['avg<1500']  // threshold on the average request duration
    },
    scenarios: {
        minimal: {
            executor: 'shared-iterations',
            maxDuration: '400m',   
            env:{
                A:'1',
                B:'1',
                C:'1',
                D:'1',
                E:'1'
            }
        },
        ten: {
            executor: 'shared-iterations',
            maxDuration: '400m',   
            env:{
                A:'10',
                B:'10',
                C:'10',
                D:'10',
                E:'10'
            }
        },
        hundred: {
            executor: 'shared-iterations',
            maxDuration: '400m',   
            env:{
                A:'100',
                B:'100',
                C:'100',
                D:'100',
                E:'100'
            }
        },
        thousand: {
            executor: 'shared-iterations',
            maxDuration: '400m',   
            env:{
                A:'1000',
                B:'1000',
                C:'1000',
                D:'1000',
                E:'1000'
            }
        }

    }
};

var subscriptionsCount = __ENV.A;
var entitiesCount = __ENV.B;
var temporalPropertiesCount = __ENV.C;
var valuesCount = __ENV.D;
var retrievedTemporalValuesCount = __ENV.E;

var entityPrefix = "urn:ngsi-ld:Entity:";
var subscriptionPrefix = "urn:ngsi-ld:Subscription:";
var subscriptionThreshold = 1;
var now = new Date();



export function setup() {
    //CREATE ENTITIES
    var timestamp = now;
    var entities = new Array();

    var temporalPropValue = {
        type: 'Property',
        value: 0.0,
        observedAt: timestamp.toISOString()
    }; 

    for(var i = 0; i < entitiesCount; i++){
        let entityWithTemporalProps = { 
            id: `${entityPrefix}${i}`,
            type: 'Entity',
            '@context': ['http://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld']
        }; 
        for(var j = 0; j < temporalPropertiesCount; j++){
            entityWithTemporalProps['var' + j] = temporalPropValue;      
        }
        entities.push(entityWithTemporalProps);    
    }

    batchCreateEntities(Object.assign([], entities));

    //PREPARE DATA FOR SUBSCRIPTIONS
    
    let subscriptionQuery = '';
    let attributesArray = new Array();
    for(var i = 0; i < temporalPropertiesCount; i++){
        subscriptionQuery += 'var' + i + '>' + subscriptionThreshold;
        if(i != temporalPropertiesCount - 1){
            subscriptionQuery += ';';
        }
        attributesArray.push('var' + i);
    }

    let subscriptionsArray = new Array();
    for(var i = 0; i < subscriptionsCount; i++){
        let subscription = {
            id: `${subscriptionPrefix}${i}`,
            type:'Subscription',
            entities: [
              {
                type: 'Entity'
              }
            ],
            q: subscriptionQuery,
            notification: {
              attributes: attributesArray,
              format: 'normalized',
              endpoint: {
                uri: 'http://my-domain-name',
                accept: 'application/json',
                info: [
                    {
                      key: 'Authorization-token',
                      value: 'Authorization-token-value'
                    }
                ]
              }
            }
        };

        subscriptionsArray.push(subscription);
    }

    return Object.assign([], subscriptionsArray);
}

export default function(data) {
    sleep(350);
    group('load on subscriptions', function () {
        group(`create ${data.length} subscriptions`, function () {
            for(var i = 0; i < data.length; i++) {
                createSubscription(data[i]);
            }
        });

        group(`update temporal property for triggering notifications`, function () {
            var timestamp = now;
            for(var i = 0; i < valuesCount; i++){
                timestamp.setSeconds(timestamp.getSeconds() + 1);
                var varsFragment = {};
                for (var j = 0; j < temporalPropertiesCount; j++) {
                    varsFragment['var' + j] = {
                        type: 'Property',
                        value: `${subscriptionThreshold + 1}`,
                        observedAt: timestamp.toISOString()
                    }
                }
        
                updateAttributes(`${entityPrefix}${i}`, varsFragment);
            }    
        });
        
        group(`retrieve all subscriptions`, function () {
            retrieveSubscriptions(data.length, 1);
        });

        group(`retrieve all subscriptions`, function () {
            retrieveTemporalEvolutionLastN(`${entityPrefix}0`, retrievedTemporalValuesCount);
        });
    });
}

export function teardown(data) {
    var entityIds = getEntities("#.id");
    batchDeleteEntities(entityIds);

    for(var i=0; i < data.length; i++) {
        deleteSubscription(`${subscriptionPrefix}${i}`);
    }
}