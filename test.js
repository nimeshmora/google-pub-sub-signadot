import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
    ],
};

export default function () {
    const response = http.get('http://location-perf-test-dep-location-c8e38337/location?locationID=1');
    check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    });
    sleep(1);
}