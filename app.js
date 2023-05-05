import express from 'express';
import methodOverride from 'method-override';
import {Note, Task, Event} from './entities.js';  //importing the class note
import saveEntities from './save-entities.js';
import fs from 'fs';
import { instantinateClass, findEntityById, incrementId, capitalize } from './utils.js';

const entitiesFile = 'entities.json';
const app = express();  //app is an instance of express object

app.set('view engine', 'ejs');  //set the view engine to EJS
//method-override middleware for handling PUT and DELETE requests
app.use(methodOverride('_method'));
//making "public" folder a static folder
app.use( express.static( "public" ));
//a middleware for parsing the request body for the notes page route
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//array for storing all the entities
let entities = [];

app.get('/entities', (req, res) => {
    res.render('home');
})

app.get('/entities/new/:type', (req, res) => {
    const type = req.params.type;
    let obj = instantinateClass({type: type});
    let attributes = obj.getAttributes();
    let attributes_names = obj.getAttributesJSON();
    res.render('entity-create', { type, attributes, attributes_names});
});

app.get('/entities/list/:type', (req, res) => {
    const type = req.params.type;
    let filtered_entities = [];
    entities.forEach((entity) => {
        if (entity.type === type) {
            filtered_entities.push(entity);
        }
    })
    let typeName = capitalize(type);
    res.render('entities', {filtered_entities, type, typeName });
});

app.get('/entities/:id', (req, res) => {
    const { id } = req.params;
    let [entity, index] = findEntityById(entities, id);
    let obj = instantinateClass(entity); // {type: entity.type}
    let attributes = obj.getAttributes();
    let attributes_names = '{';
    let sep = '';
    attributes.forEach((attribute) => {
        attributes_names += sep + attribute.name + ':' + (typeof entity[attribute.name] == 'undefined' ? null : '"' + entity[attribute.name] + '"');
        sep = ',';
    });
    attributes_names += '}';
    res.render('entity-form', { entity, attributes, attributes_names, noteIndex: id });
});


app.get('/api/v1/entities', (req, res) => {
    // filter entities by type
    res.status(200).json(entities);
});

app.get('/api/v1/entities/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const entity = entities[id];
    if (!entity) {
        return res.status(404).json({ message: `Note with ID ${id} not found` });
    }
    res.json(entity); // send the note data as JSON response
});

//create a route to handle the form submission for creating a new note
app.post('/api/v1/entities', (req, res) => {
    const attributes = req.body;
    // Validate that title and description are present in request body
    if (!attributes.title || !attributes.content) {
        return res.status(400).json({ message: 'Title and description are required' });
    }
    const entity = instantinateClass(attributes);
    entity.id = incrementId(entities);
    entities.push(entity);
    saveEntities(entities); // save the notes to file
    res.status(201).json(entity);
});

//create a route to handle updating an existing note
app.put('/api/v1/entities/:id', (req, res) => {
    const { id } = req.params;
    const attributes = req.body;
    if (!id) {
        return res.status(404).json({ message: `Note with ID ${id} not found` });
    }
    // Validate that title and description are present in request body
    if (!attributes.title || !attributes.content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }
    let entityId = parseInt(id);
    let [entity, index] = findEntityById(entities, entityId);
    attributes.type = entity.type;
    entities[index] = instantinateClass(attributes)
    saveEntities(entities); // save the notes to file
    res.status(200).json(entities[index]);
});

//create a route to handle deleting a note
app.delete('/api/v1/entities/:id', (req, res) => {
    const { id } = req.params;
    if (!id || id === undefined) {
        return res.status(404).json({ message: `Note with ID ${id} not found` });
    }
    let [entity, index] = findEntityById(entities, id);
    entities.splice(index, 1);
    saveEntities(entities); // save the notes to file
    res.status(200).json({ message: `Note with ID ${id} deleted` });
});

//entities = readEntities(entitiesFile, entities);
fs.readFile(entitiesFile, 'utf8', (err, data) => {
    if (err) {
        if(err.errno === -4058 ) {
            console.error(err);
            fs.writeFile(entitiesFile, '[]', (err) => {
                if (err)
                    console.log(err);
                else {
                    console.log("Ok!\n");
                }
            });
        } else {
            console.log(err);
        }
    } else {
        entities = JSON.parse(data);
        console.log(`Loaded ${entities.length} notes from file`);
    }
});


//start the server
app.listen(3000, () => console.log('Server running on port 3000'));