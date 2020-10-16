import { createEntity } from './units/create-entity.js';
import { batchDeleteEntities } from './units/batch-delete-entities.js';
import { getEntities } from './units/get-entities.js';

export let options = {
    stages: [
        { duration: '1s', target: 1 },
        { duration: '2s', target: 1 },
        { duration: '2s', target: 5 },
        { duration: '2s', target: 1 },
        { duration: '1s', target: 0 }
    ],
    teardownTimeout : '50m',
    thresholds: {
      'create_entity_duration': ['avg<100']  // threshold on the average request duration
    }
};

export default function() {
    var entity = { id: `urn:ngsi-ld:Entity:${__VU}_${__ITER}`, type: "Entity" };
    createEntity(entity);
}

export function teardown() {
    var entityIds = getEntities("#.id");
    batchDeleteEntities(entityIds);
}