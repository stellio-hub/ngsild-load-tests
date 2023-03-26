import { check } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('partial_attribute_update_duration', true);

export function partialAttributeUpdate(entityId, attrId, body) {
   
    const headers = {
        'Content-Type': 'application/json',
        'Link': '<https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.3.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
    };
    var response = http.patch(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/entities/${entityId}/attrs/${attrId}`, JSON.stringify(body), { headers });
    durationTrend.add(response.timings.duration);
    
    check(response, {
        'partial attribute update is successful': response => response.status === 204
    });
}