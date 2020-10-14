import { check } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('retrieve_temporal_evolution_duration', true);

export function retrieveTemporalEvolutionAfterTime(entityId, afterISOTime, attrs) {
    var queryParams = `timerel=after&time=${afterISOTime}&attrs=${attrs}&options=temporalValues`;
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
    check(response, {
        'retrieve temporal evolution is successful': response => response.status === 200
    });
    if(response.status !== 200){
        console.log('ERROR : ' + response.body);
    }
    durationTrend.add(response.timings.duration);
}
