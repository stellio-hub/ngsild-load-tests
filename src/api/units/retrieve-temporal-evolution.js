import { check } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('retrieve_temporal_evolution_duration', true);

export function retrieveTemporalEvolution(entityId, afterISOTime, attrs) {
    var httpParams = {
        timeout: 36000000 //10min
    };
    var response = http.get(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/temporal/entities/${entityId}?timerel=after&time=${afterISOTime}&attrs=${attrs}&options=temporalValues`, httpParams);
    check(response, {
        'retrieve temporal evolution is successful': response => response.status === 200
    });
    if(response.status !== 200){
        console.log('ERROR : ' + response.body);
    }
    durationTrend.add(response.timings.duration);
}
