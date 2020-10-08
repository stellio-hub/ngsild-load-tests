import { createEntity } from './units/create-entity.js';
import { batchDelete } from './units/batch-delete.js';

var entitiesCount = 100;

export let options = {
    thresholds: {
      'create_entity_duration': ['avg<100']  // threshold on the average request duration
    }
};

export function setup() {
    var jsonArray = new Array();
    for(var i = 1; i <= entitiesCount; i++){
        jsonArray.push({ id: `urn:ngsi-ld:Entity:${i}`, type: "Entity" });
    }

    return Object.assign([], jsonArray);
}

export default function(data) {
    for(var i = 0; i < data.length; i++) {
        createEntity(data[i]);
    }  
}

export function teardown(data) {
    var entityIds = new Array();
    for(var i = 0; i < data.length; i++) {
        entityIds.push(data[i].id);
    }

    batchDelete(entityIds);
}