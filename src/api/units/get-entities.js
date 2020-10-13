import { check } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('retrieve_entities_duration', true);

export function getEntities(selector) {
    var httpParams = {
        timeout: 36000000 //10min
    };
    var response = http.get(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/entities?type=Entity`, httpParams);
    check(response, {
        'retrieve entities is successful': response => response.status === 200
    });
    if(response.status !== 200){
        console.log('ERROR : ' + response.body);
    }
    durationTrend.add(response.timings.duration);
    return response.json(selector);
}
