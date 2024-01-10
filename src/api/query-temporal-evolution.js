import { check, fail } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';

let durationTrend = new Trend('query_temporal_evolution_duration', true);

export function queryTemporalEvolution(type, attrs) {
    const headers = {
        'Content-Type': 'application/json',
        'Link': '<https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.7.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
    };
    const url = new URL(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/temporal/entities`);
    url.searchParams.append('type', type);
    url.searchParams.append('attrs', attrs);
    url.searchParams.append('timerel', 'after');
    url.searchParams.append('timeAt', '2023-01-01T00:00:00Z');

    var response = http.get(url.toString(), { headers });
    durationTrend.add(response.timings.duration);

    check(response, {
        'query temporal evolution is successful': (r) => r.status === 200
    });
}
