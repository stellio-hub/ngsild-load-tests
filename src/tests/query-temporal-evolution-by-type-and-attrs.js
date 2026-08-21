import { SharedArray } from 'k6/data';
import { buildUpdateAttributesRequest, sendUpdateAttributesRequestsInBatches } from '../api/update-attributes.js'
import { createEntitiesInBatches } from '../api/batch-create-entities.js';
import { queryTemporalEvolution } from '../api/query-temporal-evolution.js'
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
    vus: 10,
    iterations: 100000,
    thresholds: {
        http_req_failed: ['rate<0.01'],
        query_temporal_evolution_duration: ['avg<1000', 'p(95)<1500']
    },
    setupTimeout: '360m'
};

const aggrMethods = ['totalCount', 'distinctCount', 'sum', 'avg', 'min', 'max', 'stddev', 'sumsq']
const observedProperties = ['ammonium', 'waterTemperature', 'dissolvedOxygen'];

const entities = new SharedArray('template entity', function () {
    return JSON.parse(open('../data/template_entity.json')).entities;
});

const attributesFragment = new SharedArray('update attributes fragment', function () {
    return JSON.parse(open('../data/update_attributes_fragment.json')).attributes;
});

export function generateRandomAttributesFragment() {
    var now = new Date();
    var date = now.toISOString();
    var value = Math.random() * 100;
    const attributes = Object.assign({}, attributesFragment[0]);

    const updatedAmmonium1 = Object.assign({}, attributes.ammonium[0], {
        value: value,
        observedAt: date
    });
    const updatedAmmonium2 = Object.assign({}, attributes.ammonium[1], {
        value: value,
        observedAt: date
    });
    attributes.ammonium = [updatedAmmonium1, updatedAmmonium2];

    const updatedWaterTemperature1 = Object.assign({}, attributes.waterTemperature[0], {
        value: value,
        observedAt: date
    });
    const updatedWaterTemperature2 = Object.assign({}, attributes.waterTemperature[1], {
        value: value,
        observedAt: date
    });
    attributes.waterTemperature = [updatedWaterTemperature1, updatedWaterTemperature2];

    const dissolvedOxygen = Object.assign({}, attributes.dissolvedOxygen, {
        value: value,
        observedAt: date
    });
    attributes.dissolvedOxygen = dissolvedOxygen;

    return attributes;
}

export function setup() {
    const initialNumberOfEntities = parseInt(__ENV.INITIAL_NUMBER_OF_ENTITIES) || 10;
    const initialNumberOfInstances = parseInt(__ENV.INITIAL_NUMBER_OF_INSTANCES) || 100;
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

    let updateRequests = [];
    for (const entityId of createdEntitiesIds) {
        for (let i = 0; i < initialNumberOfInstances; i++) {
            const attributes = generateRandomAttributesFragment();
            updateRequests.push(buildUpdateAttributesRequest(entityId, attributes));
        }
    }
    sendUpdateAttributesRequestsInBatches(updateRequests, setupBatchConcurrency);

    return { createdEntitiesIds: createdEntitiesIds };
}

export default function(data) {
    const temporalRepresentation = __ENV.TEMPORAL_REPRESENTATION || 'normalized'
    if (temporalRepresentation === 'aggregated') {
        const aggrMethod  = `${randomItem(aggrMethods)}`;
        queryTemporalEvolution('Entity', randomItem(observedProperties), temporalRepresentation, aggrMethod);
    }
    else
        queryTemporalEvolution('Entity', randomItem(observedProperties), temporalRepresentation, null);
}
