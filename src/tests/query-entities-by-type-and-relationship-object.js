import { SharedArray } from 'k6/data';
import { createEntity } from '../api/create-entity.js';
import { getEntities } from '../api/get-entities.js'
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
    vus: 10,
    duration: '15m',
    iterations: 100000,
    thresholds: {
        http_req_failed: ['rate<0.01'],
        get_entities_duration: ['avg<1000', 'p(95)<1500']
    },
    setupTimeout: '180m'
};

const observedProperties = ['ammonium', 'waterTemperature', 'dissolvedOxygen'];
const entities = new SharedArray('template entity', function () {
    return JSON.parse(open('../data/template_entity.json')).entities;
});
const types  = generateRandomTypes();
const relationships  = generateRandomRelationships();

export function generateRandomTypes() {
    let types = [];
    let n = 0;
    while (n < parseInt(__ENV.INITIAL_NUMBER_OF_TYPES)) {
        types.push(randomString(10));
        n++;
    }
    return types;
}

export function generateRandomRelationships() {
    let relationships = [];
    let n = 0;
    while (n < parseInt(__ENV.INITIAL_NUMBER_OF_RELATIONSHIPS)) {
        relationships.push(`urn:ngsi-ld:Relation:${uuidv4()}`);
        n++;
    }
    return relationships;
}

export function generateRandomEntity() {
    const entity = Object.assign({}, entities[0]);

    entity.id = `urn:ngsi-ld:Entity:${uuidv4()}`;
    entity.type = randomItem(types);

    const updatedAmmonium1 = Object.assign({}, entity.ammonium[0], {
      value: (Math.random() * 100)
    });
    const updatedAmmonium2 = Object.assign({}, entity.ammonium[1], {
          value: (Math.random() * 100)
    });
    entity.ammonium = [updatedAmmonium1, updatedAmmonium2];

    const updatedWaterTemperature1 = Object.assign({}, entity.waterTemperature[0], {
        value: (Math.random() * 100)
    });
    const updatedWaterTemperature2 = Object.assign({}, entity.waterTemperature[1], {
        value: (Math.random() * 100)
    });
    entity.waterTemperature = [updatedWaterTemperature1, updatedWaterTemperature2];

    const updatedDissolvedOxygen = Object.assign({}, entity.dissolvedOxygen, {
        value: (Math.random() * 100)
    });
    entity.dissolvedOxygen = updatedDissolvedOxygen;

    const updatedServesDataset = Object.assign({}, entity.servesDataset, {
        object: randomItem(relationships)
    });
    entity.servesDataset = updatedServesDataset;

    return entity;
}

export function setup() {
    const initialNumberOfEntities = __ENV.INITIAL_NUMBER_OF_ENTITIES || 10
    for (let i = 0; i < initialNumberOfEntities; i++) {
        createEntity(generateRandomEntity());
    }

    return { types: types, relationships: relationships };
}

export default function(data) {
    const qParameter  = `${randomItem(observedProperties)}>${randomIntBetween(0,100)};servesDataset==${randomItem(data.relationships)}`
    getEntities(
        randomItem(data.types),
        qParameter
    );
}
