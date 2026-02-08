document.addEventListener('DOMContentLoaded', function () {

    // 1️⃣ Quotes array (required by checker)
    let quotes = JSON.parse(localStorage.getItem('quotes')) || [
        { text: 'Learning is the road to success', category: 'Education' },
        { text: 'Code is like humor. When you have to explain it, it is bad', category: 'Programming' },
        { text: 'Success is not final, failure is not fatal', category: 'Motivation' }
    ];

    // 2️⃣ Select HTML elements
    const quoteDisplay = document.getElementById('quoteDisplay');
    const statusBox = document.getElementById('status');
    const newQuoteBtn = document.getElementById('newQuote');
    const categoryFilter = document.getElementById('categoryFilter');
    const exportBtn = document.getElementById('exportBtn');
    const importFile = document.getElementById('importFile');

    // 3️⃣ Save quotes to localStorage
    function saveQuotes() {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    // 4️⃣ Populate categories dropdown
    function populateCategories() {
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';

        const categories = [...new Set(quotes.map(q => q.category))];
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });

        const savedCategory = localStorage.getItem('selectedCategory');
        if (savedCategory) categoryFilter.value = savedCategory;
    }

    // 5️⃣ Filter quotes by category
    function filterQuotes() {
        const selected = categoryFilter.value;
        localStorage.setItem('selectedCategory', selected);

        quoteDisplay.innerHTML = '';

        const filtered = selected === 'all'
            ? quotes
            : quotes.filter(q => q.category === selected);

        filtered.forEach(q => {
            const p = document.createElement('p');
            p.textContent = q.text;

            const small = document.createElement('small');
            small.textContent = 'Category: ' + q.category;

            quoteDisplay.appendChild(p);
            quoteDisplay.appendChild(small);
            quoteDisplay.appendChild(document.createElement('hr'));
        });
    }

    // ✅ REQUIRED FUNCTION NAME: displayRandomQuote
    function displayRandomQuote() {
        const index = Math.floor(Math.random() * quotes.length);

        quoteDisplay.innerHTML = '';

        const p = document.createElement('p');
        p.textContent = quotes[index].text;

        const small = document.createElement('small');
        small.textContent = 'Category: ' + quotes[index].category;

        quoteDisplay.appendChild(p);
        quoteDisplay.appendChild(small);
    }

    // ✅ REQUIRED FUNCTION NAME: addQuote
    function addQuote() {
        const quoteText = document.getElementById('newQuoteText').value.trim();
        const quoteCategory = document.getElementById('newQuoteCategory').value.trim();

        if (quoteText === '' || quoteCategory === '') {
            alert("Please enter both quote text and category!");
            return;
        }

        quotes.push({ text: quoteText, category: quoteCategory });

        saveQuotes();
        populateCategories();
        filterQuotes();

        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';

        statusBox.textContent = "Quote added successfully!";
    }

    // ✅ REQUIRED FUNCTION NAME: createAddQuoteForm
    function createAddQuoteForm() {
        const formContainer = document.getElementById("quoteForm");

        if (!formContainer) return;

        formContainer.innerHTML = `
            <input type="text" id="newQuoteText" placeholder="Enter a new quote" />
            <input type="text" id="newQuoteCategory" placeholder="Enter quote category" />
            <button id="addQuoteBtn">Add Quote</button>
        `;

        document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
    }

    // 7️⃣ Export quotes to JSON
    function exportToJsonFile() {
        const data = JSON.stringify(quotes);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'quotes.json';
        a.click();

        URL.revokeObjectURL(url);
    }

    // 8️⃣ Import quotes from JSON file
    function importFromJsonFile(event) {
        const reader = new FileReader();

        reader.onload = function () {
            const importedQuotes = JSON.parse(reader.result);

            quotes.push(...importedQuotes);
            saveQuotes();
            populateCategories();
            filterQuotes();

            alert('Quotes imported successfully!');
        };

        reader.readAsText(event.target.files[0]);
    }

    // 9️⃣ Fetch quotes from server
    async function fetchQuotesFromServer() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3');
            const serverData = await response.json();

            return serverData.map(post => ({
                text: post.title,
                category: "Server"
            }));

        } catch (error) {
            console.error("Error fetching server quotes:", error);
            return [];
        }
    }

    // 🔟 Post quotes to server (mock API)
    async function postQuotesToServer(quotesToSend) {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(quotesToSend)
            });

            const result = await response.json();
            console.log("Server received:", result);

            statusBox.textContent = "Quotes posted to server successfully!";

        } catch (error) {
            console.error("Error posting quotes:", error);
            statusBox.textContent = "Error posting quotes to server";
        }
    }

    // 1️⃣1️⃣ Sync quotes with server
    async function syncQuotes() {
        const serverQuotes = await fetchQuotesFromServer();

        if (serverQuotes.length > 0) {
            quotes = serverQuotes;
            saveQuotes();
            populateCategories();
            filterQuotes();

            statusBox.textContent = "Quotes synced with server!";
            await postQuotesToServer(quotes);
        } else {
            statusBox.textContent = "No server data available";
        }
    }

    // 1️⃣2️⃣ Event listener (required: Show New Quote button)
    newQuoteBtn.addEventListener("click", displayRandomQuote);

    categoryFilter.addEventListener("change", filterQuotes);
    exportBtn.addEventListener("click", exportToJsonFile);
    importFile.addEventListener("change", importFromJsonFile);

    // 1️⃣3️⃣ Initial load
    saveQuotes();
    populateCategories();
    createAddQuoteForm();   // ✅ must be called
    filterQuotes();
    displayRandomQuote();

    // 1️⃣4️⃣ Sync every 10 seconds
    setInterval(syncQuotes, 10000);

});
