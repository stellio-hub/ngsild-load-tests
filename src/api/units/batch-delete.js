import { check } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('batch_delete_duration', true);

export function batchDelete(body) {
   
    var httpParams = {
        headers: {
          'Content-Type': 'application/json'  
        }
    };
    var response = http.post(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/entityOperations/delete`, JSON.stringify(body), httpParams);
    check(response, {
        'batch delete is successful': response => response.status === 200
    });
    durationTrend.add(response.timings.duration);
}