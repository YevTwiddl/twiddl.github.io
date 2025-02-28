// Mock data for our demo
const mockData = {
    sales: [
        { customer_id: 1001, purchase_date: '2023-01-15', total_amount: 125000, product_id: 'PROJ-A', region: 'Tokyo' },
        { customer_id: 1002, purchase_date: '2023-02-22', total_amount: 89000, product_id: 'SERV-B', region: 'Tokyo' },
        { customer_id: 1003, purchase_date: '2023-01-30', total_amount: 67000, product_id: 'PROJ-C', region: 'Tokyo' },
        { customer_id: 1004, purchase_date: '2023-03-05', total_amount: 45000, product_id: 'SERV-A', region: 'Osaka' },
        { customer_id: 1005, purchase_date: '2023-02-18', total_amount: 78000, product_id: 'PROJ-B', region: 'Tokyo' },
        { customer_id: 1001, purchase_date: '2023-03-20', total_amount: 52000, product_id: 'SERV-C', region: 'Tokyo' }
    ],
    customers: [
        { customer_id: 1001, customer_name: 'Tanaka Corp', email: 'info@tanaka.co.jp', signup_date: '2022-05-10', company: 'Tanaka Corporation' },
        { customer_id: 1002, customer_name: 'Suzuki Ltd', email: 'contact@suzuki.jp', signup_date: '2022-06-15', company: 'Suzuki Limited' },
        { customer_id: 1003, customer_name: 'Watanabe Inc', email: 'sales@watanabe.co.jp', signup_date: '2022-04-22', company: 'Watanabe Inc' },
        { customer_id: 1004, customer_name: 'Yamamoto Group', email: 'info@yamamoto.jp', signup_date: '2022-07-05', company: 'Yamamoto Group' },
        { customer_id: 1005, customer_name: 'Sato Systems', email: 'hello@sato-sys.jp', signup_date: '2022-05-30', company: 'Sato Systems' }
    ]
};

// Track the state of our query
const queryState = {
    selectedColumns: [],
    filters: []
};

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Set up modal functionality
    setupModal();
    
    // Mark join keys and make them non-clickable
    setupJoinKeys();
    
    // Set up column selection
    setupColumnSelection();
    
    // Set up filter functionality
    setupFilters();
    
    // Set up query execution
    document.getElementById('run-query').addEventListener('click', executeQuery);
    
    // Add event listeners for the new demo buttons
    const navDemoBtn = document.getElementById('nav-demo-button');
    const footerDemoBtn = document.getElementById('footer-demo-button');
    const modal = document.getElementById('demo-modal');
    
    if (navDemoBtn) {
        navDemoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
            resetDemoState();
        });
    }
    
    if (footerDemoBtn) {
        footerDemoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
            resetDemoState();
        });
    }
    
    // Technical Notes dropdown
    const techDetails = document.querySelector('.tech-details');
    const techHeader = techDetails.querySelector('h3');
    
    techHeader.addEventListener('click', function() {
        techDetails.classList.toggle('open');
        this.classList.toggle('open');
    });
    
    // Set up waitlist form submission with Email.js
    setupWaitlistForm();
});

// Set up the join keys (customer_id columns)
function setupJoinKeys() {
    // Find all customer_id columns and mark them
    const customerIdColumns = document.querySelectorAll('.column-item[data-column="customer_id"]');
    
    customerIdColumns.forEach(item => {
        // Add join key styling
        item.classList.add('join-key', 'selected');
        
        // Add data attribute to mark as a join key
        item.setAttribute('data-join-key', 'true');
        
        // Add to selected columns by default
        const fileId = item.closest('.file-panel').id.replace('-file', '');
        
        queryState.selectedColumns.push({
            file: fileId,
            column: 'customer_id',
            displayName: `${fileId}:customer_id`,
            isJoinKey: true
        });
    });
    
    // Update UI
    updateSelectedColumnsUI();
}

// Set up the column selection functionality
function setupColumnSelection() {
    const columnItems = document.querySelectorAll('.column-item:not([data-join-key="true"])');
    
    columnItems.forEach(item => {
        item.addEventListener('click', function() {
            const column = this.getAttribute('data-column');
            const fileHeader = this.closest('.file-panel').querySelector('.file-header').textContent;
            const fileId = this.closest('.file-panel').id.replace('-file', '');
            
            // Toggle selection visually
            this.classList.toggle('selected');
            
            // Check if already selected
            const existingIndex = queryState.selectedColumns.findIndex(col => 
                col.column === column && col.file === fileId);
            
            if (existingIndex >= 0) {
                // Remove if already selected
                queryState.selectedColumns.splice(existingIndex, 1);
            } else {
                // Add to selected columns
                queryState.selectedColumns.push({
                    file: fileId,
                    column: column,
                    displayName: `${fileId}:${column}`
                });
            }
            
            // Update the UI
            updateSelectedColumnsUI();
            
            // Update filter dropdown options
            updateFilterColumnOptions();
        });
    });
}

// Update the UI showing selected columns
function updateSelectedColumnsUI() {
    const container = document.getElementById('columns-container');
    
    // Clear current content
    container.innerHTML = '';
    
    if (queryState.selectedColumns.length === 0) {
        container.innerHTML = '<div class="placeholder">Click columns from the files to select them</div>';
        return;
    }
    
    // Add each selected column
    queryState.selectedColumns.forEach((col, index) => {
        const columnEl = document.createElement('div');
        columnEl.className = 'selected-column';
        
        // Add join-key class if it's a join key
        if (col.isJoinKey) {
            columnEl.classList.add('join-key-selected');
        }
        
        let removeButton = col.isJoinKey ? '' : `<span class="column-remove" data-index="${index}">×</span>`;
        let joinKeyBadge = col.isJoinKey ? '<span class="join-key-badge">JOIN KEY</span>' : '';
        
        columnEl.innerHTML = `
            <span>${col.displayName}</span>
            ${joinKeyBadge}
            ${removeButton}
        `;
        container.appendChild(columnEl);
    });
    
    // Add event listeners to removal buttons
    document.querySelectorAll('.column-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            
            // Also toggle the visual selection in the file panel
            const removedCol = queryState.selectedColumns[index];
            const columnItem = document.querySelector(`.file-panel#${removedCol.file}-file .column-item[data-column="${removedCol.column}"]`);
            if (columnItem) {
                columnItem.classList.remove('selected');
            }
            
            // Remove from state
            queryState.selectedColumns.splice(index, 1);
            
            // Update UI
            updateSelectedColumnsUI();
            
            // Update filter options
            updateFilterColumnOptions();
        });
    });
}

// Set up filter functionality
function setupFilters() {
    // Initial filter column options
    updateFilterColumnOptions();
    
    // Add filter button
    document.getElementById('add-filter').addEventListener('click', function() {
        const column = document.getElementById('filter-column').value;
        const operator = document.getElementById('filter-operator').value;
        const value = document.getElementById('filter-value').value.trim();
        
        if (!column || !value) {
            return; // Don't add empty filters
        }
        
        // Add the filter
        queryState.filters.push({
            column: column,
            operator: operator,
            value: value
        });
        
        // Update the UI
        updateActiveFiltersUI();
        
        // Clear the inputs
        document.getElementById('filter-value').value = '';
    });
}

// Update filter column dropdown options based on selected columns
function updateFilterColumnOptions() {
    const filterSelect = document.getElementById('filter-column');
    
    // Clear current options, except the placeholder
    filterSelect.innerHTML = '<option value="">Select column</option>';
    
    // Add an option for each selected column
    queryState.selectedColumns.forEach(col => {
        const option = document.createElement('option');
        option.value = col.displayName;
        option.textContent = col.displayName;
        filterSelect.appendChild(option);
    });
}

// Update the UI showing active filters
function updateActiveFiltersUI() {
    const container = document.getElementById('active-filters');
    
    // Clear current content
    container.innerHTML = '';
    
    if (queryState.filters.length === 0) {
        return;
    }
    
    // Add each active filter
    queryState.filters.forEach((filter, index) => {
        const filterEl = document.createElement('div');
        filterEl.className = 'active-filter';
        filterEl.innerHTML = `
            <span>${filter.column} ${filter.operator} "${filter.value}"</span>
            <span class="filter-remove" data-index="${index}">×</span>
        `;
        container.appendChild(filterEl);
    });
    
    // Add event listeners to removal buttons
    document.querySelectorAll('.filter-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            
            // Remove from state
            queryState.filters.splice(index, 1);
            
            // Update UI
            updateActiveFiltersUI();
        });
    });
}

// Execute the query based on current state
function executeQuery() {
    const userSelectedColumns = queryState.selectedColumns.filter(col => !col.isJoinKey);
    
    if (userSelectedColumns.length === 0) {
        alert('Please select at least one column beyond the join keys');
        return;
    }
    
    // Get the unique files needed for this query
    const filesNeeded = [...new Set(queryState.selectedColumns.map(col => col.file))];
    
    let results;
    
    // If we have columns from both files, always join
    if (filesNeeded.includes('sales') && filesNeeded.includes('customers')) {
        // Join data from both files on customer_id
        results = mockData.sales.map(sale => {
            const customer = mockData.customers.find(c => c.customer_id === sale.customer_id);
            return customer ? { ...sale, ...customer } : null;
        }).filter(item => item !== null); // Remove any null results
    } else if (filesNeeded.includes('sales')) {
        // Only sales data
        results = [...mockData.sales];
    } else {
        // Only customer data
        results = [...mockData.customers];
    }
    
    // Apply filters
    if (queryState.filters.length > 0) {
        results = results.filter(row => {
            return queryState.filters.every(filter => {
                // Extract file and column from the filter.column (format: file:column)
                const [file, column] = filter.column.split(':');
                const value = row[column];
                
                switch (filter.operator) {
                    case '=':
                        return String(value) === filter.value;
                    case '>':
                        return parseFloat(value) > parseFloat(filter.value);
                    case '<':
                        return parseFloat(value) < parseFloat(filter.value);
                    case 'LIKE':
                        return String(value).toLowerCase().includes(filter.value.toLowerCase());
                    default:
                        return true;
                }
            });
        });
    }
    
    // Display results
    displayResults(results);
}

// Display the query results
function displayResults(results) {
    const container = document.getElementById('results-table');
    
    // Clear current content
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<div class="no-results">No results match your query</div>';
        return;
    }
    
    // Get all columns to display - always include customer_id first
    const columnsToShow = [];
    
    // First add customer_id
    columnsToShow.push({
        column: 'customer_id',
        displayName: 'customer_id'
    });
    
    // Then add user-selected columns that aren't already included
    queryState.selectedColumns.forEach(col => {
        if (col.column !== 'customer_id') {
            columnsToShow.push({
                column: col.column,
                displayName: col.displayName
            });
        }
    });
    
    // Create header row with columns
    const headerRow = document.createElement('div');
    headerRow.className = 'result-row header';
    
    columnsToShow.forEach(col => {
        const cell = document.createElement('div');
        cell.className = 'result-cell';
        cell.textContent = col.column;
        headerRow.appendChild(cell);
    });
    
    container.appendChild(headerRow);
    
    // Limit to first 4 rows for display
    const displayResults = results.slice(0, 4);
    
    // Add data rows
    displayResults.forEach(row => {
        const dataRow = document.createElement('div');
        dataRow.className = 'result-row';
        
        columnsToShow.forEach(col => {
            const cell = document.createElement('div');
            cell.className = 'result-cell';
            
            // Extract the column name
            const columnName = col.column;
            
            // Format currency values
            if (columnName === 'total_amount') {
                cell.textContent = '$' + row[columnName].toLocaleString();
            } else {
                cell.textContent = row[columnName] || '';
            }
            
            dataRow.appendChild(cell);
        });
        
        container.appendChild(dataRow);
    });
    
    // Scroll to results section
    setTimeout(() => {
        const resultsSection = document.querySelector('.query-results');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Modal functionality
function setupModal() {
    const modal = document.getElementById('demo-modal');
    const openModalBtn = document.getElementById('open-demo-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // Open modal
    if (openModalBtn) {
        openModalBtn.addEventListener('click', function() {
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
            
            // Reset the demo state when opening the modal
            resetDemoState();
        });
    }
    
    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });
}

// Reset the demo state
function resetDemoState() {
    // Clear selected columns
    queryState.selectedColumns = [];
    
    // Clear filters
    queryState.filters = [];
    
    // Reset UI
    const columnItems = document.querySelectorAll('.column-item:not([data-join-key="true"])');
    columnItems.forEach(item => {
        item.classList.remove('selected');
    });
    
    // Set up join keys again
    setupJoinKeys();
    
    // Update UI
    updateSelectedColumnsUI();
    updateFilterColumnOptions();
    updateActiveFiltersUI();
    
    // Reset results
    const resultsTable = document.getElementById('results-table');
    if (resultsTable) {
        resultsTable.innerHTML = '<div class="results-placeholder">Your query results will appear here</div>';
    }
}

// Set up the waitlist form submission
function setupWaitlistForm() {
    const waitlistForm = document.querySelector('.waitlist-form');
    
    if (waitlistForm) {
        // Remove any existing messages when setting up
        const existingMessages = waitlistForm.parentNode.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Note: The actual form submission is now handled in email-handler.js
        // This function is kept for compatibility but doesn't need to do anything
        console.log('Waitlist form setup - submission handled by email-handler.js');
    }
} 