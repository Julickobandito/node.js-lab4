class Entity {
    constructor(attributes) {
        this.id = attributes.id ? parseInt(attributes.id) : 1;
        this.type = attributes.type;
        this.title = attributes.title ? attributes.title : '';
        this.content = attributes.content ? attributes.content : '';

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
    //attributes for handling data from forms
    getAttributes() {
        return [
            {name: "id", tag: "input", attributes: {type: "hidden", value: this.id}},
            {name: "title", tag: "input", attributes: {type: "text"}},
            {name: "content", tag: "textarea", attributes: {}},
        ]
    }

    //receiving attributes for entity
    getAttributesJSON() {
        let attributes = this.getAttributes();
        let attributes_names = '{';
        let sep = '';
        attributes.forEach((attribute) => {
            attributes_names += sep + attribute.name + ':' + (attribute.name === 'type' ? '"' + this.type + '"' : null);
            sep = ',';
        });
        return attributes_names + '}';
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
        this.dueDate = attributes.dueDate ? attributes.dueDate : null;
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
        this.eventDate = attributes.eventDate ? attributes.eventDate : null;
    }
    getAttributes() {
        let attributes = super.getAttributes();
        attributes.push({name: "eventDate", tag:"input", attributes: {type: "date"}});
        attributes.push({name: "type", tag:"input", attributes: {type: "hidden", value: "event"}});
        return attributes;
    }
}
export {Note, Task, Event};
