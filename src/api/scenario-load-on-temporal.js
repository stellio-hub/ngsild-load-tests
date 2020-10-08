import {Date} from 'core-js';
import { createEntity } from './units/create-entity.js';
import { batchDelete } from './units/batch-delete.js';
import { updateAttributes } from './units/update-attributes.js';

var valuesCount = 1;
var entityId = "urn:ngsi-ld:Entity:01";

export let options = {
    thresholds: {
      'http_req_duration': ['avg<50']  // threshold on a the average request duration
    }
};


export function setup() {
    
    var timestamp = Date.now();
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

    
    //prepare data for sending temporal values
    let jsonArray = new Array();

    for(var i = 0; i < valuesCount; i++){
        timestamp.setSeconds(t.getSeconds() + 1);
        jsonArray.push({ 
            variable: {
                type: 'Property',
                value: Math.random(),
                observedAt: timestamp.toISOString()
            }
        });
    }

    return Object.assign([], jsonArray);
}

export default function(data) {
    for(var i = 0; i < data.length; i++) {
        updateAttributes(entityId, data[i]);
    }  
}

export function teardown(data) {
    var entityIds = [entityId];
    batchDelete(entityIds);
}