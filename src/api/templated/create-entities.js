import { createEntity } from '../units/create-entity.js';
import { batchDeleteEntities } from '../units/batch-delete-entities.js';
import { getEntities } from '../units/get-entities.js';

export let options = {
    teardownTimeout: '5m',
    thresholds: {
      'create_entity_duration': ['avg<100']  // threshold on the average request duration
    }
};

var entitiesCount = __ENV.A;
var temporalPropertiesCount = __ENV.B;
export default function() {
    var now = new Date();
    var temporalPropValue = {
        type: 'Property',
        value: 0.0,
        observedAt: now.toISOString()
    };
    for(var i = 0; i < entitiesCount; i++) {
        var entity = { id: `urn:ngsi-ld:Entity:${i}`, type: 'Entity' };
        for(var j = 0; j < temporalPropertiesCount; j++){
            entity['var' + j] = temporalPropValue;      
        }
        createEntity(entity);
    }
}

export function teardown() {
    var entityIds = getEntities('#.id');
    batchDeleteEntities(entityIds);
}