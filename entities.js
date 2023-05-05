//class definitions for entities
import { incrementId } from "./utils.js";

class Entity {
    constructor(attributes) {
        this.id = attributes.id ? parseInt(attributes.id) : 1;
        this.type = attributes.type;
        this.title = attributes.title;
        this.content = attributes.content;

        this.date  = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
        this.time = new Date().toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit'
        });

    }
    getAttributes() {
        return [
            {name: "id", tag: "input", attributes: {type: "hidden", value: this.id}},
            {name: "title", tag: "input", attributes: {type: "text"}},
            {name: "content", tag: "textarea", attributes: {}},
            // {date: {tag:"input", attributes: [{type: "date"}]}}
        ]
    }
    getAttributesJSON() {
        // let obj = instantinateClass({type: entity.type});
        let attributes = this.getAttributes();
        let attributes_names = '{';
        let sep = '';
        attributes.forEach((attribute) => {
            attributes_names += sep + attribute.name + ':' + (attribute.name === 'type' ? '"' + this.type + '"' : null); // (typeof this.name == 'undefined' ? null : '"' + this.name + '"');
            sep = ',';
        });
        return attributes_names + '}';
    }
    updateDateTime() {
        this.date = new Date().toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
        this.time = new Date().toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
class Note extends Entity {
    constructor(attributes) {
        super(attributes);
        this.type = 'note';
    }
    getAttributes() {
        let attributes = super.getAttributes();
        attributes.push({name: "type", tag:"input", attributes: {type: "hidden", value: "note"}});
        return attributes;
    }
}
class Task extends Entity {
    constructor(attributes) {
        super(attributes);
        this.type = 'task';
        this.dueDate = attributes.dueDate;
        this.isCompleted = attributes.isCompleted;
    }
    getAttributes() {
        let attributes = super.getAttributes();
        attributes.push({name: "dueDate", tag:"input", attributes: {type: "date"}});
        attributes.push({name: "isCompleted", tag:"input", attributes: {type: "checkbox", checked: false, value:"0"}});
        attributes.push({name: "type", tag:"input", attributes: {type: "hidden", value: "task"}});
        return attributes;
    }
}
class Event extends Entity {
    constructor(attributes) {
        super(attributes);
        this.type = 'event';
        this.eventDate = attributes.eventDate;
    }
    getAttributes() {
        let attributes = super.getAttributes();
        attributes.push({name: "eventDate", tag:"input", attributes: {type: "date"}});
        attributes.push({name: "type", tag:"input", attributes: {type: "hidden", value: "event"}});
        return attributes;
    }
}
export {Note, Task, Event};
