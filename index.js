const taskForm=document.getElementById("taskForm");
const taskInput=document.getElementById("taskInput");
const categoryInput=document.getElementById("categoryInput");
const priorityInput=document.getElementById("priorityInput");
const dueDateInput=document.getElementById("dueDateInput");
const searchInput=document.getElementById("searchInput");
const taskList=document.getElementById("taskList");
const emptyMessage=document.getElementById("emptyMessage");
const errorMessage=document.getElementById("errorMessage");
const totalTasks=document.getElementById("totalTasks");
const pendingTasks=document.getElementById("pendingTasks");
const completedTasks=document.getElementById("completedTasks");
const filterButtons=document.querySelectorAll(".filter-btn");
const themeToggle=document.getElementById("themeToggle");

let tasks=[];
let currentFilter="all";

const savedTasksData=localStorage.getItem("tasks");
if(savedTasksData)
{
    tasks=JSON.parse(savedTasksData);
}
function savedTasks()
{
    localStorage.setItem("tasks",JSON.stringify(tasks));
}

taskForm.addEventListener("submit",function(event){
    event.preventDefault();
    const title=taskInput.value.trim();
    if(title==="")
    {
        errorMessage.textContent="Please enter a task."
        return;
    }
    errorMessage.textContent="";
    const newTask={
        id:Date.now(),
        title:title,
        completed:false,
        category:categoryInput.value,
        priority:priorityInput.value,
        dueDate:dueDateInput.value
    };

    tasks.push(newTask);
    savedTasks();

    taskInput.value="";
    categoryInput.value="Personal";
    priorityInput.value="Medium";
    dueDateInput.value="";

    renderTasks();
});

function renderTasks()
{
    taskList.innerHTML="";
    const searchText=searchInput.value.trim().toLowerCase();

    let filteredTasks=tasks.filter(function(task)
    {
        const matchesSearch=task.title.toLowerCase().includes(searchText);

        let matchesFilter=true;

        if(currentFilter==="pending")
        {
            matchesFilter=!task.completed;
        }
        if(currentFilter==="completed")
        {
            matchesFilter=task.completed;
        }
        return matchesSearch && matchesFilter;
    });
    if(filteredTasks.length===0)
    {
        emptyMessage.style.display="block";
    }
    else
    {
        emptyMessage.style.display="none";
    }
    filteredTasks.forEach(function(task)
    {
        const taskElement=document.createElement("article");
        taskElement.classList.add("task");
        if(task.completed)
        {
            taskElement.classList.add("completed");
        }
        let dueDateHtml="";
        if(task.dueDate)
        {
            const date=new Date(task.dueDate+"T00:00:00");
            const formattedDate=date.toLocaleDateString(
                "en-IN",
                {
                    day:"numeric",
                    month:"short",
                    year:"numeric"
                }
            );
            dueDateHtml=`<span class="badge">Due:${formattedDate}</span>`;
        }
        taskElement.innerHTML=`<input type="checkbox" class="task-checkbox" ${task.completed?"checked":""}>
        <div class="task-content">
            <div class="task-title">${escapeHTML(task.title)}</div>
            <div class="task-details">
                <span class="badge">${escapeHTML(task.category)}</span>
                <span class="badge priority-${task.priority.toLowerCase()}">${escapeHTML(task.priority)}</span>
                ${dueDateHtml}
            </div>
        </div>
        <div class="task-actions">
            <button class="edit-btn" type="button">Edit</button>
            <button class="delete-btn" type="button">Delete</button>
        </div>`;
        const checkBox=taskElement.querySelector(".task-checkbox");
        checkBox.addEventListener("change",()=>
        {
            toggleTask(task.id);
        });
        const editButton=taskElement.querySelector(".edit-btn");
        editButton.addEventListener("click",()=>
        {
            editTask(task.id);
        });
        const deleteButton=taskElement.querySelector(".delete-btn");
        deleteButton.addEventListener("click",()=>
        {
            deleteTask(task.id);
        });
        taskList.appendChild(taskElement);
    });
    updateStatistics();
}
function toggleTask(id)
{
    const task=tasks.find(function(task)
    {
        return task.id===id;
    });
    if(!task)
    {
        return;
    }
    task.completed=!task.completed;
    savedTasks();
    renderTasks();
}
function deleteTask(id)
{
    tasks=tasks.filter(function(task)
    {
        return task.id!==id;
    });
    savedTasks();
    renderTasks();
}
function editTask(id)
{
    const task=tasks.find(function(task)
    {
        return task.id===id;
    })
    if(!task)
    {
        return;
    }
    const newTitle=prompt("Edit your task:",task.title
    );
    if(newTitle===null)
    {
        return;
    }
    const updatedTitle=newTitle.trim();
    if(updatedTitle==="")
    {
        alert("Task can't be empty!");
        return;
    }
    task.title=updatedTitle;
    savedTasks();
    renderTasks();
}
function updateStatistics()
{
    const completed=tasks.filter(function(task)
    {
        return task.completed;
    }).length;
    const pending=tasks.filter(function(task)
    {
        return !task.completed;
    }).length;
    totalTasks.textContent=tasks.length;
    pendingTasks.textContent=pending;
    completedTasks.textContent=completed;
}

searchInput.addEventListener("input",()=>
{
    renderTasks();
});
filterButtons.forEach(function(button)
{
    button.addEventListener("click",function()
    {
        currentFilter=button.dataset.filter;
        filterButtons.forEach(function(btn)
        {
            btn.classList.remove("active");
        });
        button.classList.add("active");
        renderTasks();
    });
});
themeToggle.addEventListener("click",function()
{
    document.body.classList.toggle("dark");
    const darkMode=document.body.classList.contains("dark");
    themeToggle.textContent=darkMode?"Light Mode":"Dark Mode";
    localStorage.setItem("darkMode",darkMode);
});
const savedDarkMode=localStorage.getItem("darkMode");
if(savedDarkMode==="true")
{
    document.body.classList.add("dark");
    themeToggle.textContent="Light Mode";
}
function escapeHTML(text)
{
    const div=document.createElement("div");
    div.textContent=text;
    return div.innerHTML;
}
renderTasks();