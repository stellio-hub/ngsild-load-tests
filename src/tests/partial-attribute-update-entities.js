import { SharedArray } from 'k6/data';
import { partialAttributeUpdate } from '../api/partial-attribute-update.js'
import { createEntitiesInBatches } from '../api/batch-create-entities.js';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
    vus: 10,
    iterations: 100000,
    thresholds: {
        http_req_failed: ['rate<0.01'],
        partial_attribute_update_duration: ['avg<200', 'p(95)<400']
    },
    setupTimeout: '180m'
};

const entities = new SharedArray('template entity', function () {
    return JSON.parse(open('../data/template_entity.json')).entities; 
});

export function setup() {
    const initialNumberOfEntities = parseInt(__ENV.INITIAL_NUMBER_OF_ENTITIES) || 10;
    const setupBatchSize = parseInt(__ENV.SETUP_BATCH_SIZE) || 100;
    const setupBatchConcurrency = parseInt(__ENV.SETUP_BATCH_CONCURRENCY) || 10;

    let createdEntitiesIds = [];
    let entitiesToCreate = [];
    for (let i = 0; i < initialNumberOfEntities; i++) {
        const entity = Object.assign({}, entities[0]);
        entity.id = `urn:ngsi-ld:Entity:${uuidv4()}`;
        entitiesToCreate.push(entity);
        createdEntitiesIds.push(entity.id);
    }
    createEntitiesInBatches(entitiesToCreate, setupBatchSize, setupBatchConcurrency);

    return { createdEntitiesIds: createdEntitiesIds };
}

export default function(data) {
    var now = new Date();
    const entityId = data.createdEntitiesIds[randomIntBetween(0, data.createdEntitiesIds.length - 1)];
    const payload = {
        value: (Math.random() * 100),
        observedAt: now.toISOString()
    };
    partialAttributeUpdate(entityId, 'dissolvedOxygen', payload);
}
