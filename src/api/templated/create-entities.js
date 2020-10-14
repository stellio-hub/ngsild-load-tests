import { createEntity } from '../units/create-entity.js';
import { batchDeleteEntities } from '../units/batch-delete-entities.js';
import { getEntities } from '../units/get-entities.js';

export let options = {
    thresholds: {
      'create_entity_duration': ['avg<100']  // threshold on the average request duration
    }
};

var entitiesCount = __ENV.A;
export default function() {
    for(var i = 0; i < entitiesCount; i++) {
        var entity = { id: `urn:ngsi-ld:Entity:${i}`, type: "Entity" };
        createEntity(entity);
    }
}

export function teardown() {
    var entityIds = getEntities("#.id");
    batchDeleteEntities(entityIds);
}