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
        this.freeForDays = 0;
        this.busyForDays = 0;
    }
}
class Company {
    constructor() {
        this.testDepartment = new Department();
        this.webDepartment = new Department();
        this.mobDepartment = new Department();
        this.CEO = new CEO(this.webDepartment, this.mobDepartment, this.testDepartment);
    }
}

Company.prototype.newDayHasCome = function () {
    this.CEO.handProjectsOver('test')
    this.CEO.hire('web');
    this.CEO.hire('mob');
    this.CEO.hire('test');
    this.CEO.receiveProjects();
    this.CEO.handProjectsOver('web');
    this.CEO.handProjectsOver('mob');
    this.CEO.fire();
}

Company.prototype.workdayHasFinished = function () {
    this.dayCounter('web');
    this.dayCounter('mob');
    this.dayCounter('test');
}

Company.prototype.dayCounter = function (dep) {
    const currentDep = this[`${dep}Department`];
    currentDep.busyEmployees.forEach((empl, index) => {

       empl.busyForDays--;
    })
    currentDep.freeEmployees.map(empl => {
        empl.freeForDays++
    })
    currentDep.busyEmployees.sort((a, b) => a.busyForDays - b.busyForDays);
    console.log(this.CEO)
    if (currentDep.busyEmployees.length) {
        while (!currentDep.busyEmployees[0].busyForDays) {
            switch (dep) {
                case 'web':
                case 'mob':
                    this.CEO.testProjects++;
                    break;
                case 'test':
                    this.CEO.report.projectsDone++;
                    break;
            }
            currentDep.busyEmployees[0].projectsDone++;
            currentDep.freeEmployees.push(currentDep.busyEmployees[0]);
            currentDep.busyEmployees.shift();
        }

    }

}

Company.prototype.workPeriod = function (duration) {
    for (let i = 1; i <= duration; i++) {
        this.newDayHasCome();
        this.workdayHasFinished();
        console.log(`day ${i} passed`)
        console.log(this)
    }
}

class CEO {
    constructor(webDep, mobDep, testDep) {
        this.deps = { webDep, mobDep, testDep };
        this.webProjects = [];
        this.mobProjects = [];
        this.testProjects = 0;
        this.report = {
            projectsDone: 0,
            developersHired: 0,
            developersFired: 0
        }
    }
}

CEO.prototype.receiveProjects = function () {
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    let projectsQuantity = getRandomInt(2, 2);
    let projectComplexity = getRandomInt(2, 2);
    let projectType = getRandomInt(1, 1);
    for (let i = 1; i <= projectsQuantity; i++) {
        let newProject = new Project(projectType, projectComplexity);
        newProject.type === 'web' ? this.webProjects.push(newProject) :
            this.mobProjects.push(newProject);
    }
}

CEO.prototype.hire = function (name) {
    let quantity = 0;
    switch (name) {
        case 'test':
            quantity = this.testProjects;
            break;
        case 'mob':
            quantity = this.mobProjects.length ? this.mobProjects.map(proj => proj.complexity).reduce((acc, curr) => (acc + curr), 0) : 0;
            break;
        case 'web':
            quantity = this.webProjects.length;
            break;
    }

    if (quantity) {
        this.deps[`${name}Dep`].freeEmployees = quantity;
        this.report.developersHired += quantity;
    }
}

CEO.prototype.fire = function () {

    for (let dep in this.deps) {
        console.log(this.deps[dep])
        if (!this.deps[dep].freeEmployees.length) {
            return;
        }
        dep.freeEmployees.sort((a, b) => a.freeForDays - b.freeForDays);
        let candidaciesForFiring = dep.freeEmployees.filter(empl => empl.freeForDays > 3).sort((a, b) => a.projectsDone - b.projectsDone);
        if (candidaciesForFiring.length) {
            const worstEmployee = candidaciesForFiring[candidaciesForFiring.length - 1];
            const personToFire = dep.freeEmployees.findIndex(empl => {
                return empl.freeForDays == worstEmployee.freeForDays && empl.projectsDone == worstEmployee.projectsDone;
            })
            dep.freeEmployees.splice(personToFire, 1);
            this.report.developersFired++;
        }

    }
}

CEO.prototype.handProjectsOver = function (name) {
    switch (name) {
        case 'web':
        case 'test':
            while (this.deps[`${name}Dep`].freeEmployees.length && this[`${name}Projects`]) {
                this.deps[`${name}Dep`].assignProject(this[`${name}Projects`][0]);
                this[`${name}Projects`].shift();
            }
            break;
        case 'mob':
            while (this.mobProjects.length && this.deps.mobDep.freeEmployees.length >= this.mobProjects[0].complexity) {
                this.deps.mobDep.assignProject(this.mobProjects[0]);
                this.mobProjects.shift();
            }
            break;
    }
}

class Department {
    constructor() {
        this._freeEmployees = [];
        this._busyEmployees = [];
        this._projectsInProgress = [];
    }

    get freeEmployees() {
        return this._freeEmployees;
    }

    set freeEmployees(num) {
        for (let i = 1; i <= num; i++) {
            this._freeEmployees.push(new Employee());
        }
    }

    assignProject(proj) {
        let pushEmployee = function (t) {
            t._freeEmployees[0].freeForDays = 0;
            t._busyEmployees.push(t._freeEmployees[0]);
            t._freeEmployees.shift();
        }
        switch (proj.type) {
            case 'web':
                this._freeEmployees[0].busyForDays = proj.complexity;
                pushEmployee(this);
                break;
            case 'mob':
                for (let i = 1; i <= proj.complexity; i++) {
                    this._freeEmployees[0].busyForDays = proj.complexity;
                    pushEmployee(this);
                }
                break;
            case 'test':
                this._freeEmployees[0].busyForDays = 1;
                pushEmployee(this);
                break;
        }
    }

    get busyEmployees() {
        return this._busyEmployees;
    }
}

let newOrg = new Company();
newOrg.workPeriod(5)
console.log(newOrg)
console.log(newOrg.CEO.report);