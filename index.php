<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Advanced Todo List</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css?v=2">
</head>
<body>
    <div class="main-container">
        <div class="content-wrapper">
            <!-- Header -->
            <div class="header">
                <h1><i class="fas fa-check-circle"></i> Todo List</h1>
                <button class="theme-toggle" onclick="toggleTheme()" title="Toggle dark mode">
                    <i class="fas fa-moon"></i>
                </button>
            </div>

            <!-- Tabs -->
            <ul class="nav-tabs" role="tablist">
                <li class="nav-item">
                    <button class="nav-link active" data-tab="tasks-tab">Tasks</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-tab="calendar-tab">Calendar</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-tab="board-tab">Board</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-tab="timer-tab">Timer</button>
                </li>
            </ul>

            <!-- Tab Content -->
            <div class="tab-content">
                <!-- Tasks Tab -->
                <div class="tab-pane active" id="tasks-tab">
                    <div class="input-section">
                        <div class="input-group">
                            <input type="text" id="todoInput" class="form-control" placeholder="What needs to be done?">
                            <input type="date" id="dueDateInput" class="form-control">
                            <select id="prioritySelect" class="form-select">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                            </select>
                            <button class="btn-add" onclick="addTodo()">Add Task</button>
                        </div>
                    </div>

                    <!-- Filter Info -->
                    <div id="filterInfo" style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px; border-left: 3px solid var(--accent); display: none;">
                        <span id="filterText" style="color: var(--text-primary);"></span>
                        <button class="btn-primary" style="margin-left: 1rem; padding: 0.4rem 0.75rem; font-size: 0.85rem;" onclick="clearFilter()">Clear Filter</button>
                    </div>

                    <div id="todosList"></div>
                    <div id="emptyMessage" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No tasks yet. Add one to get started!</p>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card" onclick="filterByStatus('all')" style="cursor: pointer;">
                            <div class="stat-value" id="totalCount">0</div>
                            <div class="stat-label">All Tasks</div>
                        </div>
                        <div class="stat-card" onclick="filterByStatus('completed')" style="cursor: pointer;">
                            <div class="stat-value" id="completedCount">0</div>
                            <div class="stat-label">Finished</div>
                        </div>
                        <div class="stat-card" onclick="filterByStatus('pending')" style="cursor: pointer;">
                            <div class="stat-value" id="pendingCount">0</div>
                            <div class="stat-label">To Do</div>
                        </div>
                        <div class="stat-card" onclick="filterByStatus('overdue')" style="cursor: pointer;">
                            <div class="stat-value" id="overdueCount">0</div>
                            <div class="stat-label">Overdue</div>
                        </div>
                    </div>
                </div>

                <!-- Calendar Tab -->
                <div class="tab-pane" id="calendar-tab">
                    <div class="calendar">
                        <div class="calendar-header">
                            <button class="btn-nav" onclick="previousMonth()">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <span id="monthYear"></span>
                            <button class="btn-nav" onclick="nextMonth()">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                        <div class="calendar-weekdays">
                            <div class="weekday">Sun</div>
                            <div class="weekday">Mon</div>
                            <div class="weekday">Tue</div>
                            <div class="weekday">Wed</div>
                            <div class="weekday">Thu</div>
                            <div class="weekday">Fri</div>
                            <div class="weekday">Sat</div>
                        </div>
                        <div class="calendar-days" id="calendarDays"></div>
                    </div>
                    <h2>Tasks for <span id="selectedDateDisplay">Today</span></h2>
                    <div id="calendarTasksList"></div>
                </div>

                <!-- Board Tab -->
                <div class="tab-pane" id="board-tab">
                    <div class="kanban-board">
                        <div class="kanban-column">
                            <div class="kanban-title">📋 To Do</div>
                            <div class="kanban-tasks" id="kanban-backlog" ondrop="handleKanbanDrop(event)" ondragover="handleDragOver(event)"></div>
                        </div>
                        <div class="kanban-column">
                            <div class="kanban-title">⏳ Working</div>
                            <div class="kanban-tasks" id="kanban-inprogress" ondrop="handleKanbanDrop(event)" ondragover="handleDragOver(event)"></div>
                        </div>
                        <div class="kanban-column">
                            <div class="kanban-title">✅ Finished</div>
                            <div class="kanban-tasks" id="kanban-done" ondrop="handleKanbanDrop(event)" ondragover="handleDragOver(event)"></div>
                        </div>
                    </div>
                </div>

                <!-- Timer Tab -->
                <div class="tab-pane" id="timer-tab">
                    <div class="timer-display">
                        <div class="timer-circle">
                            <span id="timerDisplay">25:00</span>
                        </div>
                        <div class="timer-status">
                            <span id="timerStatus">Focus Time - Get work done!</span>
                        </div>
                        <div class="timer-controls">
                            <button class="btn-primary" id="startBtn" onclick="startTimer()">
                                <i class="fas fa-play"></i> Start
                            </button>
                            <button class="btn-warning" id="pauseBtn" onclick="pauseTimer()" style="display:none;">
                                <i class="fas fa-pause"></i> Pause
                            </button>
                            <button class="btn-danger" onclick="resetTimer()">
                                <i class="fas fa-redo"></i> Reset
                            </button>
                        </div>
                    </div>

                    <div class="input-section">
                        <label>Timer Settings</label>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-end;">
                            <div style="flex: 1; min-width: 150px;">
                                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">Focus Minutes</label>
                                <input type="number" id="focusMinutes" class="form-control" value="25" min="1" max="120">
                            </div>
                            <div style="flex: 1; min-width: 150px;">
                                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">Rest Minutes</label>
                                <input type="number" id="restMinutes" class="form-control" value="5" min="1" max="60">
                            </div>
                        </div>
                    </div>

                    <div class="input-section">
                        <label>Task Details</label>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 200px;">
                                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">Task Name</label>
                                <input type="text" id="timerTaskInput" class="form-control" placeholder="What are you working on?">
                            </div>
                            <div style="flex: 1; min-width: 200px;">
                                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">Target Date</label>
                                <input type="date" id="timerDateInput" class="form-control">
                            </div>
                        </div>
                    </div>

                    <div id="pomodoroStats" class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value" id="sessionsCount">0</div>
                            <div class="stat-label">Sessions Done</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="totalMinutes">0</div>
                            <div class="stat-label">Minutes Focused</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <div id="confirmModal" class="modal-overlay" style="display: none;">
        <div class="modal">
            <p>Are you sure you're done with this task?</p>
            <div class="modal-actions">
                <button class="btn-danger" onclick="cancelConfirm()">Cancel</button>
                <button class="btn-primary" onclick="confirmDone()">Confirm</button>
            </div>
        </div>
    </div>

    <script src="js/app.js?v=2"></script>
</body>
</html>
