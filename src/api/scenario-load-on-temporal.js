import { createEntity } from './units/create-entity.js';
import { batchDelete } from './units/batch-delete.js';
import { updateAttributes } from './units/update-attributes.js';
import { retrieveTemporalEvolution } from './units/retrieve-temporal-evolution.js';
import { group } from 'k6';

var valuesCount = 30000;
var entityId = "urn:ngsi-ld:Entity:01";
var now = new Date();

export let options = {
    duration: '50m',
    iterations: 1,
    vus: 1,
    thresholds: {
      'update_attributes_duration': ['avg<100'],  // threshold on a the average request duration
      'retrieve_temporal_evolution_duration': ['avg<1500']  // threshold on a the average request duration
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

    //prepare data for sending temporal values
    let jsonArray = new Array();

    for(var i = 0; i < valuesCount; i++){
        timestamp.setSeconds(timestamp.getSeconds() + 1);
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
    group('load on temporal values', function () {
        group(`update temporal value for each second (${valuesCount} values)`, function () {
            for(var i = 0; i < data.length; i++) {
                updateAttributes(entityId, data[i]);
            }
        });
        group(`retrieve all temporal values (${valuesCount} values)`, function () {
            retrieveTemporalEvolution(entityId, now.toISOString(), 'variable');
        });  
    });
}

export function teardown(data) {
    var entityIds = [entityId];
    batchDelete(entityIds);
}