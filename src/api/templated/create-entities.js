import { SharedArray } from 'k6/data';
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

const entities = new SharedArray('template entity', function () {
    return JSON.parse(open('./data/template_entity.json')).entities; 
});
    
export default function() {
    const entity = Object.assign({}, entities[0]);
    entity.id = `urn:ngsi-ld:Entity:${uuidv4()}`;
    createEntity(entity);
}
