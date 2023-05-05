const updateNoteForm = document.getElementById('update-note-form');
const entityId = parseInt(document.getElementById('create-id').value);

updateNoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const type = _type;
    const data = _attributes;
    for(let attr in data) {
        if(updateNoteForm.elements[attr].type !== 'checkbox') {
            data[attr] = updateNoteForm.elements[attr].value;
        } else {
            data[attr] = updateNoteForm.elements[attr].checked;
        }
    };
    fetch(`/api/v1/entities/${entityId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            // handle response data
            console.log(data);
            // redirect to notes page
            window.location.href = '/entities/list/'+type;
        })
        .catch((error) => {
            console.log(error);
        });
});

const deleteNoteForm = document.getElementById('delete-note-form');
deleteNoteForm.addEventListener('submit', (event) => {
    const type = _type;
    event.preventDefault();
    fetch(`/api/v1/entities/${entityId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then((response) => response.json())
        .then((data) => {
            // handle response data
            console.log(data);
            // redirect to notes page
            window.location.href = '/entities/list/'+ type;
        })
        .catch((error) => {
            console.log(error);
        });
});
