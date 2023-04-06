import { check, fail } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';

let durationTrend = new Trend('get_entities_duration', true);

export function getEntities(types, qParams) {
    const headers = {
        'Content-Type': 'application/json',
        'Link': '<https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.3.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
    };
    const url = new URL(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/entities`);
    url.searchParams.append('type', types);
    url.searchParams.append('q', qParams);
    var response = http.get(url.toString(), { headers });
    durationTrend.add(response.timings.duration);

    check(response, {
        'get entities is successful': (r) => r.status === 200
    });
}
