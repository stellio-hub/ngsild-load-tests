import { check, fail } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('update_attributes_duration', true);

export function updateAttributes(entityId, body) {
   
    var httpParams = {
        timeout: 18000000, //5min
        headers: {
          'Content-Type': 'application/json'  
        }
    };
    var response = http.patch(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/entities/${entityId}/attrs`, JSON.stringify(body), httpParams);
    durationTrend.add(response.timings.duration);
    
    if(!check(response, {'update on attributes is successful': response => response.status === 204})) {
        fail('update on attributes failed : ' + response.body);
    }
  
}