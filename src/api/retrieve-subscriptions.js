import { check, fail } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('retrieve_subscriptions_duration', true);

export function retrieveSubscriptions(limit, page) {
    var httpParams = {
        timeout: 36000000 //10min
    };
    var response = http.get(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/subscriptions?limit=${limit}&page=${page}`, httpParams);
    durationTrend.add(response.timings.duration);
    
    if(!check(response, {'retrieve subscriptions is successful': response => response.status === 200})) {
        fail('retrieve subscriptions failed : ' + response.body);
    }
    
}
