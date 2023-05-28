import express from 'express';
import saveEntities from './save-entities.js';
import bodyParser from 'body-parser';
import fs from 'fs';
import { 
    instantinateClass, 
    findEntityById, 
    incrementId, 
    filterByType, 
    capitalize } from './utils.js';
import swaggerDocs from './swagger.js'


import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const entitiesFile = 'entities.json';
const app = express();  //app is an instance of express object

app.set('view engine', 'ejs');  //set the view engine to EJS
//making "public" folder a static folder
app.use( express.static( "public" ));
//parse incoming request bodies
app.use(express.json());
app.use(bodyParser.json());
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

/**
 * @openapi
 * '/api/v1/entity':
 *  get:
 *     tags:
 *     - Entity
 *     summary: Get all entities
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           default: task
 *         required: true
 *         description: String Type of an entity for display
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Number of page to display
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *         required: false
 *         description: Limit of entities to display
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    type: integer
 *                    default: 0
 *                  type:
 *                    type: string
 *                    default: task
 *                  title:
 *                    type: string
 *                    default: Do it NOW!
 *                  content:
 *                    type: string
 *                    default: just a kind reminder :)
 *                  date:
 *                    type: string
 *                    default: May 08, 2023
 *                  time:
 *                    type: string
 *                    default: 12:49 AM
 *                  dueDate:
 *                    type: string
 *                    default: 2023-05-09
 *                  isCompleted:
 *                    type: boolean
 *                    default: false
 *       400:
 *         description: Bad request
 */
app.get('/api/v1/entity', paginatedResults(entities), (req, res) => {
    const type = req.query.type;
    res.json(res.paginatedResults)
})

//pagination
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

/**
 * @openapi
 * '/api/v1/entity/{id}':
 *  get:
 *     tags:
 *     - Entity
 *     summary: Return an object with specific id
 *     parameters:
 *      - name: type
 *        in: path
 *        description: The type of the entity
 *        required: true
 *        schema:
 *          type: string
 *          deafult: task/event/note
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: integer
 *                  default: 0
 *                type:
 *                  type: string
 *                  default: task
 *                title:
 *                  type: string
 *                  default: Do it NOW!
 *                content:
 *                  type: string
 *                  default: just a kind reminder :)
 *                date:
 *                  type: string
 *                  default: May 08, 2023
 *                time:
 *                  type: string
 *                  default: 12:49 AM
 *                dueDate:
 *                  type: string
 *                  default: 2023-05-09
 *                isCompleted:
 *                  type: boolean
 *                  default: false
 *       400:
 *         description: Bad request
 */
app.get('/api/v1/entity/:id', (req, res) => {
    const { id } = req.params;
    let [entity, index] = findEntityById(entities, id);
    let obj = instantinateClass(entity); // {type: entity.type}
    let attributes = obj.getAttributes();
    res.json({entity, attributes,  noteIndex: id});
});

/**
 * @openapi
 * '/api/v1/entity/new/{type}':
 *  get:
 *     tags:
 *     - Entity
 *     summary: Create new instance of an object
 *     parameters:
 *      - name: type
 *        in: path
 *        description: The type of the entity
 *        required: true
 *        schema:
 *          type: string
 *          deafult: task/event/note
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: integer
 *                  default: 0
 *                type:
 *                  type: string
 *                  default: task
 *                title:
 *                  type: string
 *                  default: Do it NOW!
 *                content:
 *                  type: string
 *                  default: just a kind reminder :)
 *                date:
 *                  type: string
 *                  default: May 08, 2023
 *                time:
 *                  type: string
 *                  default: 12:49 AM
 *                dueDate:
 *                  type: string
 *                  default: 2023-05-09
 *                isCompleted:
 *                  type: boolean
 *                  default: false
 *       400:
 *         description: Bad request
 */
app.get('/api/v1/entity/new/:type', (req, res) => {
    const type = req.params.type;
    const id = incrementId(entities);
    let entity = instantinateClass({type: type, id: id});
    let attributes = entity.getAttributes();
    let attributes_names = entity.getAttributesJSON();
    res.json({ type, entity, attributes, attributes_names });
});

/**
 * @openapi
 * '/api/v1/entity/{id}':
 *  post:
 *     tags:
 *     - Entity
 *     summary: Add an instance oа specific object with generated id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique id of the entity
 *        required: true
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - type
 *              - title
 *              - content
 *              - date
 *              - time
 *            properties:
 *              id:
 *                type: integer
 *                default: 2
 *              type:
 *                type: string
 *                default: task
 *              title:
 *                type: string
 *                default: Some Title
 *              content:
 *                type: string
 *                default: Some Description
 *              date:
 *                type: string
 *                default: May 08, 2023
 *              time:
 *                type: string
 *                default: 12:49 AM
 *     responses:
 *      201:
 *        description: Created
 *        content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 default: 0
 *               type:
 *                 type: string
 *                 default: task
 *               title:
 *                 type: string
 *                 default: Do it NOW!
 *               content:
 *                 type: string
 *                 default: just a kind reminder :)
 *               date:
 *                 type: string
 *                 default: May 08, 2023
 *               time:
 *                 type: string
 *                 default: 12:49 AM
 *               dueDate:
 *                 type: string
 *                 default: 2023-05-09
 *               isCompleted:
 *                 type: boolean
 *                 default: false
 *      400:
 *        description: Title and description are required
 */
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

/**
 * @openapi
 * '/api/v1/entity/{id}':
 *  put:
 *     tags:
 *     - Entity
 *     summary: Modify a specific object by id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique id of the entity
 *        required: true
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - id
 *              - type
 *              - title
 *              - content
 *              - date
 *              - time
 *            properties:
 *              id:
 *                type: integer
 *                default: 2
 *              type:
 *                type: string
 *                default: task
 *              title:
 *                type: string
 *                default: Some Title
 *              content:
 *                type: string
 *                default: Some Description
 *              date:
 *                type: string
 *                default: May 08, 2023
 *              time:
 *                type: string
 *                default: 12:49 AM
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 default: 0
 *               type:
 *                 type: string
 *                 default: task
 *               title:
 *                 type: string
 *                 default: Do it NOW!
 *               content:
 *                 type: string
 *                 default: just a kind reminder :)
 *               date:
 *                 type: string
 *                 default: May 08, 2023
 *               time:
 *                 type: string
 *                 default: 12:49 AM
 *               dueDate:
 *                 type: string
 *                 default: 2023-05-09
 *               isCompleted:
 *                 type: boolean
 *                 default: false
 *      400:
 *        description: Title and description are required
 *      404:
 *        description: Not found
 */
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
    if (attributes.type === 'event' && !attributes.eventDate || attributes.type === 'task' && !attributes.dueDate) {
        return res.status(400).json({ message: 'Date required' });
    }
    let entityId = parseInt(id);
    let [entity, index] = findEntityById(entities, entityId);
    attributes.type = entity.type;
    entities[index] = instantinateClass(attributes)
    saveEntities(entities); // save the notes to file
    res.status(200).json(entities[index]);
});

/**
 * @openapi
 * '/api/v1/entity/{id}':
 *  delete:
 *     tags:
 *     - Entity
 *     summary: Remove Entity by id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique id of the entity
 *        required: true
 *     responses:
 *      200:
 *        description: Note with ID {id} deleted
 *      404:
 *        description: Note with ID {id} not found
 */
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

const port = 3000

//start the server
app.listen(port, () => {
    console.log('Server running on port 3000');
    swaggerDocs(app, port)
});