import { check } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('retrieve_temporal_evolution_duration', true);

export function retrieveTemporalEvolution(entityId, afterISOTime, attrs) {
    var response = http.get(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/temporal/entities/${entityId}?timerel=after&time=${afterISOTime}&attrs=${attrs}&options=temporalValues`);
    check(response, {
        'retrieve temporal evolution is successful': response => response.status === 200
    });
    durationTrend.add(response.timings.duration);
}
