// Gestiona la lista de la compra usando localStorage y Chart.js

let items = [];
let chart;
const STORAGE_KEY = 'shopping_list_v1';

// Cargar datos desde localStorage al iniciar
function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            items = JSON.parse(data);
        } catch (e) {
            console.error('Error parsing stored data', e);
            items = [];
            saveData();
        }
    }
}

// Guardar datos en localStorage
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Renderizar la tabla de productos
function renderList() {
    const tbody = document.querySelector('#product-table tbody');
    tbody.innerHTML = '';

    const searchTerm = document.querySelector('#search').value.toLowerCase();
    const sortBy = document.querySelector('#sort-by').value;

    const sortedItems = [...items].sort((a, b) => {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else {
            return a.quantity - b.quantity;
        }
    });

    sortedItems
        .filter(item => item.name.toLowerCase().includes(searchTerm))
        .forEach(item => {
            const tr = document.createElement('tr');
            if (item.bought) tr.classList.add('bought');

            tr.innerHTML = `
                <td><input type="checkbox" ${item.bought ? 'checked' : ''} data-id="${item.id}"></td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td><button data-action="delete" data-id="${item.id}">Eliminar</button></td>
            `;
            tbody.appendChild(tr);
        });

    updateChart();
}

// Añadir nuevo producto
function addItem(name, quantity) {
    const newItem = {
        id: Date.now(),
        name,
        quantity,
        bought: false
    };
    items.push(newItem);
    saveData();
    renderList();
}

// Marcar como comprado
function toggleBought(id) {
    const item = items.find(i => i.id === id);
    if (item) {
        item.bought = !item.bought;
        saveData();
        renderList();
    }
}

// Eliminar producto
function deleteItem(id) {
    items = items.filter(i => i.id !== id);
    saveData();
    renderList();
}

// Limpiar toda la lista
function clearList() {
    if (confirm('¿Seguro que quieres limpiar toda la lista?')) {
        items = [];
        saveData();
        renderList();
    }
}

// Actualizar gráfica
function updateChart() {
    if (typeof Chart === 'undefined') {
        return;
    }

    const dataMap = {};
    items.forEach(item => {
        if (!dataMap[item.name]) {
            dataMap[item.name] = 0;
        }
        dataMap[item.name] += Number(item.quantity);
    });

    const labels = Object.keys(dataMap);
    const quantities = Object.values(dataMap);

    const ctx = document.getElementById('chart').getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Cantidad total',
                data: quantities,
                backgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Manejar eventos del DOM
function bindEvents() {
    const form = document.getElementById('product-form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('product-name').value.trim();
        const qty = parseInt(document.getElementById('product-qty').value, 10);
        if (name && qty > 0) {
            addItem(name, qty);
            form.reset();
        } else {
            alert('Introduce un nombre y una cantidad válida');
        }
    });

    document.querySelector('#product-table tbody').addEventListener('click', e => {
        const id = Number(e.target.dataset.id);
        if (e.target.type === 'checkbox') {
            toggleBought(id);
        } else if (e.target.dataset.action === 'delete') {
            deleteItem(id);
        }
    });

    document.getElementById('clear-btn').addEventListener('click', clearList);

    document.getElementById('search').addEventListener('input', renderList);
    document.getElementById('sort-by').addEventListener('change', renderList);
}

// Inicializar app
function init() {
    loadData();
    bindEvents();
    renderList();
}

window.addEventListener('DOMContentLoaded', init);
