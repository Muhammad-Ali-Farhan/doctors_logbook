// client/js/index.js
const API_URL = 'mongodb+srv://mohalifarhan:AXhBteYQw3M7om6M@clusterlog.vd93z.mongodb.net/?retryWrites=true&w=majority&appName=ClusterLog';

document.getElementById('registerForm')?.onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    alert('User registered');
};

document.getElementById('loginForm')?.onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
        loadLogbookEntries();
    } else {
        alert(data.message);
    }
};

document.getElementById('logbookForm')?.onsubmit = async (e) => {
    e.preventDefault();
    const patientName = document.getElementById('patientName').value;
    const Date = document.getElementById('Date').value;
    const mrNumber = document.getElementById('mrNumber').value;
    const patientInfo = document.getElementById('patientInfo').value;
    const type = document.getElementById('type').value;

    await fetch(`${API_URL}/logbook`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ patientName, Date, mrNumber, patientInfo, type })
    });

    loadLogbookEntries(); // Reload entries to display the new one
};


async function loadLogbookEntries() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/logbook`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const entries = await response.json();

    const logbookEntriesDiv = document.getElementById('logbookEntries').getElementsByTagName('tbody')[0];
    logbookEntriesDiv.innerHTML = ''; // Clear existing entries
    entries.forEach(entry => {
        const row = logbookEntriesDiv.insertRow();
        row.innerHTML = `
            <td>${entry.patientName}</td>
            <td>${new Date(entry.Date).toLocaleDateString()}</td>
            <td>${entry.mrNumber}</td>
            <td>${entry.patientInfo}</td>
            <td>${entry.type}</td>
            <td><button onclick="confirmDelete('${entry._id}')">Delete</button></td>
        `;
    });
}


async function deleteLogbookEntry(id) {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/logbook/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    loadLogbookEntries();
}

// Load logbook entries on page load
loadLogbookEntries();


async function searchLogbooks() {
    const patientName = document.getElementById('patientNameInput').value; // Get patient name from input
    const mrNumber = document.getElementById('mrNumberInput').value; // Get MR number from input

    try {
        const response = await fetch('/logbooks/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ patientName, mrNumber }), // Send both fields
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const logbooks = await response.json();
        // Update your UI with the logbooks
        console.log(logbooks);
        // Here you can implement code to display the logbooks on the page
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Attach the search function to the button
document.getElementById('searchButton').addEventListener('click', searchLogbooks);
