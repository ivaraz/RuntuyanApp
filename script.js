document.addEventListener("DOMContentLoaded", () => {
  // --- Get DOM Elements ---
  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("task-list");
  const dateWidget = document.getElementById("date-widget");
  const totalTasksEl = document.getElementById("total-tasks");
  const pendingTasksEl = document.getElementById("pending-tasks");
  const completedTasksEl = document.getElementById("completed-tasks");
  const progressBar = document.getElementById("progress-bar");
  const filterAllBtn = document.getElementById("filter-all");
  const filterActiveBtn = document.getElementById("filter-active");
  const filterCompletedBtn = document.getElementById("filter-completed");
  const clearCompletedBtn = document.getElementById("clear-completed-btn");

  // --- State Management ---
  let editIndex = null;
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let currentFilter = "all";

  // --- Core Functions ---
  const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  const render = () => {
    renderTasks();
    updateDashboard();
  };

  const renderTasks = () => {
    taskList.innerHTML = "";
    const tasksToRender = tasks.filter((task) => {
      if (currentFilter === "active") return !task.completed;
      if (currentFilter === "completed") return task.completed;
      return true;
    });

    if (tasksToRender.length === 0) {
      let message = "Your task list is empty!";
      if (tasks.length > 0)
        message = `No tasks in the "${currentFilter}" view.`;
      taskList.innerHTML = `<p style="text-align:center; color:#888;">${message}</p>`;
      return;
    }

    tasksToRender.forEach((task) => {
      const originalIndex = tasks.findIndex(
        (t) => t.createdAt === task.createdAt
      );
      const taskItem = document.createElement("li");
      taskItem.className = `task-item ${task.completed ? "completed" : ""}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.addEventListener("change", () =>
        toggleTaskCompleted(originalIndex)
      );

      // NEW: Container for text and timestamp
      const taskDetails = document.createElement("div");
      taskDetails.className = "task-details";
      taskDetails.addEventListener("click", () =>
        toggleTaskCompleted(originalIndex)
      );

      const taskText = document.createElement("span");
      taskText.className = "task-text";
      taskText.textContent = task.text;

      // NEW: Create and format the timestamp
      const taskTimestamp = document.createElement("span");
      taskTimestamp.className = "task-timestamp";
      const date = new Date(task.createdAt);
      const dateOptions = { weekday: "long", month: "long", day: "numeric" };
      const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };
      taskTimestamp.textContent = `${date.toLocaleDateString(
        "en-US",
        dateOptions
      )}, ${date.toLocaleTimeString("en-US", timeOptions)}`;

      taskDetails.appendChild(taskText);
      taskDetails.appendChild(taskTimestamp); // Add timestamp to details div

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "actions";
      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.innerHTML = '<i class="fas fa-pen-to-square"></i>';
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent li click event
        setupEditTask(originalIndex);
      });
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTask(originalIndex);
      });

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);
      taskItem.appendChild(checkbox);
      taskItem.appendChild(taskDetails); // Use the new details container
      taskItem.appendChild(actionsDiv);
      taskList.appendChild(taskItem);
    });
  };

  // --- Dashboard Logic ---
  const updateDashboard = () => {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    if (dateWidget)
      dateWidget.textContent = now.toLocaleDateString("en-US", options);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    totalTasksEl.textContent = totalTasks;
    pendingTasksEl.textContent = totalTasks - completedTasks;
    completedTasksEl.textContent = completedTasks;
    const progressPercentage =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    progressBar.style.width = `${progressPercentage}%`;
  };

  // --- Task Manipulation ---
  const handleAddOrUpdate = () => {
    // NEW: Convert text to uppercase
    const text = taskInput.value.trim().toUpperCase();
    if (text === "") return;

    if (editIndex !== null) {
      tasks[editIndex].text = text;
    } else {
      // NEW: Add createdAt property with a unique timestamp
      tasks.push({
        text,
        completed: false,
        createdAt: new Date().toISOString(),
      });
    }
    saveTasks();
    resetFormState();
    render();
  };

  const setupEditTask = (index) => {
    editIndex = index;
    taskInput.value = tasks[index].text; // Will show as uppercase
    taskInput.focus();
    addTaskBtn.querySelector("i").className = "fas fa-check";
    addTaskBtn.classList.add("update-mode");
    addTaskBtn.setAttribute("aria-label", "Update task");
  };

  const resetFormState = () => {
    editIndex = null;
    taskInput.value = "";
    addTaskBtn.querySelector("i").className = "fas fa-plus";
    addTaskBtn.classList.remove("update-mode");
    addTaskBtn.setAttribute("aria-label", "Add task");
  };

  const toggleTaskCompleted = (index) => {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    render();
  };

  const deleteTask = (index) => {
    if (editIndex === index) resetFormState();
    tasks.splice(index, 1);
    saveTasks();
    render();
  };

  const clearCompleted = () => {
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    render();
  };

  // --- Event Listeners ---
  addTaskBtn.addEventListener("click", handleAddOrUpdate);
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleAddOrUpdate();
  });

  const setFilter = (filter) => {
    currentFilter = filter;
    document
      .querySelectorAll(".filter-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.getElementById(`filter-${filter}`).classList.add("active");
    renderTasks();
  };
  filterAllBtn.addEventListener("click", () => setFilter("all"));
  filterActiveBtn.addEventListener("click", () => setFilter("active"));
  filterCompletedBtn.addEventListener("click", () => setFilter("completed"));
  clearCompletedBtn.addEventListener("click", clearCompleted);

  // --- Initial Load ---
  render();
});
