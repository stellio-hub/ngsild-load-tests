import { check } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('merge_entity_duration', true);

const httpParams = {
    headers: {
        'Content-Type': 'application/json',
        'Link': '<https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.9.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
    }
};

export function mergeEntity(entityId, body) {
    var response = http.patch(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/entities/${entityId}`, JSON.stringify(body), httpParams);
    durationTrend.add(response.timings.duration);

    check(response, {
        'merge entity is successful': response => response.status === 204
    });
}
