import { check, fail } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { chunk } from '../utils/array.js';

let durationTrend = new Trend('batch_create_duration', true);

const httpParams = {
    timeout: 18000000, //5min
    headers: {
      'Content-Type': 'application/json',
      'Link': '<https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.7.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
    }
};

// builds a request object usable directly with http.batch(), so callers can
// fire several batch-create calls concurrently instead of one at a time
export function buildBatchCreateEntitiesRequest(body) {
    let payload = body || [{ id: "urn:ngsi-ld:Entity:01", type: "Entity" }];

    return {
        method: 'POST',
        url: `http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/entityOperations/create`,
        body: JSON.stringify(payload),
        params: httpParams
    };
}

export function checkBatchCreateEntitiesResponse(response) {
    durationTrend.add(response.timings.duration);

    if (!check(response, {'batch create is successful': response => response.status === 201 })) {
       fail('batch create failed : ' +  response.body);
    }
}

export function batchCreateEntities(body) {
    const request = buildBatchCreateEntitiesRequest(body);
    const response = http.post(request.url, request.body, request.params);
    checkBatchCreateEntitiesResponse(response);
}

export function createEntitiesInBatches(entitiesToCreate, batchSize, batchConcurrency) {
    const entityBatches = chunk(entitiesToCreate, batchSize);
    const concurrentRequestGroups = chunk(entityBatches, batchConcurrency);

    for (const group of concurrentRequestGroups) {
        const requests = group.map(buildBatchCreateEntitiesRequest);
        const responses = http.batch(requests);
        responses.forEach(checkBatchCreateEntitiesResponse);
    }
}

export default function() {
    batchCreateEntities();
}
