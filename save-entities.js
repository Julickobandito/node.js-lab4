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

export default saveEntities;