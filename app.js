import express from 'express';
import methodOverride from 'method-override';
import saveEntities from './save-entities.js';
import fs from 'fs';
import { instantinateClass, findEntityById, incrementId, filterByType, capitalize } from './utils.js';
import { getEntityList, getEntityById} from "./api.js";

const entitiesFile = 'entities.json';
const app = express();  //app is an instance of express object

app.set('view engine', 'ejs');  //set the view engine to EJS
//making "public" folder a static folder
app.use( express.static( "public" ));
//parse incoming request bodies
app.use(express.json());

//array for storing all the entities
let entities = [];

app.get('/entities', (req, res) => {
    res.render('home');
})

app.get('/entities/list/:type', (req, res) => {
    const type = req.params.type;
    let filtered_entities = [];
    let typeName = capitalize(type);
    res.render('entities', { filtered_entities, type, typeName });
});

app.get('/api/v1/entity', paginatedResults(entities), (req, res) => {
    //req.entities = entities
    //getEntityList(req, res)
    const type = req.query.type;
    res.json(res.paginatedResults)
})

function paginatedResults(model) {
    // middleware function
    return (req, res, next) => {
        model = filterByType(entities, req.query.type)
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        // calculating the starting and ending index
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const results = {};
        if (endIndex < model.length) {
            results.next = {
                page: page + 1,
                limit: limit
            };
        }
        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            };
        }
        results.results = model.slice(startIndex, endIndex);
        res.paginatedResults = results;
        next();
    };
}

//a route for getting an existing entity
app.get('/api/v1/entity/:id', (req, res) => {
    getEntityById(entities, req, res)
});

//a route for creating a new entity
app.get('/api/v1/entity/new/:type', (req, res) => {
    const type = req.params.type;
    const id = incrementId(entities);
    let entity = instantinateClass({type: type, id: id});
    let attributes = entity.getAttributes();
    let attributes_names = entity.getAttributesJSON();
    res.json({ type, entity, attributes, attributes_names });
});

//a route for posting new entity
app.post('/api/v1/entity/:id', (req, res) => {
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

//a route for updating an existing entity
app.put('/api/v1/entity/:id', (req, res) => {
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

//loading objects from file
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