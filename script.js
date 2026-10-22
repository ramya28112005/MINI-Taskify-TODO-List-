
document.addEventListener('DOMContentLoaded', function() {

    const todoInput = document.getElementById('todoInput');
    const addTodoButton = document.getElementById('addTodoButton');
    const todoList = document.getElementById('todoList');
    const message = document.getElementById('message');

    const totalTasks = document.getElementById('totalTasks');
    const pendingTasks = document.getElementById('pendingTasks');
    const completedTasks = document.getElementById('completedTasks');

    const progressBar = document.getElementById('progressBar');
    const progressPercentage = document.getElementById('progressPercentage');
    const progressMessage = document.getElementById('progressMessage');

    const emptyState = document.getElementById('emptyState');
    const emptyTitle = document.getElementById('emptyTitle');
    const emptyMessage = document.getElementById('emptyMessage');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let todos = [];

    try {
        todos = JSON.parse(localStorage.getItem('todos')) || [];

        if (!Array.isArray(todos)) {
            todos = [];
        }
    } catch (error) {
        todos = [];
    }

    let currentFilter = 'all';

    // Display today's date
    document.getElementById('todayDate').textContent =
        new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

    // Display tasks
    function renderTodos() {
        todoList.innerHTML = '';

        let filteredTodos = todos
            .map((todo, index) => ({ ...todo, originalIndex: index }))
            .filter(function(todo) {
                if (currentFilter === 'pending') {
                    return !todo.completed;
                }

                if (currentFilter === 'completed') {
                    return todo.completed;
                }

                return true;
            });

        filteredTodos.forEach(function(todo) {
            const index = todo.originalIndex;

            const listItem = document.createElement('li');
            listItem.className =
                'list-group-item' + (todo.completed ? ' completed' : '');

            // Checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-check';
            checkbox.checked = todo.completed;
            checkbox.setAttribute('aria-label', 'Mark task complete');

            checkbox.addEventListener('change', function() {
                toggleTodoComplete(index);
            });

            // Task text
            const taskText = document.createElement('span');
            taskText.className = 'task-text';
            taskText.textContent = todo.text;

            taskText.addEventListener('click', function() {
                toggleTodoComplete(index);
            });

            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'deleteButton';
            deleteButton.textContent = 'Delete';

            deleteButton.addEventListener('click', function(event) {
                event.stopPropagation();
                deleteTodo(index);
            });

            listItem.appendChild(checkbox);
            listItem.appendChild(taskText);
            listItem.appendChild(deleteButton);

            todoList.appendChild(listItem);
        });

        updateDashboard(filteredTodos.length);
    }

    // Update statistics and progress
    function updateDashboard(visibleCount) {
        const total = todos.length;

        const completed = todos.filter(function(todo) {
            return todo.completed;
        }).length;

        const pending = total - completed;

        totalTasks.textContent = total;
        pendingTasks.textContent = pending;
        completedTasks.textContent = completed;

        const percentage = total === 0
            ? 0
            : Math.round((completed / total) * 100);

        progressBar.style.width = percentage + '%';
        progressPercentage.textContent = percentage + '%';

        if (total === 0) {
            progressMessage.textContent = 'Let’s get started!';
        } else if (percentage === 100) {
            progressMessage.textContent = 'Amazing! All tasks completed!';
        } else {
            progressMessage.textContent =
                completed + ' of ' + total + ' tasks completed';
        }

        // Show appropriate empty state
        if (visibleCount === 0) {
            emptyState.style.display = 'block';

            if (todos.length === 0) {
                emptyTitle.textContent = 'Your task list is empty';
                emptyMessage.textContent =
                    'Add your first task and make today productive!';
            } else if (currentFilter === 'pending') {
                emptyTitle.textContent = 'No pending tasks!';
                emptyMessage.textContent =
                    'You have completed all your tasks.';
            } else if (currentFilter === 'completed') {
                emptyTitle.textContent = 'No completed tasks yet';
                emptyMessage.textContent =
                    'Complete a task and it will appear here.';
            }
        } else {
            emptyState.style.display = 'none';
        }
    }

    // Delete task
    function deleteTodo(index) {
        todos.splice(index, 1);

        saveTodos();
        renderTodos();
    }

    // Mark task completed or pending
    function toggleTodoComplete(index) {
        todos[index].completed = !todos[index].completed;

        saveTodos();
        renderTodos();
    }

    // Add task
    function addTodo() {
        const taskText = todoInput.value.trim();

        if (taskText === '') {
            message.textContent = 'Please enter a task!';
            todoInput.focus();
            return;
        }

        todos.push({
            text: taskText,
            completed: false
        });

        todoInput.value = '';
        message.textContent = '';

        currentFilter = 'all';
        updateActiveFilter();

        saveTodos();
        renderTodos();
        todoInput.focus();
    }

    // Save tasks to local storage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // Add button event
    addTodoButton.addEventListener('click', addTodo);

    // Enter key event
    todoInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addTodo();
        }
    });

    // Remove the empty-input message when typing
    todoInput.addEventListener('input', function() {
        if (todoInput.value.trim() !== '') {
            message.textContent = '';
        }
    });

    // Task filters
    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            currentFilter = button.dataset.filter;

            updateActiveFilter();
            renderTodos();
        });
    });

    function updateActiveFilter() {
        filterButtons.forEach(function(button) {
            button.classList.toggle(
                'active',
                button.dataset.filter === currentFilter
            );
        });
    }

    // Initial display
    updateActiveFilter();
    renderTodos();

});
