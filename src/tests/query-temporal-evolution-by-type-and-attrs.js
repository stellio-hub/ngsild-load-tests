import { SharedArray } from 'k6/data';
import { createEntity } from '../api/create-entity.js';
import { updateAttributes } from '../api/update-attributes.js'
import { queryTemporalEvolution } from '../api/query-temporal-evolution.js'
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
    vus: 10,
    iterations: 100000,
    thresholds: {
        http_req_failed: ['rate<0.01'],
        query_temporal_evolution: ['avg<200', 'p(95)<400']
    },
    setupTimeout: '5m'
};

const observedProperties = ['ammonium', 'waterTemperature', 'dissolvedOxygen'];

const entities = new SharedArray('template entity', function () {
    return JSON.parse(open('../data/template_entity.json')).entities;
});

const attributesFragment = new SharedArray('update attributes fragment', function () {
    return JSON.parse(open('../data/update_attributes_fragment.json')).attributes;
});

export function generateRandomAttributesFragment() {
    var now = new Date();
    const attributes = Object.assign({}, attributesFragment[0]);

    const updatedAmmonium1 = Object.assign({}, attributes.ammonium[0], {
        value: (Math.random() * 100),
        observedAt: now.toISOString()
    });
    const updatedAmmonium2 = Object.assign({}, attributes.ammonium[1], {
        value: (Math.random() * 100),
        observedAt: now.toISOString()
    });
    attributes.ammonium = [updatedAmmonium1, updatedAmmonium2];

    const updatedWaterTemperature1 = Object.assign({}, attributes.waterTemperature[0], {
        value: (Math.random() * 100),
        observedAt: now.toISOString()
    });
    const updatedWaterTemperature2 = Object.assign({}, attributes.waterTemperature[1], {
        value: (Math.random() * 100),
        observedAt: now.toISOString()
    });
    attributes.waterTemperature = [updatedWaterTemperature1, updatedWaterTemperature2];

    const dissolvedOxygen = Object.assign({}, attributes.dissolvedOxygen, {
        value: (Math.random() * 100),
        observedAt: now.toISOString()
    });
    attributes.dissolvedOxygen = dissolvedOxygen;

    return attributes;
}

export function setup() {
    let createdEntitiesIds = [];
    const initialNumberOfEntities = __ENV.INITIAL_NUMBER_OF_ENTITIES || 10
    const initialNumberOfInstances = __ENV.INITIAL_NUMBER_OF_INSTANCES || 100
    for (let i = 0; i < initialNumberOfEntities; i++) {
        const entity = Object.assign({}, entities[0]);
        entity.id = `urn:ngsi-ld:Entity:${uuidv4()}`;
        createEntity(entity);
        createdEntitiesIds.push(entity.id);
        for (let i = 0; i < initialNumberOfInstances; i++) {
            const attributes = generateRandomAttributesFragment();
            updateAttributes(entity.id, attributes);
        }
    }

    return { createdEntitiesIds: createdEntitiesIds };
}

export default function(data) {
    const entityId = randomItem(data.createdEntitiesIds);
    queryTemporalEvolution('Entity', randomItem(observedProperties));
}
