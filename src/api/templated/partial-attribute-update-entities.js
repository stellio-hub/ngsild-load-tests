import { createEntity } from '../units/create-entity.js';
import { partialAttributeUpdate } from '../units/partial-attribute-update.js'
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
    vus: 10,
    iterations: 100000,
    thresholds: {
        http_req_failed: ['rate<0.01'],
        create_entity_duration: ['avg<500', 'p(95)<800'],
        partial_attribute_update_duration: ['avg<200', 'p(95)<400']
    }
};

export function setup() {
    let entities = [];
    const initialNumberOfEntities = __ENV.INITIAL_NUMBER_OF_ENTITIES || 10
    for (let i = 0; i < initialNumberOfEntities; i++) {
        var now = new Date();
        const entityId = `urn:ngsi-ld:Entity:${uuidv4()}`;
        const payload = {
            id: entityId,
            type: 'Entity',
            temporalProperty: {
                type: 'Property',
                value: 12.34,
                observedAt: now.toISOString()
            }
        };
        createEntity(payload);
        entities.push(entityId);
    }

    return { entities: entities };
}

export default function(data) {
    var now = new Date();
    const entityId = data.entities[randomIntBetween(0, data.entities.length - 1)];
    const payload = {
        value: (Math.random() * 100),
        observedAt: now.toISOString()
    };
    partialAttributeUpdate(entityId, 'temporalProperty', payload);
}
