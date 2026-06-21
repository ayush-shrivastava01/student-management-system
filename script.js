const addStudentBtn = document.getElementById("addStudentBtn");
const studentTable = document.getElementById("studentTable");
const searchStudent = document.getElementById("searchStudent");

const totalStudents = document.getElementById("totalStudents");
const presentCount = document.getElementById("presentCount");
const absentCount = document.getElementById("absentCount");
const attendancePercent = document.getElementById("attendancePercent");

const attendanceContainer = document.getElementById("attendanceContainer");
const activityList = document.getElementById("activityList");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

const themeBtn = document.getElementById("themeBtn");


let students = JSON.parse(localStorage.getItem("students")) || [];

function saveData() {
    localStorage.setItem("students", JSON.stringify(students));
}


const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".section");

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        navLinks.forEach(item =>
            item.classList.remove("active")
        );

        link.classList.add("active");

        const sectionId = link.dataset.section;

        sections.forEach(section => {
            section.classList.remove("active-section");
        });

        document
            .getElementById(sectionId)
            .classList.add("active-section");

    });

});


menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("show");
});


themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){
        themeBtn.textContent = "☀️";
    }else{
        themeBtn.textContent = "🌙";
    }

});


function addActivity(text){

    const li = document.createElement("li");

    li.textContent =
        `${new Date().toLocaleTimeString()} - ${text}`;

    activityList.prepend(li);

}


addStudentBtn.addEventListener("click", () => {

    const name =
        document.getElementById("studentName").value.trim();

    const roll =
        document.getElementById("studentRoll").value.trim();

    const course =
        document.getElementById("studentCourse").value.trim();

    const photo =
        document.getElementById("studentPhoto").files[0];

    if(!name || !roll || !course){

        alert("Please fill all fields");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e){

        const student = {

            id: Date.now(),

            name,

            roll,

            course,

            photo: photo
                ? e.target.result
                : "https://via.placeholder.com/60",

            attendance: "Not Marked"

        };

        students.push(student);

        saveData();

        renderStudents();

        updateDashboard();

        addActivity(`Student Added: ${name}`);

        document.getElementById("studentName").value = "";
        document.getElementById("studentRoll").value = "";
        document.getElementById("studentCourse").value = "";
        document.getElementById("studentPhoto").value = "";

    };

    if(photo){
        reader.readAsDataURL(photo);
    }else{
        reader.onload({
            target:{
                result:"https://via.placeholder.com/60"
            }
        });
    }

});


function renderStudents(){

    studentTable.innerHTML = "";

    students.forEach(student => {

        studentTable.innerHTML += `

        <tr>

            <td>
                <img src="${student.photo}"
                class="student-photo">
            </td>

            <td>${student.name}</td>

            <td>${student.roll}</td>

            <td>${student.course}</td>

            <td>${student.attendance}</td>

            <td>

                <button
                class="action-btn present-btn"
                onclick="markAttendance(${student.id},'Present')">
                Present
                </button>

                <button
                class="action-btn absent-btn"
                onclick="markAttendance(${student.id},'Absent')">
                Absent
                </button>

                <button
                class="action-btn edit-btn"
                onclick="editStudent(${student.id})">
                Edit
                </button>

                <button
                class="action-btn delete-btn"
                onclick="deleteStudent(${student.id})">
                Delete
                </button>

            </td>

        </tr>

        `;

    });

    renderAttendancePage();

}


function deleteStudent(id){

    if(!confirm("Delete Student?")){
        return;
    }

    students = students.filter(
        student => student.id !== id
    );

    saveData();

    renderStudents();

    updateDashboard();

    addActivity("Student Deleted");

}



function editStudent(id){

    const student =
        students.find(s => s.id === id);

    const newName =
        prompt("Enter Name", student.name);

    if(newName){

        student.name = newName;

        saveData();

        renderStudents();

        addActivity("Student Updated");

    }

}


searchStudent.addEventListener("keyup", () => {

    const value =
        searchStudent.value.toLowerCase();

    const rows =
        studentTable.querySelectorAll("tr");

    rows.forEach(row => {

        const text =
            row.textContent.toLowerCase();

        row.style.display =
            text.includes(value)
            ? ""
            : "none";

    });

});


function markAttendance(id,status){

    const student =
        students.find(s => s.id === id);

    student.attendance = status;

    saveData();

    renderStudents();

    updateDashboard();

    addActivity(
        `${student.name} marked ${status}`
    );

}

function renderAttendancePage(){

    attendanceContainer.innerHTML = "";

    students.forEach(student => {

        attendanceContainer.innerHTML += `

        <div class="attendance-card">

            <div>

                <strong>${student.name}</strong>

                <p>${student.roll}</p>

            </div>

            <div>

                <span>
                    ${student.attendance}
                </span>

            </div>

        </div>

        `;

    });

}


function updateDashboard(){

    totalStudents.textContent =
        students.length;

    const present =
        students.filter(
            s => s.attendance === "Present"
        ).length;

    const absent =
        students.filter(
            s => s.attendance === "Absent"
        ).length;

    presentCount.textContent = present;

    absentCount.textContent = absent;

    let percentage = 0;

    if(students.length > 0){

        percentage =
            Math.round(
                (present / students.length) * 100
            );

    }

    attendancePercent.textContent =
        percentage + "%";

    updateChart(present, absent);
    updateReportChart(present, absent);

}



let dashboardChart;
let reportChart;

function updateChart(present, absent){

    const ctx =
        document
        .getElementById("attendanceChart");

    if(dashboardChart){
        dashboardChart.destroy();
    }

    dashboardChart = new Chart(ctx,{

        type:"doughnut",

        data:{

            labels:["Present","Absent"],

            datasets:[{

                data:[present, absent],

                backgroundColor:[
                    "#22c55e",
                    "#ef4444"
                ]

            }]

        }

    });

}

function updateReportChart(present, absent){

    const ctx =
        document
        .getElementById("reportChart");

    if(reportChart){
        reportChart.destroy();
    }

    reportChart = new Chart(ctx,{

        type:"bar",

        data:{

            labels:["Present","Absent"],

            datasets:[{

                label:"Students",

                data:[present, absent],

                backgroundColor:[
                    "#3b82f6",
                    "#f59e0b"
                ]

            }]

        }

    });

}


renderStudents();
updateDashboard();