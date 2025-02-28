'use strict'

// Utility Functions
function displayAlert(message, type) {
    const errorAlert = document.getElementById('errorAlert')
    const successAlert = document.getElementById('successAlert')
    const alertElement = type === 'error' ? errorAlert : successAlert

    alertElement.textContent = message
    alertElement.classList.remove('hidden')
    setTimeout(() => alertElement.classList.add('hidden'), 3000)
}

function generateId() {
    return `${Date.now().toString(36)}${Math.random()
        .toString(36)
        .substr(2, 10)}`
}

// Core Functions
function createGroceryItem(content) {
    return `
        <div class="grocery-item flex items-center justify-between p-1 bg-[#3f3f3f] rounded-lg w-full">
            <span class="grocery-item-text text-[#8b8b8b] mr-auto">${content}</span>
            <div class="flex items-center gap-1 ml-auto">
                <button class="edit-btn p-1 rounded-md hover:bg-[#4f4f4f] transition-colors duration-300">
                    <img src="./src/edit.png" alt="Edit" class="w-4 h-4 filter invert hover:scale-110 transition-transform duration-300">
                </button>
                <button class="delete-btn p-1 rounded-md hover:bg-[#4f4f4f] transition-colors duration-300">
                    <img src="./src/delete.png" alt="Delete" class="w-4 h-4 filter invert hover:scale-110 transition-transform duration-300">
                </button>
            </div>
        </div>
    `
}

// Add these functions to handle edit and delete
function deleteItem(element) {
    const groceryList = document.getElementById('grocery-list')
    groceryList.removeChild(element.closest('article'))
    if (groceryList.children.length === 0) {
        groceryList.classList.add('hidden')
    }
    displayAlert('Item Removed', 'success')

    // Save to localStorage after deleting item
    saveItemsToLocalStorage()
}

function editItem(element) {
    const item = element.closest('.grocery-item')
    const textElement = item.querySelector('.grocery-item-text')
    const groceryInput = document.getElementById('grocery')

    // Set input value to current item text
    groceryInput.value = textElement.textContent
    groceryInput.focus()

    // Remove the old item
    item.closest('article').remove()

    // Change submit button text to indicate editing
    const submitBtn = document.querySelector('button[type="submit"]')
    submitBtn.innerHTML = `<img class="w-4 h-4 filter invert" src="./src/edit.png" alt="edit">`
}

// Update handleGrocerySubmit to add event listeners
function handleGrocerySubmit(value) {
    const element = document.createElement('article')
    element.classList.add('grocery-item')
    const attr = document.createAttribute('data-id')
    attr.value = generateId()
    element.setAttributeNode(attr)
    element.innerHTML = createGroceryItem(value)

    // Add event listeners to the new buttons
    const deleteBtn = element.querySelector('.delete-btn')
    const editBtn = element.querySelector('.edit-btn')

    deleteBtn.addEventListener('click', () => deleteItem(deleteBtn))
    editBtn.addEventListener('click', () => editItem(editBtn))

    const groceryList = document.getElementById('grocery-list')
    if (!groceryList) {
        displayAlert('Grocery list container not found', 'error')
        return
    }

    groceryList.classList.remove('hidden')
    groceryList.appendChild(element)
    displayAlert('Item Added Successfully', 'success')

    // Save to localStorage after adding item
    saveItemsToLocalStorage()
}

// Event Handlers
function addItem(e, input) {
    e.preventDefault()
    const value = input.value
    try {
        if (value) {
            handleGrocerySubmit(value)
        } else {
            throw new Error('Enter a value')
        }
    } catch (error) {
        displayAlert(error.message, 'error')
    }
}

// DOM Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const groceryForm = document.getElementById('grocery-form')
    const groceryInput = document.getElementById('grocery')

    if (!groceryForm || !groceryInput) {
        displayAlert('Required form elements not found', 'error')
        return
    }

    // Grocery form submission
    groceryForm.addEventListener('submit', e => {
        e.preventDefault()

        if (!groceryInput.value) {
            displayAlert('Please enter a value', 'error')
            return
        }

        try {
            handleGrocerySubmit(groceryInput.value)
            groceryInput.value = '' // Clear input after successful submission
        } catch (error) {
            displayAlert(error.message, 'error')
        }
    })

    // Add enter key support
    groceryInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault()
            groceryForm.requestSubmit()
        }
    })

    // Add clear items functionality
    const clearButton = document.getElementById('clearItemsButton')
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            const groceryList = document.getElementById('grocery-list')
            if (groceryList && groceryList.children.length > 0) {
                groceryList.innerHTML = ''
                groceryList.classList.add('hidden')
                displayAlert('All items cleared', 'success')
                // Clear localStorage when clearing all items
                localStorage.removeItem('groceryItems')
            }
        })
    }

    // Load items from localStorage when the page loads
    loadItemsFromLocalStorage()
})

function saveItemsToLocalStorage() {
    const groceryList = document.getElementById('grocery-list')
    const items = []

    // Convert grocery items to a serializable format
    Array.from(groceryList.children).forEach(item => {
        const textElement = item.querySelector('.grocery-item-text')
        items.push({
            id: item.getAttribute('data-id'),
            text: textElement.textContent,
        })
    })

    localStorage.setItem('groceryItems', JSON.stringify(items))
}

function loadItemsFromLocalStorage() {
    const groceryList = document.getElementById('grocery-list')
    const savedItems = localStorage.getItem('groceryItems')

    if (savedItems) {
        const items = JSON.parse(savedItems)

        if (items.length > 0) {
            groceryList.classList.remove('hidden')

            items.forEach(item => {
                const element = document.createElement('article')
                element.classList.add('grocery-item')
                const attr = document.createAttribute('data-id')
                attr.value = item.id
                element.setAttributeNode(attr)
                element.innerHTML = createGroceryItem(item.text)

                // Add event listeners to the new buttons
                const deleteBtn = element.querySelector('.delete-btn')
                const editBtn = element.querySelector('.edit-btn')

                deleteBtn.addEventListener('click', () => deleteItem(deleteBtn))
                editBtn.addEventListener('click', () => editItem(editBtn))

                groceryList.appendChild(element)
            })
        }
    }
}

// Example of saving data to localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
        console.error('Error saving to localStorage:', error)
    }
}

// Example of retrieving data from localStorage
function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
    } catch (error) {
        console.error('Error reading from localStorage:', error)
        return null
    }
}
