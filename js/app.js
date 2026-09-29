// ========== STATE & DATA ==========
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentDate = new Date();
let selectedDate = new Date();
let timerInterval = null;
let timeLeft = 25 * 60;
let isRunning = false;
let isWorkTime = true;
let pomodoroStats = JSON.parse(localStorage.getItem('pomodoroStats')) || { sessions: 0, totalMinutes: 0 };
let draggedTodoId = null;
let currentFilter = 'all';

// Load theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// ========== THEME TOGGLE ==========
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ========== TAB NAVIGATION ==========
document.querySelectorAll('.nav-link').forEach(button => {
    button.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-pane').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Mark button as active
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Re-render if needed
    if (tabName === 'calendar-tab') {
        renderCalendar();
    } else if (tabName === 'board-tab') {
        renderKanban();
    }
}

// ========== FILTERING ==========
function filterByStatus(status) {
    currentFilter = status;
    showFilterInfo(status);
    renderTodos();
}

function clearFilter() {
    currentFilter = 'all';
    document.getElementById('filterInfo').style.display = 'none';
    renderTodos();
}

function showFilterInfo(status) {
    const filterInfo = document.getElementById('filterInfo');
    const filterText = document.getElementById('filterText');
    
    const filterLabels = {
        'all': 'Showing all tasks',
        'completed': 'Showing finished tasks only',
        'pending': 'Showing to-do tasks only',
        'overdue': 'Showing overdue tasks only'
    };

    filterText.textContent = filterLabels[status];
    filterInfo.style.display = 'block';
}

function getFilteredTodos() {
    const today = new Date().toISOString().split('T')[0];
    
    switch(currentFilter) {
        case 'completed':
            return todos.filter(t => t.completed);
        case 'pending':
            return todos.filter(t => !t.completed);
        case 'overdue':
            return todos.filter(t => !t.completed && t.dueDate && t.dueDate < today);
        default:
            return todos;
    }
}

// ========== TODO MANAGEMENT ==========
function addTodo() {
    const input = document.getElementById('todoInput');
    const dueDate = document.getElementById('dueDateInput').value;
    const priority = document.getElementById('prioritySelect').value;
    const text = input.value.trim();

    if (!text) {
        alert('Please enter a task');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        priority: priority,
        completed: false,
        dueDate: dueDate,
        subtasks: [],
        status: 'backlog',
        createdAt: new Date().toISOString()
    };

    todos.push(todo);
    saveTodos();
    input.value = '';
    document.getElementById('dueDateInput').value = '';
    renderTodos();
    renderKanban();
    renderCalendar();
}

let pendingConfirmId = null;

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    if (!todo.completed) {
        // Show confirmation modal before marking as done
        pendingConfirmId = id;
        document.getElementById('confirmModal').style.display = 'flex';
    } else {
        // Uncheck - move back to backlog
        todo.completed = false;
        todo.status = 'backlog';
        saveTodos();
        renderTodos();
        renderKanban();
    }
}

function confirmDone() {
    if (pendingConfirmId) {
        const todo = todos.find(t => t.id === pendingConfirmId);
        if (todo) {
            todo.completed = true;
            todo.status = 'done';
            saveTodos();
            renderTodos();
            renderKanban();
        }
    }
    pendingConfirmId = null;
    document.getElementById('confirmModal').style.display = 'none';
}

function cancelConfirm() {
    pendingConfirmId = null;
    document.getElementById('confirmModal').style.display = 'none';
    // Re-render to reset the checkbox visual state
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
    renderKanban();
    renderCalendar();
}

function addSubtask(parentId) {
    const input = document.getElementById(`subtask-input-${parentId}`);
    if (!input) return;
    
    const text = input.value.trim();
    if (!text) return;

    const parent = todos.find(t => t.id === parentId);
    if (parent) {
        parent.subtasks.push({
            id: Date.now(),
            text: text,
            completed: false
        });
        saveTodos();
        renderTodos();
        input.value = '';
    }
}

function toggleSubtask(parentId, subtaskId) {
    const parent = todos.find(t => t.id === parentId);
    if (parent) {
        const subtask = parent.subtasks.find(s => s.id === subtaskId);
        if (subtask) subtask.completed = !subtask.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteSubtask(parentId, subtaskId) {
    const parent = todos.find(t => t.id === parentId);
    if (parent) {
        parent.subtasks = parent.subtasks.filter(s => s.id !== subtaskId);
        saveTodos();
        renderTodos();
    }
}

// ========== RENDERING TODOS ==========
function renderTodos() {
    const list = document.getElementById('todosList');
    const empty = document.getElementById('emptyMessage');
    const completed = todos.filter(t => t.completed).length;
    const pending = todos.filter(t => !t.completed).length;
    const today = new Date().toISOString().split('T')[0];
    const overdue = todos.filter(t => !t.completed && t.dueDate && t.dueDate < today).length;

    document.getElementById('totalCount').textContent = todos.length;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('overdueCount').textContent = overdue;

    // Only show pending tasks in the main list
    const filteredTodos = getFilteredTodos().filter(t => !t.completed);
    list.innerHTML = '';

    if (filteredTodos.length === 0) {
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';

    filteredTodos.forEach(todo => {
        const dueDateStr = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '';
        const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
        const completedSubtasks = todo.subtasks.filter(s => s.completed).length;

        const item = document.createElement('div');
        item.className = 'todo-item';
        item.draggable = true;
        item.id = `todo-${todo.id}`;
        item.ondragstart = () => draggedTodoId = todo.id;
        item.ondragend = () => draggedTodoId = null;

        item.innerHTML = `
            <div class="todo-header">
                <input type="checkbox" onchange="toggleTodo(${todo.id})" style="width: 22px; height: 22px; cursor: pointer; accent-color: var(--accent);">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <div class="todo-badges">
                    <span class="badge priority-${todo.priority}">${todo.priority}</span>
                    ${dueDateStr ? `<span class="badge" style="background: rgba(14, 165, 233, 0.1); color: #0284c7;">${dueDateStr}</span>` : ''}
                    ${isOverdue ? `<span class="badge" style="background: rgba(239, 68, 68, 0.1); color: #dc2626;">Overdue</span>` : ''}
                    ${todo.subtasks.length > 0 ? `<span class="badge" style="background: rgba(107, 114, 128, 0.1); color: #6b7280;">${completedSubtasks}/${todo.subtasks.length}</span>` : ''}
                </div>
            </div>

            ${todo.subtasks.length > 0 ? `
                <div class="subtasks-container">
                    ${todo.subtasks.map(st => `
                        <div class="subtask-item ${st.completed ? 'completed' : ''}">
                            <input type="checkbox" ${st.completed ? 'checked' : ''} onchange="toggleSubtask(${todo.id}, ${st.id})" style="width: 16px; height: 16px;">
                            <span class="subtask-text" style="flex-grow: 1;">${escapeHtml(st.text)}</span>
                            <button class="btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="deleteSubtask(${todo.id}, ${st.id})">Delete</button>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div class="add-subtask-form" id="subtask-form-${todo.id}">
                <input type="text" id="subtask-input-${todo.id}" class="form-control" placeholder="Add a subtask..." style="flex: 1;">
                <button class="btn-primary" style="padding: 0.5rem 0.75rem;" onclick="addSubtask(${todo.id})">+</button>
            </div>

            <div class="todo-actions">
                <button class="btn-danger" style="padding: 0.4rem 0.75rem; font-size: 0.85rem;" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        `;
        list.appendChild(item);
    });
}

// ========== KANBAN BOARD ==========
function renderKanban() {
    const columns = {
        'backlog': document.getElementById('kanban-backlog'),
        'inprogress': document.getElementById('kanban-inprogress'),
        'done': document.getElementById('kanban-done')
    };

    Object.keys(columns).forEach(status => {
        columns[status].innerHTML = '';
        const statusTodos = todos.filter(t => t.status === status);
        statusTodos.forEach(todo => {
            const card = document.createElement('div');
            card.className = `kanban-card ${status === 'inprogress' ? 'working' : ''}`;
            card.draggable = true;
            card.ondragstart = (e) => {
                draggedTodoId = todo.id;
                e.dataTransfer.effectAllowed = 'move';
            };
            const completedSubtasks = todo.subtasks.filter(s => s.completed).length;
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.5rem;">
                    <span class="todo-text" style="font-size: 0.95rem;">${escapeHtml(todo.text)}</span>
                    <span class="badge priority-${todo.priority}">${todo.priority}</span>
                </div>
                ${status === 'inprogress' ? '<small style="color: #f59e0b; font-weight: 600;">🔴 Working on this</small>' : ''}
                ${todo.subtasks.length > 0 ? `<small style="color: var(--text-tertiary);">${completedSubtasks}/${todo.subtasks.length} subtasks</small>` : ''}
            `;
            columns[status].appendChild(card);
        });
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleKanbanDrop(e) {
    e.preventDefault();
    if (!draggedTodoId) return;

    const todo = todos.find(t => t.id === draggedTodoId);
    const targetColumn = e.currentTarget.id;
    const statusMap = {
        'kanban-backlog': 'backlog',
        'kanban-inprogress': 'inprogress',
        'kanban-done': 'done'
    };

    if (todo && statusMap[targetColumn]) {
        todo.status = statusMap[targetColumn];
        if (todo.status === 'done') {
            todo.completed = true;
        } else if (todo.completed) {
            todo.completed = false;
        }
        saveTodos();
        renderKanban();
        renderTodos();
    }
}

// ========== CALENDAR ==========
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    document.getElementById('monthYear').textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = daysInPrevMonth - i;
        calendarDays.appendChild(day);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const tasksOnDate = todos.filter(t => t.dueDate === dateStr);
        const isToday = dateStr === new Date().toISOString().split('T')[0];

        const dayEl = document.createElement('div');
        dayEl.className = `calendar-day ${isToday ? 'today' : ''} ${tasksOnDate.length > 0 ? 'has-tasks' : ''}`;
        dayEl.innerHTML = `<span>${day}</span>`;
        if (tasksOnDate.length > 0) {
            dayEl.innerHTML += `<div class="task-box">${tasksOnDate.length}</div>`;
        }
        dayEl.onclick = () => selectDate(date);
        calendarDays.appendChild(dayEl);
    }

    // Next month days
    const totalCells = calendarDays.children.length;
    for (let day = 1; totalCells + day <= 42; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day other-month';
        dayEl.textContent = day;
        calendarDays.appendChild(dayEl);
    }
}

function selectDate(date) {
    selectedDate = date;
    renderCalendarTasks();
}

function renderCalendarTasks() {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const tasksForDate = todos.filter(t => t.dueDate === dateStr);
    const display = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    document.getElementById('selectedDateDisplay').textContent = display;
    const tasksList = document.getElementById('calendarTasksList');

    if (tasksForDate.length === 0) {
        tasksList.innerHTML = '<div class="empty-state"><p>No tasks scheduled for this date</p></div>';
        return;
    }

    tasksList.innerHTML = tasksForDate.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <div class="todo-header">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <span class="badge priority-${todo.priority}">${todo.priority}</span>
            </div>
        </div>
    `).join('');
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// ========== POMODORO TIMER ==========
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getFocusMinutes() {
    const val = parseInt(document.getElementById('focusMinutes')?.value);
    return (val && val > 0 && val <= 120) ? val : 25;
}

function getRestMinutes() {
    const val = parseInt(document.getElementById('restMinutes')?.value);
    return (val && val > 0 && val <= 60) ? val : 5;
}

function startTimer() {
    if (isRunning) return;
    
    // Create a todo from timer task input if provided
    const taskInput = document.getElementById('timerTaskInput');
    const dateInput = document.getElementById('timerDateInput');
    if (taskInput && taskInput.value.trim()) {
        const todo = {
            id: Date.now(),
            text: taskInput.value.trim(),
            priority: 'medium',
            completed: false,
            dueDate: dateInput ? dateInput.value : '',
            subtasks: [],
            status: 'inprogress',
            createdAt: new Date().toISOString()
        };
        todos.push(todo);
        saveTodos();
        renderTodos();
        renderKanban();
        renderCalendar();
        taskInput.value = '';
        if (dateInput) dateInput.value = '';
    }
    
    timeLeft = getFocusMinutes() * 60;
    document.getElementById('timerDisplay').textContent = formatTime(timeLeft);
    
    isRunning = true;
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'inline-block';

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timerDisplay').textContent = formatTime(timeLeft);

        if (timeLeft === 0) {
            completePomodoro();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('pauseBtn').style.display = 'none';
}

function resetTimer() {
    pauseTimer();
    isWorkTime = true;
    timeLeft = getFocusMinutes() * 60;
    document.getElementById('timerDisplay').textContent = formatTime(timeLeft);
    document.getElementById('timerStatus').textContent = 'Focus Time - Get work done!';
}

function completePomodoro() {
    clearInterval(timerInterval);
    isRunning = false;

    if (isWorkTime) {
        const mins = getFocusMinutes();
        pomodoroStats.sessions++;
        pomodoroStats.totalMinutes += mins;
        localStorage.setItem('pomodoroStats', JSON.stringify(pomodoroStats));
        document.getElementById('sessionsCount').textContent = pomodoroStats.sessions;
        document.getElementById('totalMinutes').textContent = pomodoroStats.totalMinutes;

        alert('Great work! Time to rest for ' + getRestMinutes() + ' minutes.');
        isWorkTime = false;
        timeLeft = getRestMinutes() * 60;
        document.getElementById('timerStatus').textContent = 'Rest Time - Take a break!';
    } else {
        alert('Rest done! Ready to work again?');
        isWorkTime = true;
        timeLeft = getFocusMinutes() * 60;
        document.getElementById('timerStatus').textContent = 'Focus Time - Get work done!';
    }

    document.getElementById('timerDisplay').textContent = formatTime(timeLeft);
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('pauseBtn').style.display = 'none';
}

// ========== UTILITIES ==========
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.getElementById('todoInput') === document.activeElement) {
        addTodo();
    }
});

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    renderTodos();
    renderKanban();
    renderCalendar();
    renderCalendarTasks();
    document.getElementById('sessionsCount').textContent = pomodoroStats.sessions;
    document.getElementById('totalMinutes').textContent = pomodoroStats.totalMinutes;
});
