class Project {
    constructor(type, complexity, id) {
        let types = ['web', 'mob'];
        this.type = types[type];
        this.complexity = complexity;
        this.employees = [];
        this.daysToFinish = 0;
        this.id = id;
    }
}

class Employee {
    constructor(id) {
        this.projectsDone = 0;
        this.freeForDays = 0;
        this.id = id;
    }


}

class Company {
    constructor() {
        this.deps = {
            webDep: new WebDepartment(),
            mobDep: new MobDepartment(),
            testDep: new TestDepartment()
        }
        this.CEO = new CEO(this.deps);
    }

    workPeriod(duration) {
        for (let i = 1; i <= duration; i++) {
            this.newDayHasCome();
            this.workdayHasFinished();
            console.log(`day ${i} passed`)
        }
    }

    newDayHasCome() {
        this.CEO.handProjectOver();
        this.CEO.hire();
        this.CEO.receiveNewProjects();
        this.CEO.handProjectOver();
        this.CEO.fire();
    }

    workdayHasFinished() {
        for (let dep in this.deps) {
            this.deps[dep].freeEmployees.forEach(empl => empl.freeForDays++);
            this.deps[dep].projectsInProgress.forEach(proj => proj.daysToFinish--);
        }
        this.moveNewlyVacantEmployees();
        this.moveProjectsToTestDep();
    }

    moveNewlyVacantEmployees() {
        for (let dep in this.deps) {
            let developersGotFree = this.deps[dep].projectsInProgress
                .filter(proj => proj.daysToFinish == 0)
                .map(proj => proj.employees).flat();
            switch (dep) {
                case 'webDep':
                    for (let i = 0; i < developersGotFree.length; i++) {
                        let index = this.deps.webDep.busyEmployees.findIndex(empl => empl.id == developersGotFree[i]);
                        this.deps.webDep.freeEmployees.unshift(this.deps.webDep.busyEmployees[index]);
                        this.deps.webDep.freeEmployees[0].projectsDone++;
                        this.deps.webDep.busyEmployees.splice(index, 1);
                    }
                    break;
                case 'mobDep':
                    for (let i = 0; i < developersGotFree.length; i++) {
                        let index = this.deps.mobDep.busyEmployees.findIndex(empl => empl.id == developersGotFree[i]);
                        this.deps.mobDep.freeEmployees.unshift(this.deps.mobDep.busyEmployees[index]);
                        this.deps.mobDep.freeEmployees[0].projectsDone++;
                        this.deps.mobDep.busyEmployees.splice(index, 1);
                    }
                    break;
                case 'testDep':
                    this.CEO.report.addProjectDone(this.deps.testDep.length);
                    this.deps.testDep.projectsInProgress = [];
                    this.deps.testDep.busyEmployees.map(empl => {
                        this.deps.testDep.freeEmployees.unshift(empl);
                        this.deps.testDep.freeEmployees[0].projectsDone++;
                    })
            }
        }
    }

    moveProjectsToTestDep() {
        this.deps.webDep.projectsInProgress.sort((a, b) => a.daysToFinish - b.daysToFinish);
        this.deps.mobDep.projectsInProgress.sort((a, b) => a.daysToFinish - b.daysToFinish);
        if (this.deps.mobDep.length) {
            while (!this.deps.mobDep.projectsInProgress[0].daysToFinish) {
                this.CEO.projects.testProjects.unshift(this.deps.mobDep.projectsInProgress.shift());
                this.CEO.projects.testProjects[0].employees = [];
            }
            if (this.deps.webDep.length) {
                while (!this.deps.webDep.projectsInProgress[0].daysToFinish) {
                    this.CEO.projects.testProjects.unshift(this.deps.webDep.projectsInProgress.shift());
                    this.CEO.projects.testProjects[0].employees = [];
                }
            }
        }
    }
}

class Department {
    constructor() {
        this.freeEmployees = [];
        this.busyEmployees = [];
        this.projectsInProgress = [];
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    checkForFreeEmployees() {
        return this.freeEmployees.length > 0;
    }

    setFreeEmployees(num) {
        for (let i = 1; i <= num; i++) {
            this.freeEmployees.push(new Employee(this.getRandomInt(1000, 9999)));
        }
    }

}

class WebDepartment extends Department {
    constructor() {
        super()
    }

    assignProject(proj) {
        let firstFreeEmployee = this.freeEmployees[0];
        this.projectsInProgress.unshift(proj);
        this.projectsInProgress[0].employees.push(firstFreeEmployee.id)
        firstFreeEmployee.freeForDays = 0;
        this.projectsInProgress[0].daysToFinish = proj.complexity;
        this.busyEmployees.push(this.freeEmployees.shift());
    }
}

class MobDepartment extends Department {
    constructor() {
        super()
    }

    assignProject(proj) {
        const firstProj = this.projectsInProgress[0];
        const firstFreeEmpl = this.freeEmployees[0];
        if (this.freeEmployees.length >= proj.complexity) {
            for (let i = 1; i < proj.complexity; i++) {
                const currentEmpl = this.freeEmployees[i];
                currentEmpl.freeForDays = 0;
                this.projectsInProgress.unshift(proj);
                firstProj.employees.push(currentEmpl.id);
                firstProj.daysToFinish = 1;
                this.busyEmployees.push(currentEmpl);
            }
            this.freeEmployees.splice(0, proj.complexity)
        } else {
            firstFreeEmpl.freeForDays = 0;
            this.projectsInProgress.unshift(proj);
            firstProj.employees.push(firstFreeEmpl.id);
            firstProj.daysToFinish = proj.complexity;
            this.busyEmployees.push(firstFreeEmpl);
        }
    }
}

class TestDepartment extends Department {
    constructor() {
        super()
    }

    assignProject(proj) {
        this.freeEmployees[0].freeForDays = 0;
        this.projectsInProgress.unshift(proj);
        this.projectsInProgress[0].employees.push(this.freeEmployees[0].id);
        this.projectsInProgress[0].daysToFinish = 1;
        this.busyEmployees.push(this.freeEmployees.shift());
    }
}

class CEO {
    constructor({ webDep, mobDep, testDep }) {
        this.deps = { webDep, mobDep, testDep };
        this.projects = {
            webProjects: [],
            mobProjects: [],
            testProjects: []
        }
        this.report = new Report();
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    receiveNewProjects() {
        let projectsQuantity = this.getRandomInt(2, 2);
        let projectComplexity = this.getRandomInt(2, 2);
        let projectType = this.getRandomInt(1, 1);
        let projectID = this.getRandomInt(10000, 99999)
        for (let i = 1; i <= projectsQuantity; i++) {
            let newProject = new Project(projectType, projectComplexity, projectID);
            newProject.type === 'web' ? this.projects.webProjects.push(newProject) :
                this.projects.mobProjects.push(newProject);
            console.log(`received ${projectsQuantity} new projects`);
        }
    }

    hire() {
        this.deps.webDep.setFreeEmployees(this.projects.webProjects.length);
        this.deps.mobDep.setFreeEmployees(this.projects.mobProjects.length);
        this.deps.testDep.setFreeEmployees(this.projects.testProjects.length);
        let hired = this.projects.webProjects.length + this.projects.mobProjects.length + this.projects.testProjects.length
        console.log(`hired ${hired} employees`);
        this.report.addDevelopersHired(hired);
    }

    fire() {
        for (let dep in this.deps) {
            let worstDevs = this.deps[dep].freeEmployees.filter(empl => empl.freeForDays > 3);
            if (worstDevs.length) {
                const worstDevID = worstDevs.sort((a, b) => a.projectsDone - b.projectsDone)[0].id;
                const worstDevIndex = deps[dep].freeEmployees.findIndex(empl => empl.id == worstDevID);
                deps[dep].freeEmployees.splice(worstDevIndex, 1);
                this.report.addDevelopersFired(1);
            }
        }
    }

    handProjectOver() {
        for (let projType in this.projects) {
            let currentProjects = this.projects[projType];
            if (!currentProjects.length) {
                return;
            }
            switch (currentProjects[0].type) {
                case 'web':
                    while (currentProjects.length && this.deps.webDep.checkForFreeEmployees()) {
                        this.deps.webDep.assignProject(currentProjects[0]);
                        currentProjects.shift();
                    }
                    break;
                case 'mob':
                    while (currentProjects.length && this.deps.mobDep.checkForFreeEmployees()) {
                        this.deps.mobDep.assignProject(currentProjects[0]);
                        currentProjects.shift();
                    }
                    break;
                case 'test':
                    while (currentProjects.length && this.deps.testDep.checkForFreeEmployees()) {
                        this.deps.testDep.assignProject(currentProjects[0]);
                        currentProjects.shift();
                    }
                    break;

            }

        }

    }
}

class Report {
    constructor() {
        this.projectsDone = 0;
        this.developersHired = 0;
        this.developersFired = 0;
    }

    addProjectDone(num) {
        this.projectsDone += num;
    }

    addDevelopersHired(num) {
        this.developersHired += num;
    }

    addDevelopersFired(num) {
        this.developersFired += num;
    }
}
let newOrg = new Company()
newOrg.workPeriod(3)
console.log(newOrg)