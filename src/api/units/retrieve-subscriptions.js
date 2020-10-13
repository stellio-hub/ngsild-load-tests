import { check } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('retrieve_subscriptions_duration', true);

export function retrieveSubscriptions(limit, page) {
    var httpParams = {
        timeout: 36000000 //10min
    };
    var response = http.get(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/subscriptions?limit=${limit}&page=${page}`, httpParams);
    check(response, {
        'retrieve subscriptions is successful': response => response.status === 200
    });
    if(response.status !== 200){
        console.log('ERROR : ' + response.body);
    }
    durationTrend.add(response.timings.duration);
}
