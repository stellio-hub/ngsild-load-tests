import { batchCreate } from './units/batch-create.js';
import { batchDelete } from './units/batch-delete.js';


var entitiesCount = 100;

export let options = {
    thresholds: {
      'batch_create_duration': ['avg<10000']  // threshold on a the average request duration
    }
};

export function setup() {
    var jsonArray = new Array();
    for(var i = 1; i <= entitiesCount; i++){
        jsonArray.push({ id: `urn:ngsi-ld:Entity:${i}`, type: "Entity" , '@context': ["http://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"]});
    }

    return Object.assign([], jsonArray);
}

export default function(data) {
    batchCreate(data);
}

export function teardown(data) {
    var entityIds = new Array();
    for(var i = 0; i < data.length; i++) {
        entityIds.push(data[i].id);
    }

    batchDelete(entityIds);
}