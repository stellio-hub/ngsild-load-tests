import { check } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { chunk } from '../utils/array.js';

let durationTrend = new Trend('update_attributes_duration', true);

const httpParams = {
    headers: {
        'Content-Type': 'application/json',
        'Link': '<https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.9.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
    }
};

// builds a request object usable directly with http.batch(), so callers can
// fire several update-attributes calls concurrently instead of one at a time
export function buildUpdateAttributesRequest(entityId, body) {
    return {
        method: 'PATCH',
        url: `http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/entities/${entityId}/attrs`,
        body: JSON.stringify(body),
        params: httpParams
    };
}

export function checkUpdateAttributesResponse(response) {
    durationTrend.add(response.timings.duration);

    check(response, {
        'update attributes is successful': response => response.status === 204
    });
}

export function updateAttributes(entityId, body) {
    const request = buildUpdateAttributesRequest(entityId, body);
    const response = http.patch(request.url, request.body, request.params);
    checkUpdateAttributesResponse(response);
}

// sends `requests` (built with buildUpdateAttributesRequest) `batchConcurrency`
// at a time via http.batch() instead of one request at a time
// used in the setup of temporal queries tests to feed the broker with a large history
export function sendUpdateAttributesRequestsInBatches(requests, batchConcurrency) {
    const concurrentRequestGroups = chunk(requests, batchConcurrency);

    for (const group of concurrentRequestGroups) {
        const responses = http.batch(group);
        responses.forEach(checkUpdateAttributesResponse);
    }
}