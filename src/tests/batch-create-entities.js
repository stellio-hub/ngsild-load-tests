import { batchCreateEntities } from '../units/batch-create-entities.js';
import { batchDeleteEntities } from '../units/batch-delete-entities.js';
import { getEntities } from '../units/get-entities.js';


export let options = {
    teardownTimeout: '20m',
    thresholds: {
      'batch_create_duration': ['avg<10000']  // threshold on a the average request duration
    }
};

var entitiesCount = __ENV.A;
var temporalPropertiesCount = __ENV.B;

export function setup() {
    var now = new Date();
    var temporalPropValue = {
        type: 'Property',
        value: 0.0,
        observedAt: now.toISOString()
    };
    var entitiesArray = new Array();
    for(var i = 0; i < entitiesCount; i++){
        var entity = {
             id: `urn:ngsi-ld:Entity:${i}`,
             type: 'Entity',
             '@context': ["http://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"]
        };

        for(var j = 0; j < temporalPropertiesCount; j++){
            entity['var' + j] = temporalPropValue;      
        }
        entitiesArray.push(entity);
    }

    return Object.assign([], entitiesArray);
}

export default function(data) {
    batchCreateEntities(data);
}

export function teardown() {
    var entityIds = getEntities("#.id");
    batchDeleteEntities(entityIds);
}