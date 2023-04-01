import { check, fail } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('retrieve_entity_duration', true);

export default function retrieveEntity(entityId) {
    const response = http.get(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/entities/${entityId}`);
    durationTrend.add(response.timings.duration);
    
    check(response, {
        'retrieve entity is successful': response => response.status === 200 
    });
}
