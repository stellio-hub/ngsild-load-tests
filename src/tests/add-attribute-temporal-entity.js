import { SharedArray } from 'k6/data';
import { addAttributeTemporalEntity } from '../api/add-attribute-temporal-entity.js'
import { createEntitiesInBatches } from '../api/batch-create-entities.js';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
    vus: 10,
    iterations: 100000,
    thresholds: {
        http_req_failed: ['rate<0.01'],
        add_attribute_temporal_entity_duration: ['avg<250', 'p(95)<400']
    },
    setupTimeout: '180m'
};

const entities = new SharedArray('template entity', function () {
    return JSON.parse(open('../data/template_entity.json')).entities;
});

const attributesFragment = new SharedArray('update attributes fragment', function () {
    return JSON.parse(open('../data/update_attributes_fragment.json')).attributes;
});

export function generateRandomAttributesFragment() {
    var now = new Date();
    const attributes = {};

    const dissolvedOxygen = Object.assign({}, {
        type: 'Property',
        value: (Math.random() * 100),
        observedAt: now.toISOString(),
        unitCode: 'M1'
    });
    attributes.dissolvedOxygen = dissolvedOxygen;

    return attributes;
}

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
    const entityId = randomItem(data.createdEntitiesIds);
    const attributes = generateRandomAttributesFragment();
    addAttributeTemporalEntity(entityId, attributes);
}
