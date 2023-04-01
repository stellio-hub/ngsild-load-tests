import { check, fail } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('retrieve_temporal_evolution_duration', true);

export function retrieveTemporalEvolutionAfterTime(entityId, afterISOTime) {
    var queryParams = `timerel=after&time=${afterISOTime}&options=temporalValues`;
    retrieveTemporalEvolution(entityId, queryParams);
}

export function retrieveTemporalEvolutionLastN(entityId, lastN) {
    var queryParams = `timerel=after&time=1970-01-01T00:00:00Z&lastN=${lastN}&options=temporalValues`;
    retrieveTemporalEvolution(entityId, queryParams);
}

function retrieveTemporalEvolution(entityId, queryParams) {
    var httpParams = {
        timeout: 36000000 //10min
    };

    var response = http.get(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/temporal/entities/${entityId}?${queryParams}`, httpParams);
    durationTrend.add(response.timings.duration);
    if(!check(response, {'retrieve temporal evolution is successful': response => response.status === 200})) {
        fail('retrieve temporal evolution failed : ' + response.body);
    }
    
}
