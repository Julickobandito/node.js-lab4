import {Note, Task, Event} from './entities.js';

//create a class instance from received object based on type of entity
const instantinateClass = function(attributes) {
    let obj = null;
    switch(attributes.type) {
        case 'note':
            obj = new Note(attributes);
            break;
        case 'task':
            obj = new Task(attributes);
            break;
        case 'event':
            obj = new Event(attributes);
    }
    return obj;
}

const capitalize = function(word) {
    const lower = word.toLowerCase();
    return word.charAt(0).toUpperCase() + lower.slice(1);
}


const findEntityById = function (entities, id) {
    let found = null;
    let foundIndex = null;
    let BreakException = {};
    try {
        entities.forEach((entity, index) => {
            if(entity.id === parseInt(id)) {
                found = entity;
                foundIndex = index;
                throw BreakException;
            }
        });
    } catch (e) {
        if (e !== BreakException) throw e;
    }
    return [found, foundIndex];
}

const incrementId = function(entities) {
    let maxId = 0;
    entities.forEach((entity) => {
        if(entity.id > maxId) {
            maxId = entity.id;
        }
    });
    return ++maxId;
}

const filterByType = function(entities, type) {
    let filtered_entities = []
    entities.forEach((entity) => {
        if (entity.type === type) {
            filtered_entities.push(entity)
        }
    })
   return filtered_entities
}

export { capitalize, instantinateClass, findEntityById, incrementId, filterByType };

