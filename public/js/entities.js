(function(){
    let type = null
    let limit = 3

    const getElemById = function(id) {
        return document.getElementById(id)
    }

    //render entities with js and adding them to "entities-list"
    const renderEntitiesList = function(data) {
        cleanEntityList()

        let divList = getElemById("entities-list")

        data.results.forEach(entity => {
            divList.appendChild(renderEntityCard(entity))
        });

        refreshPaginator(data.previous, data.next)

        getElemById('apply').addEventListener('click', applyEntityDataHandler)
        getElemById('reset').addEventListener('click', resetEntityDataHandler)
        getElemById('delete').addEventListener('click', deleteEntityDataHandler)
    }

    const refreshPaginator = function(prev, next) {
        let paginator = document.getElementById('paginator')

        const a_prev= getElemById("prev_but")
        const a_next = getElemById("next_but")

        if(prev) {
            a_prev.style.display = "block"
            a_prev.addEventListener('click', gotoPrevHandler, false)
            a_prev.page_prev = prev.page
        } else {
            a_prev.style.display = 'none'
        }
        if(next) {
            a_next.style.display = "block"
            a_next.addEventListener('click', gotoNextHandler, false)
            a_next.page_next = next.page
        } else {
            a_next.style.display = 'none'
        }
    }

    const gotoPrevHandler = function(e) {
        getEntityList(e.currentTarget.page_prev, limit)
    }

    const gotoNextHandler = function(e) {

        getEntityList(e.currentTarget.page_next, limit)
    }

    //render entity with js considering different types
    const renderEntityCard = function(attributes) {

        const divCard = document.createElement("a");
        divCard.classList.add("note");
        divCard.href = "#";
        divCard.setAttribute('data-id', attributes.id);
        const h3Title = document.createElement("h3");
        const entityTitle = document.createTextNode(attributes.title);
        h3Title.appendChild(entityTitle);
        h3Title.classList.add("note-title");
        divCard.appendChild(h3Title);

        const pContent = document.createElement("p");
        const entityContent = document.createTextNode(attributes.content);
        pContent.appendChild(entityContent);
        divCard.appendChild(pContent);

        if(type === 'task') {
            const pDueDate = document.createElement("p");
            const flex = document.createElement("div");
            const pEventText = document.createElement("p");
            const textNode = document.createTextNode("Due: ");
            pEventText.appendChild(textNode);
            const entityDueDate = document.createTextNode(attributes.dueDate);
            pDueDate.appendChild(entityDueDate);
            pDueDate.classList.add("date");
            pDueDate.classList.add("dueDate");
            pEventText.classList.add("additional");
            flex.appendChild(pEventText);
            flex.appendChild(pDueDate);
            flex.classList.add("flex");
            divCard.appendChild(flex);
        }

        if(type === 'event') {
            const pEventDate = document.createElement("p");
            const flex = document.createElement("div");
            const pEventText = document.createElement("p");
            const textNode = document.createTextNode("Event: ");
            pEventText.appendChild(textNode);
            const entityEventDate = document.createTextNode(attributes.eventDate);
            flex.appendChild(pEventText);
            flex.appendChild(pEventDate);
            pEventDate.appendChild(entityEventDate);
            pEventText.classList.add("additional");
            pEventDate.classList.add("date");
            pEventDate.classList.add("dueDate");
            flex.classList.add("flex");
            divCard.appendChild(flex);
        }

        const flex = document.createElement("div");
        const pDate = document.createElement("p");
        const pTime = document.createElement("p");
        const entityDate = document.createTextNode(attributes.date);
        const entityTime = document.createTextNode(attributes.time);
        pDate.appendChild(entityDate);
        pTime.appendChild(entityTime);
        pDate.classList.add("date");
        pTime.classList.add("date");
        flex.classList.add("flex");
        divCard.appendChild(flex);
        flex.appendChild(pDate);
        flex.appendChild(pTime);

        divCard.addEventListener('click', clickEditCardHandler);

        return divCard;

    }

    //render card editor with js
    const renderCardEditor = function (attributes, entity) {
        let input = null;
        let inputs = document.getElementById('inputs');
        inputs.innerHTML = '';
        attributes.forEach((attribute) => {
            if (attribute.tag === "input") {
                input = document.createElement('input');
                input.type = attribute.attributes.type;
                input.name = attribute.name;
                input.setAttribute('id', 'entity-' + attribute.name);
                input.setAttribute('placeholder', 'Title');
                input.setAttribute('value', entity[attribute.name]);

                if(attribute.attributes.type === "checkbox") {
                    const label = document.createElement('label');
                    if(entity[attribute.name]) {
                        input.setAttribute('id', 'entity-' + attribute.name); // remove duplicate
                        input.setAttribute('checked', false); // false ?
                    }
                    label.htmlFor = input.id;
                    label.textContent = 'The task is completed';
                    inputs.appendChild(label);
                }
                if(attribute.attributes.type !== "checkbox") {
                    input.setAttribute('required', true);
                }
            }
            if (attribute.tag === "textarea") {
                input = document.createElement('textarea');
                const text = document.createTextNode(entity.content);
                input.appendChild(text);
                input.setAttribute('placeholder', 'Type here..');
                input.setAttribute('name', attribute.name);
                input.setAttribute('id', 'entity-' + attribute.name);
            }
            inputs.appendChild(input);
        });
        showEditor();
    }
    const cleanEntityList = function() {
        let entitiesList = document.getElementById('entities-list');
        entitiesList.innerHTML = '';
    }

    const hideEditor = function () {
        document.getElementById('entity-editor').style.display = 'none';
    }

    const showEditor = function () {
        document.getElementById('entity-editor').style.display = 'block';
    }


    //create new entity based on its type
    const clickCreateCardHandler = function() {

        fetch('/api/v1/entity/new/'+type, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => response.json())
            .then((data) => {
                let formEditor = document.getElementById('entity-editor');
                formEditor.dataAttributes = data.attributes;
                formEditor.entity = data.entity;
                formEditor.mode = 'create';
                renderCardEditor(data.attributes, data.entity);
            })
            .catch(error => {
                console.log('Error:' + error);
            });
    }

    //getting entity that will be edited
    const clickEditCardHandler = function(event) {
        let id = null;
        let anchor = null;
        if(event.target.tagName !== 'A') {
            anchor = event.target.parentNode;
        } else {
            anchor = event.target;
        }
        id = anchor.getAttribute('data-id');
        fetch('/api/v1/entity/'+id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => response.json())
            .then((data) => {
                let formEditor = document.getElementById('entity-editor');
                formEditor.dataAttributes = data.attributes;
                formEditor.entity = data.entity;
                formEditor.mode = 'edit';
                renderCardEditor(data.attributes, data.entity);
            })
            .catch(error => {
                console.log('Error:' + error);
            });
    }

    //posting/updating entity
    const applyEntityDataHandler = function() {
        let data = {};
        const editorForm = document.getElementById('inputs');
        const entityId = getEntityId();
        let attributes = editorForm.parentNode.dataAttributes;
        for(let attr in attributes) {
            if(attributes[attr].attributes.type !== 'checkbox') {
                data[attributes[attr].name] = document.getElementById('entity-'+attributes[attr].name).value;
            } else {
                data[attributes[attr].name] = document.getElementById('entity-'+attributes[attr].name).checked;
            }
        };
        const method = (editorForm.parentNode.mode === 'create') ? 'POST' : 'PUT';
        fetch('/api/v1/entity/'+entityId, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
        .then((response) => response.json())
        .then(() => {
            hideEditor();
            cleanEntityList();
            getEntityList(1, limit);
        })
        .catch(error => {
            console.log('Error:' + error);
        });
    }

    const resetEntityDataHandler = function() {
        hideEditor();
    }

    //deleting entity by id
    const deleteEntityDataHandler = function() {
        const entityId = getEntityId();
        fetch('/api/v1/entities/'+entityId, {
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
            cleanEntityList();
            getEntityList(1, limit);
        })
        .catch((error) => {
            console.log(error);
        });

        hideEditor();
    }
    const getEntityId = function () {
        return parseInt(document.getElementById('entity-id').value);
    }

    /**
     * getting entity list by parameter value "type"
     */
    const getEntityList = function(page, limit) {
        let matches = window.location.href.match(/.*\/(.*?)\#?$/); //receiving type from query
        if(matches) {
            type = matches[1];
            let url = `/api/v1/entity?type=${type}&page=${page}&limit=${limit}`;

            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    renderEntitiesList(data);
                })
                .catch(error => {
                    console.log('Error:' + error);
                });
        }
    }

    getEntityList(1, limit);
    document.getElementById('create-button').addEventListener('click', clickCreateCardHandler);
})();
