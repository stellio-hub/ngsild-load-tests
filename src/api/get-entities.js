import { check, fail } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('retrieve_entities_duration', true);

export function getEntities(selector) {
    var httpParams = {
        timeout: 36000000 //10min
    };
    var response = http.get(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/entities?type=Entity`, httpParams);
    durationTrend.add(response.timings.duration);
    
    if(!check(response, {'retrieve entities is successful': response => response.status === 200 })) {
        fail('retrieve entities failed : ' + response.body);
    }
  
    return response.json(selector);
}
