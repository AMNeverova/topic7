class Company {
    constructor() {
        this.testDepartment = new Department();
        this.webDepartment = new Department();
        this.mobDepartment = new Department();
    }

}

class Department {
    constructor() {
        this._employees= [];
    }

    set projects(project) {
        let freeEmployees = this._employees.filter(empl => empl.onProject == false)
        if (freeEmployees.length) {
            const pushEmployee = function (duration) {
                const lastEmployee = freeEmployees[freeEmployees.length - 1];
                this._projects.push(project);
                lastEmployee.freeForDays = 0;
                lastEmployee.willBeBusyForDays = duration;
                this._employeesBusy.push(this._employeesFree.pop())
            }

            switch (project.type) {
                case 'web':
                case 'test':
                    if (this._employeesFree.length > 0) {
                        pushEmployee(project.complexity);
                    }
                    break;
                case 'mob':
                    if (this._employeesFree.length >= project.complexity) {
                        pushEmployee(project.complexity);
                    }
                    break;
            }
        }
    }


    set employees(number) {
        for (let i = 1; i <= number; i++) {
            this._employeesFree.push(new Employee());
        }
    }

}

class CEO {
    constructor() {
        this.projectsForWeb = [];
        this.projectsForMob = [];
        this.projectsForTest = [];
        this.company = new Company();
    }

    receiveProjects() {
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        let projectsQuantity = getRandomInt(0, 4);
        let projectComplexity = getRandomInt(1, 3);
        let projectType = getRandomInt(1, 2);
        for (let i = 1; i <= projectsQuantity; i++) {
            let newProject = new Project(projectType, projectComplexity);
            newProject.type === 'web'? this.projectsForWeb.push(newProject) :
                                        this.projectsForMob.push(newProject);
        }
    }
}

CEO.prototype.hire = function () {
    let necessaryWeb = 0;
    let necessaryMob = 0;
    let necessaryTesters = this.projectsForTest.length;
    for (let i = 0; i < this.projects.length; i++) {
        let currentProject = this.projects[i];
        switch (currentProject.type) {
            case 'web':
                necessaryWeb += 1;
                break;
            case 'mob':
                necessaryMob += currentProject.complexity;
                break;

        }
    }
    this.company.testDepartment.employees = necessaryTesters;
    this.company.webDepartment.employees = necessaryWeb;
    this.company.mobDepartment.employees = necessaryMob;
}

CEO.prototype.fire = function () {
    let compare = function (a, b) {
        return a.projectsDone - b.projectsDone;
    }
    for (let dep of this.company) {
        dep._employeesFree.filter(emp => { emp.freeForDays > 3 })
            .sort(compare)
            .shift()
    }
}

CEO.prototype.handProjectsOver = function () {
    let passToDepartment = function (dep) {

        let freeDevs = this.company[`${dep}Department`]._employees.filter(empl => empl.onProject == false);
        let necessaryDevs = dep === 'mob' ? this.projectsForMob.map(proj => proj.complexity).reduce((acc, curr) => acc + curr) :
            this[`projectsFor${dep}`].length;

        if (!freeDevs.length) {
            return
        }
        switch (dep) {
            case 'test':
                freeDevs.map(dev => {
                    if (!dev.onProject) {
                        dev.onProject = true;
                        dev.projectDuration = 1;
                        dev.freeForDays = 0;
                    }
                });
                freeDevs >= necessaryDevs? 
                this.projectsForWeb.splice(0, necessaryDevs) : 
                this.projectsForWeb.splice(0, freeDevs);
                break;

            case 'web':
                freeDevs.map((empl, index) => {
                    if (!empl.onProject && this[`projectsFor${dep}`][index]) {
                        empl.onProject = true;
                        empl.freeForDays = 0;
                        empl.projectDuration = this[`projectsFor${dep}`][index].complexity;
                    }
                })
                freeDevs >= necessaryDevs? 
                this.projectsForWeb.splice(0, necessaryDevs) : 
                this.projectsForWeb.splice(0, freeDevs);
                break;
            case 'mob':
                let assignProject = function(num) {
                    const mobDep = this.company.mobDepartment._employees;
                    let ind = mobDep.findIndex(empl => empl.onProject == false);
                    mobDep[ind].onProject = true;
                    mobDep[ind].projectDuration = num;
                    mobDep[ind].freeForDays = 0;
                }

                this.projectsForMob.forEach(proj => {
                    if (freeDevs >= proj.complexity) {
                        for (let i = 1; i <= proj.complexity; i++) {
                            assignProject(proj.complexity)
                        }
                        this.projectsForMob.shift();
                    }
                })
        }
    }
    passToDepartment('mob');
    passToDepartment('web');
    passToDepartment('test');
}

class Project {
    constructor(type, complexity) {
        let types = ['web', 'mob'];
        this.type = types[type];
        this.complexity = complexity;
    }
}

class Employee {
    constructor() {
        this.projectsDone = 0;
        this.onProject = false;
        this.projectDuration = 0;
        this.freeForDays = 0;
    }
}

class WorkPeriod {
    constructor(days) {
        this.duration = days;
    }
}

WorkPeriod.prototype.startPeriod = function () {
    for (let i = 1; i <= this.duration; i++) {
        this.newDayHasCome();
        this.workdayIsOver();
    }
}

WorkPeriod.prototype.newDayHasCome = function () {

}

WorkPeriod.prototype.workdayIsOver = function () {

}