class MorningVisitor {
    visit(CEO) {
        CEO.dutiesForNewDay();
    }
}

class EveningVisitor {
    visit(dep) {
        dep.workDayIsOver();
    }
}

class Randomizer {
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

class Project {
    constructor() {
        const randomizer = new Randomizer().getRandomInt;
        let types = ['web', 'mob'];
        this.type = types[randomizer(0, 1)];
        this.complexity = randomizer(1, 3);
        this.employees = [];
        this.daysToFinish = 0;
        this.id = randomizer(10000, 99999);
    }
}

class Employee {
    constructor() {
        const randomizer = new Randomizer().getRandomInt;
        this.projectsDone = 0;
        this.freeForDays = 0;
        this.id = randomizer(1000, 9999);
    }
}

class Department {
    constructor() {
        this.freeEmployees = [];
        this.busyEmployees = [];
        this.projectsInProgress = [];
    }

    checkForFreeEmployees() {
        return this.freeEmployees.length > 0;
    }

    setFreeEmployees(num) {
        for (let i = 1; i <= num; i++) {
            this.freeEmployees.push(new Employee());
        }
    }

    moveNewlyVacantEmployees() {
        let developersGotFree = this.projectsInProgress
            .filter(proj => proj.daysToFinish == 0)
            .map(proj => proj.employees).flat();
        for (let i = 0; i < developersGotFree.length; i++) {
            let index = this.busyEmployees.findIndex(empl => empl.id == developersGotFree[i]);
            this.freeEmployees.unshift(this.busyEmployees[index]);
            this.freeEmployees[0].projectsDone++;
            this.busyEmployees.splice(index, 1);
        }
    }

    accept(visitor) {
        visitor.visit(this);
    }

    workDayIsOver() {
        this.freeEmployees.forEach(empl => empl.freeForDays++);
        this.projectsInProgress.forEach(proj => proj.daysToFinish--);
        this.moveNewlyVacantEmployees();
        this.moveProjectsToTestDep();
    }
}

class DevDepartment extends Department {
    moveProjectsToTestDep() {
        const testProjects = boss.getTestProjects();
        const projectsInProgress = this.projectsInProgress.sort((a, b) => a.daysToFinish - b.daysToFinish);
        if (!projectsInProgress.length) {
            return;
        }
        while (projectsInProgress.length && !projectsInProgress[0].daysToFinish) {
            testProjects.unshift(projectsInProgress.shift());
            testProjects[0].employees = [];
            testProjects[0].type = 'test';
        }
    }
}

class WebDepartment extends DevDepartment {
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

class MobDepartment extends DevDepartment {
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
    assignProject(proj) {
        const projects = this.projectsInProgress;
        this.freeEmployees[0].freeForDays = 0;
        projects.unshift(proj);
        projects[0].employees.push(this.freeEmployees[0].id);
        projects[0].daysToFinish = 1;
        this.busyEmployees.push(this.freeEmployees.shift());
    }

    moveNewlyVacantEmployees() {
        report.trigger('projectDone', this.projectsInProgress.length);
        this.projectsInProgress = [];
        this.busyEmployees.map(empl => {
            this.freeEmployees.unshift(empl);
            this.freeEmployees[0].projectsDone++;
        })
        this.busyEmployees = [];
    }

    moveProjectsToTestDep() {
        return;
    }
}

class CEO {
    constructor(webDep, mobDep, testDep) {
        this.deps = { webDep, mobDep, testDep };
        this.projects = {
            webProjects: [],
            mobProjects: [],
            testProjects: []
        }
    }

    getTestProjects() {
        return this.projects.testProjects;
    }

    dutiesForNewDay() {
        this.handProjectsToTest();
        this.hire();
        this.receiveNewProjects();
        this.handProjectsToTest();
        this.handProjectsToWeb();
        this.handProjectsToMob();
        this.fire();
    }

    receiveNewProjects() {
        const randomizer = new Randomizer().getRandomInt;
        let projectsQuantity = randomizer(0, 4);
        for (let i = 1; i <= projectsQuantity; i++) {
            let newProject = new Project();
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
        report.trigger('hire', hired);
    }

    fire() {
        for (let dep in this.deps) {
            let currentDepFreeDevs = this.deps[dep].freeEmployees;
            let worstDevs = currentDepFreeDevs.filter(empl => empl.freeForDays > 3);
            if (worstDevs.length) {
                const worstDevID = worstDevs.sort((a, b) => a.projectsDone - b.projectsDone)[0].id;
                currentDepFreeDevs = currentDepFreeDevs.filter(empl => empl.id !== worstDevID);
                report.trigger('fire')
                console.log('fired');
            }
        }
    }
    handProjectsToWeb() {
        let webDepVisitor = new HandProjectVisitor(this.projects.webProjects);
        this.deps.webDep.accept(webDepVisitor);
    }
    handProjectsToMob() {
        let mobDepVisitor = new HandProjectVisitor(this.projects.mobProjects);
        this.deps.mobDep.accept(mobDepVisitor);
    }
    handProjectsToTest() {
        let testDepVisitor = new HandProjectVisitor(this.projects.testProjects);
        this.deps.testDep.accept(testDepVisitor);
    }
    accept(visitor) {
        visitor.visit(this)
    }
}

class HandProjectVisitor {
    constructor(projects) {
        this.projects = projects;
    }

    visit(dep) {
        if (!this.projects.length) {
            return;
        }
        while (this.projects.length && dep.checkForFreeEmployees()) {
            dep.assignProject(this.projects[0]);
            this.projects.shift();
        }
    }
}

class EventHandler {
    constructor() {
        this.handlers = {};
    }
    on(event, fn) {
        if (!this.handlers[event]) {
            this.handlers[event] = new Array(fn);
        } else if (this.handlers[event].indexOf(fn) == -1) {
            this.handlers[event].push(fn)
        }
    }
    off(event, fn) {
        if (this.handlers[event] && this.handlers[event].length === 1) {
            delete this.handlers[event];
        } else {
            this.handlers[event].splice(this.handlers[event.indexOf(fn)], 1)
        }
    }
    trigger(event, arg) {
        if (!this.handlers[event]) {
            return;
        }
        this.handlers[event].forEach(handler => {
            handler.call(this, arg)
        })
    }
}

class Report extends EventHandler {
    constructor() {
        super();
        this.projectsDone = 0;
        this.developersHired = 0;
        this.developersFired = 0;
        this.on('hire', this.addDevelopersHired);
        this.on('fire', this.addDevelopersFired);
        this.on('projectDone', this.addProjectDone);

    }
    addProjectDone(num) {
        this.projectsDone += num;
    }
    addDevelopersHired(num) {
        this.developersHired += num;
    }
    addDevelopersFired() {
        this.developersFired++;
    }
}

let mobDep = new MobDepartment();
let webDep = new WebDepartment();
let testDep = new TestDepartment();
let boss = new CEO(webDep, mobDep, testDep);
let report = new Report();
const morning = new MorningVisitor();
const evening = new EveningVisitor();

function run(duration) {
    for (let i = 1; i <= duration; i++) {
        boss.accept(morning);
        console.log(`day ${i}, morning passed`)
        boss.deps.webDep.accept(evening);
        boss.deps.mobDep.accept(evening);
        boss.deps.testDep.accept(evening);
        console.log(`day ${i}, evening passed`)
        console.group(report, boss, webDep, mobDep, testDep)
    }
}

run(15)
