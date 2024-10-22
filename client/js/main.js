
const existingMRNumbers = ["UL030", "UL031", "UL032"]; 

function showCreateForm() {
    const form = document.getElementById('createForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function showSearchForm() {
    console.log('Showing search form'); 
    const form = document.getElementById('searchForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function checkMRNumber() {
    const mrNumberInput = document.getElementById('createMRNumber');
    const errorMessage = document.getElementById('error-message');
    const submitButton = document.getElementById('submitLog');
    const mrNumber = mrNumberInput.value;

    
    if (existingMRNumbers.includes(mrNumber)) {
        errorMessage.textContent = "This MR Number already exists.";
        errorMessage.style.display = "block";
        submitButton.disabled = true; 
    } else {
        errorMessage.style.display = "none"; 
        submitButton.disabled = false; 
    }
}

async function addLogbook(event) {
event.preventDefault(); 

const mrNumberInput = document.getElementById('createMRNumber');
const mrNumber = mrNumberInput.value;


if (existingMRNumbers.includes(mrNumber)) {
const errorMessage = document.getElementById('error-message');
errorMessage.textContent = "This MR Number already exists.";
errorMessage.style.display = "block";
return false; 
}


const yearInput = document.getElementById('year');
const monthInput = document.getElementById('month');
const dayInput = document.getElementById('day');

if (!yearInput || !monthInput || !dayInput || !validateDate(yearInput.value, monthInput.value, dayInput.value)) {
const errorMessage = document.getElementById('error-message');
errorMessage.textContent = "Invalid date.";
errorMessage.style.display = "block";
return false; 
}


const patientName = event.target.patientName.value;
console.log('Date is:', yearInput.value, monthInput.value, dayInput.value);


const date = new Date(`${yearInput.value}-${monthInput.value}-${dayInput.value}`);


const patientInfo = event.target.patientInfo.value;
const type = event.target.type.value;




const entryData = {
patientName,
mrNumber,
date,
patientInfo,
type,
};




const newRow = document.createElement('tr');
newRow.classList.add('row');  

newRow.innerHTML = `
<td>${patientName}</td>
<td>${new Date(date).toLocaleDateString()}</td>
<td>UL300000${mrNumber}</td>
<td>${patientInfo}</td>
<td>${type}</td>
<td><button onclick="deleteLogbook('${mrNumber}')">Delete</button></td>
`;
console.log('Entry data:', newRow); 


console.log('Adding new row with values:', patientName, date, mrNumber, patientInfo, type);
document.getElementById('logbookList').appendChild(newRow);



document.getElementById('logbookList').appendChild(newRow);


event.target.reset();
document.getElementById('error-message').style.display = "none"; 
existingMRNumbers.push(mrNumber); 


try {
    const response = await fetch('/api/logbooks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData), 
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const result = await response.json();
    console.log('Logbook entry added:', result);
} catch (error) {
    console.error('Error adding logbook entry:', error);
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = "Error saving logbook entry.";
    errorMessage.style.display = "block";
}

}



function deleteLogbook(mrNumber) {
    if (confirm(`Are you sure you want to delete logbook with MR Number ${mrNumber}?`)) {
        
        fetch(`/api/logbooks/${mrNumber}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                
                const rows = document.querySelectorAll('#logbookList tr');
                rows.forEach(row => {
                    
                    if (row.cells[2].innerText === String(mrNumber)) {
                        row.remove(); 
                        existingMRNumbers.splice(existingMRNumbers.indexOf(Number(mrNumber)), 1); 
                    }
                });

                alert('Logbook entry deleted successfully');
            }
        })
        .catch(error => {
            console.error('Error deleting logbook:', error);
            alert('There was an error deleting the logbook. Please try again.');
        });
    }
}


const dayInput = document.getElementById('day');
const monthInput = document.getElementById('month');
const yearInput = document.getElementById('year');
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

dayInput.addEventListener('input', function () {
    
    if (this.value.length === 1 && this.value > 3 && this.value < 10) {
        this.value = '0' + this.value;
    }
    
    
    if (this.value.length === 2) {
        monthInput.focus();
    }
});

monthInput.addEventListener('input', function () {
    
    if (this.value.length === 1 && this.value > 1 && this.value < 10) {
        this.value = '0' + this.value;
    }

    
    if (this.value.length === 2) {
        yearInput.focus();
    }
});

yearInput.addEventListener('input', function () {
    
    const currentYear = new Date().getFullYear();
    if (this.value.length === 4 && this.value < 1900 || this.value > currentYear) {
        alert(`Invalid year.`);
        this.value = '';
        this.focus();
    }
});

function validateDate() {
    const dayValue = parseInt(dayInput.value);
    const monthValue = parseInt(monthInput.value);
    const yearValue = parseInt(yearInput.value);

    
    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    let maxDays;

    
    if (monthValue === 2) {
        maxDays = isLeapYear(yearValue) ? 29 : 28; 
    } 
    else if ([4, 6, 9, 11].includes(monthValue)) {
        maxDays = 30; 
    } else {
        maxDays = 31; 
    }

    
    if (dayValue < 1 || dayValue > maxDays) {
        
        const monthName = monthNames[monthValue - 1];
        displayInvalidMessage(`Invalid day. ${monthName} has only ${maxDays} days.`);
        dayInput.value = '';
        monthInput.value = '';
        yearInput.value = '';
        dayInput.focus();
        return false; 
    }

    return true; 
}

function displayInvalidMessage(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = "block"; 
}




document.getElementById('searchNameButton').addEventListener('click', searchByName);
document.getElementById('searchMrNumberButton').addEventListener('click', searchByMRNumber);

function searchByName() {
    const patientName = document.getElementById('nameInput').value;

    if (!patientName) {
        alert('Please enter a patient\'s name.');
        return;
    }

    fetch(`/api/logbooks/search?patientName=${encodeURIComponent(patientName)}`)
        .then(response => response.json())
        .then(data => displaySearchResults(data))
        .catch(error => {
            console.error('Error searching by name:', error);
            alert('There was an error searching for the logbook by name. Please try again.');
        });
}

function searchByMRNumber() {
    const mrNumber = document.getElementById('mrNumberInput').value;

    if (!mrNumber) {
        alert('Please enter an MR number.');
        return;
    }

    fetch(`/api/logbooks/search?mrNumber=${encodeURIComponent(mrNumber)}`)
        .then(response => response.json())
        .then(data => displaySearchResults(data))
        .catch(error => {
            console.error('Error searching by MR number:', error);
            alert('There was an error searching for the logbook by MR number. Please try again.');
        });
}

function displaySearchResults(data) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = ''; 

    if (data.error) {
        alert(data.error);
        return;
    }

    
    if (data.length === 0) {
        resultsDiv.innerHTML = '<p>No entries found.</p>';
        return;
    }

    data.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.innerHTML = `
            <strong>Patient Name:</strong> ${log.patientName}<br>
            <strong>MR Number:</strong> UL300000${log.mrNumber}<br>
            <strong>Patient Info:</strong> ${log.patientInfo}<br>
            <strong>Date:</strong> ${new Date(log.date).toLocaleDateString()}<br>
            <strong>Type:</strong> ${log.type}<br>
            <hr>
        `;
        resultsDiv.appendChild(logEntry);
    });
}


function formatDate(isoDate) {
    const date = new Date(isoDate);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-US', options); 
}



