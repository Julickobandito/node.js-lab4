const createNoteForm = document.getElementById('create-note-form');
let btnPostNote = document.getElementById("btn-post-note");
btnPostNote.addEventListener('click', function () {
    let title = document.getElementById("create-title").value.trim();
    let content = document.getElementById("create-content").value.trim();
    let type = _type;
    if (!title || !content) {
        alert("Fill in the fields");
        return;
    }
    if (type === 'task') {
        let dueDate = document.getElementById("create-dueDate").value;
        if (!title || !content || !dueDate) {
            alert("Fill in the fields");
            return;
        }
    }
    if (type === 'event') {
        let eventDate = document.getElementById("create-eventDate").value;
        if (!title || !content || !eventDate) {
            alert("Fill in the fields");
            return;
        }
    }


    const data = _attributes;
    for(let attr in data) {
        //data[attr] = createNoteForm.elements[attr].value;
        if(createNoteForm.elements[attr].type !== 'checkbox') {
            data[attr] = createNoteForm.elements[attr].value;
        } else {
            data[attr] = createNoteForm.elements[attr].checked;
        }
    }

    fetch('/api/v1/entities', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if(response.status === 201) {
                window.location.href = '/entities/list/'+type;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});