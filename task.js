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
        this.CEO.dutiesForNewDay();
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
                    const webDep = this.deps.webDep;
                    for (let i = 0; i < developersGotFree.length; i++) {
                        let index = webDep.busyEmployees.findIndex(empl => empl.id == developersGotFree[i]);
                        webDep.freeEmployees.unshift(webDep.busyEmployees[index]);
                        webDep.freeEmployees[0].projectsDone++;
                        webDep.busyEmployees.splice(index, 1);
                    }
                    break;
                case 'mobDep':
                    const mobDep = this.deps.mobDep; 
                    for (let i = 0; i < developersGotFree.length; i++) {
                        let index = mobDep.busyEmployees.findIndex(empl => empl.id == developersGotFree[i]);
                        mobDep.freeEmployees.unshift(mobDep.busyEmployees[index]);
                        mobDep.freeEmployees[0].projectsDone++;
                        mobDep.busyEmployees.splice(index, 1);
                    }
                    break;
                case 'testDep':
                    const testDep = this.deps.testDep;
                    this.CEO.report.addProjectDone(testDep.projectsInProgress.length);
                    testDep.projectsInProgress = [];
                    testDep.busyEmployees.map(empl => {
                        testDep.freeEmployees.unshift(empl);
                        testDep.freeEmployees[0].projectsDone++;
                    })
                    testDep.busyEmployees = [];
            }
        }
    }

    moveProjectsToTestDep() {
        const testProjects = this.CEO.projects.testProjects;
        const mobProjectsInProgress = this.deps.mobDep.projectsInProgress;
        const webProjectsInProgress = this.deps.webDep.projectsInProgress;
        
        webProjectsInProgress.sort((a, b) => a.daysToFinish - b.daysToFinish);
        mobProjectsInProgress.sort((a, b) => a.daysToFinish - b.daysToFinish);
        if (mobProjectsInProgress.length) {
            while (mobProjectsInProgress.length && !mobProjectsInProgress[0].daysToFinish) {
                testProjects.unshift(mobProjectsInProgress.shift());
                testProjects[0].employees = [];
                testProjects[0].type = 'test';
            }
        }
        if (webProjectsInProgress.length) {
            while (webProjectsInProgress.length && !webProjectsInProgress[0].daysToFinish) {
                testProjects.unshift(webProjectsInProgress.shift());
                testProjects[0].employees = [];
                testProjects[0].type = 'test';
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
        const projects = this.projectsInProgress;
        let firstFreeEmployee = this.freeEmployees[0];
        projects.unshift(proj);
        projects[0].employees.push(firstFreeEmployee.id);
        firstFreeEmployee.freeForDays = 0;
        projects[0].daysToFinish = proj.complexity;
        this.busyEmployees.push(this.freeEmployees.shift());
    }
}

class MobDepartment extends Department {
    constructor() {
        super()
    }

    assignProject(proj) {
        const firstFreeEmpl = this.freeEmployees[0];
        const projects = this.projectsInProgress;
        if (this.freeEmployees.length >= proj.complexity) {
            projects.unshift(proj);
            const currentProject = this.projectsInProgress[0];
            currentProject.daysToFinish = 1;
            for (let i = 0; i < proj.complexity; i++) {
                const currentEmpl = this.freeEmployees[i];
                currentEmpl.freeForDays = 0;
                currentProject.employees.push(currentEmpl.id);
                this.busyEmployees.push(currentEmpl);
            }
            this.freeEmployees.splice(0, proj.complexity)
        } else {
            firstFreeEmpl.freeForDays = 0;
            projects.unshift(proj);
            projects[0].employees.push(firstFreeEmpl.id);
            projects[0].daysToFinish = proj.complexity;
            this.busyEmployees.push(firstFreeEmpl);
            this.freeEmployees.shift();
        }
    }
}

class TestDepartment extends Department {
    constructor() {
        super()
    }

    assignProject(proj) {
        const projects = this.projectsInProgress;
        this.freeEmployees[0].freeForDays = 0;
        projects.unshift(proj);
        projects[0].employees.push(this.freeEmployees[0].id);
        projects[0].daysToFinish = 1;
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

    dutiesForNewDay() {
        this.handProjectOver();
        this.hire();
        this.receiveNewProjects();
        this.handProjectOver();
        this.fire();
    }

    

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    receiveNewProjects() {
        let projectsQuantity = this.getRandomInt(0, 4);
        for (let i = 1; i <= projectsQuantity; i++) {
            let projectType = this.getRandomInt(0, 1);
            let projectComplexity = this.getRandomInt(1, 3);
            let projectID = this.getRandomInt(10000, 99999)
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
                const worstDevIndex = this.deps[dep].freeEmployees.findIndex(empl => empl.id == worstDevID);
                this.deps[dep].freeEmployees.splice(worstDevIndex, 1);
                this.report.addDevelopersFired(1);
                console.log('fired');
            }
        }
    }

    handProjectOver() {
        for (let projType in this.projects) {
            let currentProjects = this.projects[projType];
            if (currentProjects.length) {

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
newOrg.workPeriod(20)
console.log(newOrg)
console.log(newOrg.CEO.report)