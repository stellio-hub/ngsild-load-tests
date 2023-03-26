import { createEntity } from '../units/create-entity.js';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
    vus: 10,
    iterations: 100000,
    thresholds: {
        http_req_failed: ['rate<0.01'],
        create_entity_duration: ['avg<500', 'p(95)<800']
    }
};

export default function() {
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
}
