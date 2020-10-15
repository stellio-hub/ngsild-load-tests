import { createEntity } from './units/create-entity.js';
import { batchDelete } from './units/batch-delete.js';
import { updateAttributes } from './units/update-attributes.js';
import { retrieveTemporalEvolutionAfterTime } from './units/retrieve-temporal-evolution.js';
import { group } from 'k6';

var valuesCount = 30000;
var propertiesCount = 10;
var entityId = "urn:ngsi-ld:Entity:01";
var now = new Date();

export let options = {
    duration: '400m',
    iterations: 1,
    vus: 1,
    thresholds: {
      'update_attributes_duration': ['avg<100'],  // threshold on a the average request duration
      'retrieve_temporal_evolution_duration': ['avg<1500']  // threshold on a the average request duration
    }
};

export function setup() {
    var timestamp = now;
    //first create the entity holding the temporal properties
    let entityWithTemporalProps = { 
        id: `${entityId}`,
        type: 'Entity'
    }; 
    for(var i = 0; i < propertiesCount; i++){
        entityWithTemporalProps['var' + i] = 
            {
                type: 'Property',
                value: 0.0,
                observedAt: timestamp.toISOString()
            }
            
    }
    createEntity(entityWithTemporalProps);

    //prepare data for sending temporal values
    let jsonArray = new Array();

    for(var i = 0; i < valuesCount; i++){
        timestamp.setSeconds(timestamp.getSeconds() + 1);
        var varsFragment = {};
        for (var j = 0; j < propertiesCount; j++){
            varsFragment['var' + j] = {
                type: 'Property',
                value: Math.random(),
                observedAt: timestamp.toISOString()
            }
        }

        jsonArray.push(varsFragment);
    }

    return Object.assign([], jsonArray);
}

export default function(data) {
    group('load on temporal values', function () {
        group(`update ${propertiesCount} temporal properties for each second (${valuesCount} values)`, function () {
            for(var i = 0; i < data.length; i++) {
                updateAttributes(entityId, data[i]);
            }
        });
        group(`retrieve all ${propertiesCount} temporal properties (${valuesCount} values)`, function () {
            retrieveTemporalEvolutionAfterTime(entityId, now.toISOString(), 'variable');
        });  
    });
}

export function teardown() {
    var entityIds = [entityId];
    batchDelete(entityIds);
}