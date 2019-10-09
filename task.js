class Company {
    constructor() {
        this.CEO = new CEO();
        this.testDepartment = new Department();
        this.webDepartment = new Department();
        this.mobDepartment = new Department();
    }

}

class Department {
    constructor() {
        this.projects = [];
        this.employeesBusy = [];
        this.employeesFree = [];
    }

    set projects(project) {

        const pushEmployee = function (duration) {
            const lastEmployee = this.employeesFree[this.employeesFree.length - 1];
            this.projects.push(project);
            lastEmployee.freeForDays = 0;
            lastEmployee.willBeBusyForDays = duration;
            this.employeesBusy.push(this.employeesFree.pop())
        }

        switch (project.type) {
            case 'web':
            case 'test':
                if (this.employeesFree.length > 0) {
                    pushEmployee(project.complexity);
                }
                break;
            case 'mob':
                if (this.employeesFree.length >= project.complexity) {
                    pushEmployee(project.complexity);
                }
                break;
        }

    }

    set employeesFree() {
        this.employeesFree.push(new Employee());
    }

}

class CEO {
    constructor() {
        this.projects = [];
        this.projectsForTest = [];
    }

    set projects() {
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        let projectsQuantity = getRandomInt(0, 4);
        let projectComplexity = getRandomInt(1, 3);
        let projectType = getRandomInt(1, 2);
        for (let i = 1; i <= projectsQuantity; i++) {
            this.projects.push(new Project(projectType, projectComplexity))
        }
    }
}

CEO.prototype.hire = function () {
    let necessaryDevelopers = 0;
    let necessaryTesters = this.projectsForTest.length;
    let currentProject = this.projects[i];
    for (let i = 0; i < this.projects.length; i++) {
        switch (currentProject.type) {
            case 'web':
                necessaryDevelopers += 1;
                break;
            case 'mob':
                necessaryDevelopers += currentProject.complexity;
                break;

        }
    }
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
        this.willBeBusyForDays = 0;
        this.freeForDays = 0;
    }
}

class WorkPeriod {
    constructor(days) {
        this.duration = days;
    }
}

WorkPeriod.prototype.startPeriod = function() {
    for (let i = 1; i <= this.duration; i++) {
        this.newDayHasCome();
        this.workdayIsOver();
    }
}

WorkPeriod.prototype.newDayHasCome = function() {

}

WorkPeriod.prototype.workdayIsOver = function() {

}