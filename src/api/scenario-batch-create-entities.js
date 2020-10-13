import { batchCreateEntities } from './units/batch-create-entities.js';
import { batchDeleteEntities } from './units/batch-delete-entities.js';
import { getEntities } from './units/get-entities.js';


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
    batchCreateEntities(data);
}

export function teardown() {
    var entityIds = getEntities("#.id");
    batchDeleteEntities(entityIds);
}