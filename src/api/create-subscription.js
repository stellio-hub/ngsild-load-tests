import { check, fail } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('create_subscription_duration', true);

export function createSubscription(body) {
   
    var httpParams = {
        timeout: 18000000, //5min
        headers: {
          'Content-Type': 'application/json'  
        }
    };

    var response = http.post(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/subscriptions`, JSON.stringify(body), httpParams);
    durationTrend.add(response.timings.duration);

    if (!check(response, {'create subscription is successful': response => response.status === 201})) {
        fail('creation of subscription failed : ' + response.body);
    }
}
