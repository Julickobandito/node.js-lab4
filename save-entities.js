import fs from 'fs';

const saveEntities = (entities) => {
    const notesJSON = JSON.stringify(entities);
    fs.writeFile('entities.json', notesJSON, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Entities saved to file');
        }
    });
};
const readEntities = function(entitiesFile, entities) {
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
    return entities;
}

export default saveEntities;