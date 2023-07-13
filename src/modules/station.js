import {Column} from './column';
import {RenderStation} from './renderStation';

export class Station {
    #queue = [];
    #filling = [];
    #ready = [];
    constructor(typeStation, renderApp = null) {
        this.typeStation = typeStation;
        this.renderApp = renderApp;
        this.renderStation = null;
    }

    get filling() {
        return this.#filling;
    }

    get queue() {
        return this.#queue;
    }

    init() {
        this.renderColumns();

        this.addStations();

        setInterval(() => {
            this.checkQueueToFilling();
        }, 3000);
    }

    renderColumns() {
        for (const option of this.typeStation) {
            for (let i = 0; i < option.count; i++) {
                this.#filling
                    .push(new Column(option.type, option.speed));
            }
        }
    }

    addStations() {
        if (this.renderApp) {
            this.renderStation = new RenderStation(this.renderApp, this);
        }
    }

    checkQueueToFilling() {
        if (this.#queue.length) {
            for (let i = 0; i < this.#queue.length; i++) {
                for (let j = 0; j < this.#filling.length; j++) {
                    if (!this.#filling[j].car &&
                        this.#queue[i].typeFuel === this.#filling[j].type) {
                        this.#filling[j].car = this.#queue.splice(i, 1)[0];
                        this.fillingGo(this.#filling[j]);
                        this.renderStation.renderStation();
                        break;
                    }
                }
            }
        }
    }

    fillingGo(column) {
        const car = column.car;
        const needPetrol = car.needPetrol;
        let nowTank = car.nowTank;
        const timerId = setInterval(() => {
            nowTank += column.speed;
            if (nowTank >= car.maxTank) {
                clearInterval(timerId);
                console.log('timerId: ', timerId);
                const total = nowTank - needPetrol;
                car.fillUp();
                column.car = null;
                this.leaveClient({car, total});
            }
        }, 10000);
        // console.log(`заправляем ${JSON.stringify(column.car)}`);
    }

    leaveClient({car, total}) {
        this.#ready.push(car);
        this.renderStation.renderStation();
    }

    addCarQueue(car) {
        this.#queue.push(car);
        this.renderStation.renderStation();
    }
}
