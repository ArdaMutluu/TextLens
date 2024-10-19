let fileText = ''; 

function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    const reader = new FileReader();

    if (file.type === 'text/plain') {
        reader.onload = function(event) {
            fileText = event.target.result;
            document.getElementById('fileName').innerText = file.name;
            document.getElementById('fileContent').innerText = fileText;
            processTextFile(fileText);
        };
        reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
        // Use pdf.js to read PDF
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

        pdfjsLib.getDocument(file).promise.then(function(pdf) {
            let text = '';
            const numPages = pdf.numPages;

            for (let i = 1; i <= numPages; i++) {
                pdf.getPage(i).then(function(page) {
                    return page.getTextContent();
                }).then(function(textContent) {
                    textContent.items.forEach(item => {
                        text += item.str + ' ';
                    });

                    if (i === numPages) {
                        fileText = text;
                        document.getElementById('fileName').innerText = file.name;
                        document.getElementById('fileContent').innerText = fileText;
                        processTextFile(fileText);
                    }
                });
            }
        });
    } else {
        alert('Please upload a valid .txt or .pdf file.');
    }
}

function processTextFile(text) {
    const words = text.split(/\s+/);
    const wordCount = words.length;
    const charCount = text.length; 
    const docLength = words.join(' ').length; 

    // Count occurrences of each word
    const wordFrequency = {};
    words.forEach(word => {
        word = word.toLowerCase();
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    const sortedWords = Object.entries(wordFrequency).sort((a, b) => b[1] - a[1]);

    const mostUsedWords = sortedWords.slice(0, 10);
    
    const leastUsedWords = sortedWords.slice(-10);

    displayResults(wordCount, charCount, docLength, mostUsedWords, leastUsedWords);
}

function displayResults(wordCount, charCount, docLength, mostUsedWords, leastUsedWords) {
    document.getElementById('wordCount').innerText = `Word Count: ${wordCount}`;
    document.getElementById('charCount').innerText = `Character Count: ${charCount}`;
    document.getElementById('docLength').innerText = `Document Length: ${docLength}`;

    const groupedMostUsed = groupWordsByFrequency(mostUsedWords);
    const mostUsedElement = document.getElementById('mostUsed');
    mostUsedElement.innerHTML = '';

    let rank = 1;
    groupedMostUsed.forEach(group => {
        group.forEach(([word, count], index) => {
            const li = document.createElement('li');
            li.innerHTML = `${rank}. ${word}: ${count}`;
            if (index === 0 && rank === 1) li.style.fontWeight = 'bold'; 
            mostUsedElement.appendChild(li);
        });
        rank++;
    });

    const groupedLeastUsed = groupWordsByFrequency(leastUsedWords.reverse());
    const leastUsedElement = document.getElementById('leastUsed');
    leastUsedElement.innerHTML = '';

    rank = 1;
    groupedLeastUsed.forEach(group => {
        group.forEach(([word, count], index) => {
            const li = document.createElement('li');
            li.innerHTML = `${rank}. ${word}: ${count}`;
            if (index === 0 && rank === 1) li.style.fontWeight = 'bold'; // Highlight the least used word
            leastUsedElement.appendChild(li);
        });
        rank++; 
    });
}

function groupWordsByFrequency(words) {
    const grouped = [];
    let currentGroup = [];

    for (let i = 0; i < words.length; i++) {
        if (i === 0 || words[i][1] === words[i - 1][1]) {
            currentGroup.push(words[i]);
        } else {
            grouped.push(currentGroup);
            currentGroup = [words[i]];
        }
    }

    if (currentGroup.length > 0) {
        grouped.push(currentGroup);
    }

    return grouped;
}


function performSearch() {
    const keyword = document.getElementById('keyword').value.trim().toLowerCase();
    const searchstat = document.getElementById('searchstat');

    if (!fileText) {
        searchstat.innerHTML = 'No document uploaded yet.';
        return;
    }

    if (!keyword) {
        searchstat.innerHTML = 'Please enter a search keyword.';
        return;
    }

    // Search for the keyword in the file
    const occurrences = fileText.toLowerCase().split(keyword).length - 1;

    if (occurrences > 0) {
        searchstat.innerHTML = `The keyword "${keyword}" was found ${occurrences} times.`;
    } else {
        searchstat.innerHTML = `The keyword "${keyword}" was not found.`;
    }
}
