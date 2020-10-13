import { createEntity } from './units/create-entity.js';
import { batchDeleteEntities } from './units/batch-delete-entities.js';
import { createSubscription } from './units/create-subscription.js';
import { retrieveSubscriptions } from './units/retrieve-subscriptions.js';
import { updateAttributes } from './units/update-attributes.js';
import { group } from 'k6';

var subscriptionsCount = 1;
var entityId = "urn:ngsi-ld:Entity:01";
var subscriptionThreshold = 1;
var now = new Date();

export let options = {
    duration: '400m',
    iterations: 1,
    vus: 1,
    thresholds: {
      'create_subscription_duration': ['avg<100'],  // threshold on a the average request duration
      'retrieve_subscriptions_duration': ['avg<1500']  // threshold on a the average request duration
    }
};

export function setup() {
    var timestamp = now;
    //first create the entity holding the temporal property
    let entityWithTemporalProp = { 
        id: entityId,
        type: 'Entity',
        variable: {
            type: 'Property',
            value: 0.0,
            observedAt: timestamp.toISOString()
        }    
    }; 
    createEntity(entityWithTemporalProp);

    //prepare data for subscriptions
    let jsonArray = new Array();

    for(var i = 1; i <= subscriptionsCount; i++){
        let subscription = {
            id: `urn:ngsi-ld:Subscription:${i}`,
            type:"Subscription",
            entities: [
              {
                type: "Entity"
              }
            ],
            q: `variable>${subscriptionThreshold}`,
            notification: {
              attributes: ["variable"],
              format: "normalized",
              endpoint: {
                uri: "http://my-domain-name",
                accept: "application/json",
                info: [
                    {
                      key: "Authorization-token",
                      value: "Authorization-token-value"
                    }
                ]
              }
            }
        };

        jsonArray.push(subscription);
    }

    return Object.assign([], jsonArray);
}

export default function(data) {
    var timestamp = now;
    group('load on subscriptions', function () {
        group(`create ${data.length} subscriptions`, function () {
            for(var i = 0; i < data.length; i++) {
                createSubscription(data[i]);
            }
        });
        group(`retrieve all ${data.length} subscriptions`, function () {
            retrieveSubscriptions(data.length, 1);
        });

        group(`update temporal property for triggering notifications`, function () {
            let variableFragment = { 
                variable: {
                    type: 'Property',
                    value: `${subscriptionThreshold + 1}`,
                    observedAt: timestamp.toISOString()
                }
            };
            updateAttributes(entityId, variableFragment);
        });  
    });
}

export function teardown() {
    var entityIds = [entityId];
    batchDeleteEntities(entityIds);
}