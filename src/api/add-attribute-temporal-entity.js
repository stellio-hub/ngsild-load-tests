import { check } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('add_attribute_temporal_entity_duration', true);

export function addAttributeTemporalEntity(entityId, body) {
   
    const headers = {
        'Content-Type': 'application/json',
        'Link': '<https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.7.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
    };
    var response = http.post(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/temporal/entities/${entityId}/attrs`, JSON.stringify(body), { headers });
    durationTrend.add(response.timings.duration);
    
    check(response, {
        'add attribute temporal entity is successful': response => response.status === 204
    });
}