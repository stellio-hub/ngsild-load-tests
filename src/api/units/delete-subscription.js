import { check } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('delete_subscription_duration', true);

export function deleteSubscription(subscriptionId) {
   
    var httpParams = {
        timeout: 18000000, //5min
    };

    var response = http.del(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/subscriptions/${subscriptionId}`, httpParams);
    check(response, {
        'delete subscription is successful': response => response.status === 204
    });
    if(response.status !== 204){
        console.log('ERROR : ' + response.body);
    }
    durationTrend.add(response.timings.duration);
}