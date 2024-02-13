import axios from "axios";

async function updateEntry(id, word, meaning, book_id, note, unwanted, study_count, date_to_review, created_at) {
    try {
        const token = localStorage.getItem("token");
        const serverLink = localStorage.getItem("server_link");
        const url = serverLink + '/entry/update'
        const response = await axios.put(url, {
            id,
            word,
            meaning,
            book_id,
            note,
            unwanted,
            study_count,
            date_to_review,
            created_at,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data
    } catch (error) {
        console.error('Error fetching data from backend:', error);
    }
}

async function updateEntryNote(id, note) {
    try {
        const token = localStorage.getItem("token");
        const serverLink = localStorage.getItem("server_link");
        const url = serverLink + '/entry/update'
        const response = await axios.put(url, {
            id,
            note,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data
    } catch (error) {
        console.error('Error fetching data from backend:', error);
    }
}

async function setUnwanted(id) {
    try {
        const token = localStorage.getItem("token");
        const serverLink = localStorage.getItem("server_link");
        const url = serverLink + '/entry/update'
        const response = await axios.put(url, {
            id,
            unwanted: true,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data
    } catch (error) {
        console.error('Error fetching data from backend:', error);
    }
}

async function updateEntryStudyCount(id) {
    try {
        const token = localStorage.getItem("token");
        const serverLink = localStorage.getItem("server_link");
        const url = serverLink + '/entry/update/study/count/' + id;
        const response = await axios.put(url, null,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        return response.data
    } catch (error) {
        console.error('Error fetching data from backend:', error);
    }
}

export {updateEntry, updateEntryNote, setUnwanted, updateEntryStudyCount};