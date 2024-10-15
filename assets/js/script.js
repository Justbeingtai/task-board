// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  localStorage.setItem("nextId", nextId + 1);
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  const columnId = task.status === 'to-do' ? 'todo-cards' : 
                   task.status === 'in-progress' ? 'in-progress-cards' : 
                   'done-cards';

  const cardHtml = `
    <div class="card task-card" data-id="${task.id}">
      <div class="card-body ${getTaskColor(task.dueDate)}">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text text-muted">Due: ${task.dueDate}</p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `;

  // Append the card to the correct column
  console.log(`Appending to column: #${columnId}`); // Debugging
  $(`#${columnId}`).append(cardHtml);

  // Make the task card draggable
  $(".task-card").draggable({
    revert: "invalid",
    stack: ".task-card"
  });
}


// Function to get color for tasks based on deadline
function getTaskColor(dueDate) {
  const today = dayjs();
  const taskDate = dayjs(dueDate);

  if (taskDate.isBefore(today)) {
    return "red";
  } else if (taskDate.diff(today, "day") <= 3) {
    return "yellow";
  }
  return "";
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  console.log("Rendering tasks:", taskList); // Debugging

  $("#todo-cards, #in-progress-cards, #done-cards").empty(); // Clear previous tasks

  if (taskList.length > 0) {
    taskList.forEach(task => {
      createTaskCard(task);
    });
  }

  // Make the lanes droppable
  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();  // Prevent form from submitting

  const title = $("#task-title").val();
  const description = $("#task-desc").val();
  const dueDate = $("#task-due-date").val();

  console.log("Form Data:", { title, description, dueDate }); // Debugging

  // Check if all fields are filled
  if (title && description && dueDate) {
    const newTask = {
      id: generateTaskId(),
      title,
      description,
      dueDate,
      status: "to-do" // New tasks start in the "To Do" column
    };

    console.log("New Task to be added:", newTask); // Debugging

    // Save task to the list
    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));

    // Add the new task to the board
    createTaskCard(newTask);

    // Close the modal
    $("#formModal").modal("hide");

    // Clear form inputs after saving
    $("#task-title").val('');
    $("#task-desc").val('');
    $("#task-due-date").val('');

  } else {
    alert("Please fill in all fields");
  }
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest(".task-card").data("id");
  taskList = taskList.filter(task => task.id !== taskId);

  // Update localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));

  // Remove the task card from the DOM
  $(event.target).closest(".task-card").remove();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data("id");
  const newStatus = $(this).attr("id").replace("-cards", "");

  // Update task status in the task list
  const task = taskList.find(task => task.id === taskId);
  task.status = newStatus;

  // Update localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));

  // Move the task card to the new column
  $(this).append(ui.draggable);
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  // Initialize the date picker
  $("#task-due-date").datepicker();

  // Render the task list
  renderTaskList();

  // Event listener for saving a new task on form submit instead of button click
  $("form").on("submit", handleAddTask);

  // Event listener for deleting tasks
  $(document).on("click", ".delete-task", handleDeleteTask);
});
