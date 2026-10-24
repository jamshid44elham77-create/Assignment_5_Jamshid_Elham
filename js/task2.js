
"use strict";

const MAX_IN_PROGRESS = 3;

const tasks = [
    { id: 1, title: "Plan homepage", priority: "High", tag: "Design", completed: false, status: "todo" },
    { id: 2, title: "Choose colors", priority: "Medium", tag: "Design", completed: false, status: "todo" },
    { id: 3, title: "Create logo", priority: "Low", tag: "Design", completed: false, status: "todo" },
    { id: 4, title: "Build navigation", priority: "High", tag: "Development", completed: false, status: "todo" },
    { id: 5, title: "Create game", priority: "High", tag: "Development", completed: false, status: "inprogress" },
    { id: 6, title: "Build task cards", priority: "Medium", tag: "Development", completed: false, status: "inprogress" },
    { id: 7, title: "Test game buttons", priority: "Medium", tag: "Testing", completed: false, status: "done" },
    { id: 8, title: "Check mobile layout", priority: "High", tag: "Testing", completed: true, status: "done" },
    { id: 9, title: "Validate the form", priority: "High", tag: "Testing", completed: false, status: "todo" },
    { id: 10, title: "Write documentation", priority: "Low", tag: "Development", completed: false, status: "todo" }
];

const board = document.querySelector("#task-board");
const searchInput = document.querySelector("#task-search");
const tagFilter = document.querySelector("#tag-filter");
const prioritySort = document.querySelector("#priority-sort");
const boardMessage = document.querySelector("#board-message");
const progressBar = document.querySelector("#progress-bar");
const progressTrack = document.querySelector("#progress-track");
const progressText = document.querySelector("#progress-text");

const columns = [
    { id: "todo", title: "To Do" },
    { id: "inprogress", title: "In Progress" },
    { id: "done", title: "Done" }
];

function countCompleted() {
    let completedCount = 0;

    for (const task of tasks) {
        if (task.completed === true) {
            completedCount++;
        }
    }

    return completedCount;
}

function render() {
    board.replaceChildren();

    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedTag = tagFilter.value;
    const sortByPriority = prioritySort.value === "high";

    let visibleCount = 0;

    for (const column of columns) {
        const columnElement = document.createElement("section");
        columnElement.className = "kanban-column";
        columnElement.dataset.status = column.id;

        const heading = document.createElement("h3");
        heading.textContent = column.title;
        columnElement.append(heading);

        const columnTasks = tasks.filter(function (task) {
            const matchesSearch =
                task.title.toLowerCase().includes(searchTerm);

            const matchesTag =
                selectedTag === "all" || task.tag === selectedTag;

            return task.status === column.id &&
                matchesSearch && matchesTag;
        });

        if (sortByPriority) {
            const priorityOrder = { High: 3, Medium: 2, Low: 1 };

            columnTasks.sort(function (a, b) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
        }

        for (const task of columnTasks) {
            visibleCount++;

            const card = document.createElement("article");
            card.className = "task-card";

            const title = document.createElement("h4");
            title.textContent = task.title;

            const priority = document.createElement("p");
            priority.textContent = `Priority: ${task.priority}`;

            const tag = document.createElement("p");
            tag.className = "task-tag";
            tag.textContent = `Tag: ${task.tag}`;

            const status = document.createElement("p");
            status.textContent = task.completed ? "Completed" : "Not completed";

            card.append(title, priority, tag, status);

            if (task.status !== "todo") {
                card.append(createMoveButton(task, "todo", "Move to To Do"));
            }

            if (task.status !== "inprogress") {
                card.append(
                    createMoveButton(task, "inprogress", "Move to In Progress")
                );
            }

            if (task.status !== "done") {
                card.append(createMoveButton(task, "done", "Move to Done"));
            }

            columnElement.append(card);
        }

        if (columnTasks.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent = "No matching tasks in this column.";
            columnElement.append(emptyMessage);
        }

        board.append(columnElement);
    }

    if (visibleCount === 0) {
        boardMessage.textContent = "No tasks found. Try another search or filter.";
    } else {
        boardMessage.textContent = "";
    }

    const completedCount = countCompleted();
    const percentage = Math.round((completedCount / tasks.length) * 100);

   progressBar.className = `progress-bar progress-${percentage}`;
    progressTrack.setAttribute("aria-valuenow", percentage);
    progressText.textContent =
        `${completedCount} of ${tasks.length} tasks completed (${percentage}%).`;
}

function createMoveButton(task, newStatus, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.dataset.taskId = task.id;
    button.dataset.newStatus = newStatus;
    return button;
}

// One listener handles buttons for every task.

board.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-task-id]");

    if (button === null || !board.contains(button)) {
        return;
    }

    const taskId = Number(button.dataset.taskId);
    const newStatus = button.dataset.newStatus;
    const task = tasks.find(function (item) {
        return item.id === taskId;
    });

    if (task === undefined) {
        boardMessage.textContent = "Task not found.";
        return;
    }

    if (!columns.some(function (column) {
        return column.id === newStatus;
    })) {
        boardMessage.textContent = "Invalid destination.";
        return;
    }

    let inProgressCount = 0;

    for (const item of tasks) {
        if (item.status === "inprogress") {
            inProgressCount++;
        }
    }

    if (newStatus === "inprogress" &&
        task.status !== "inprogress" &&
        inProgressCount >= MAX_IN_PROGRESS) {
        boardMessage.textContent =
            "Move blocked: In Progress can contain at most 3 tasks.";
        boardMessage.className = "message error";
        return;
    }

    task.status = newStatus;
    task.completed = newStatus === "done";

    boardMessage.textContent = "Task moved successfully.";
    boardMessage.className = "message success";

    render();
});

searchInput.addEventListener("input", render);
tagFilter.addEventListener("change", render);
prioritySort.addEventListener("change", render);

render();
