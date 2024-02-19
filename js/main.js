Vue.component('board', {
    template: `
    <div>
        <button class="openModalButton" @click="modal = true">+</button>
        <modal-form v-if="modal" class="modal" @close-modal="updateModal" @add-task="addList" :columns="columns"></modal-form>
        <board-column class="column" v-for="column in columns" :key="column.position" :column="column" :columns="columns"></board-column>
        <div style="position: absolute; top: 110vh">{{ columns[1].cards.length }}</div>
    </div>
 `,
    data() {
        return {
            columns:[
                {position: 1,
                 maxCards: 3,
                 canAdd: true,
                 cards:[]
                },
                {position: 2,
                 maxCards: 5,
                 cards: []
                },
                {position: 3,
                 cards: []
                }
            ],
            modal: false,
        }
    },
    methods: {
        updateModal(type) {
            if (type === 'close') {
                this.modal = false;
            }
        },
        addList(card) {
            if (this.columns[0].cards.length < this.columns[0].maxCards) {
                this.columns[0].cards.push(card);
            } else {
                alert('В 1 столбце максимальное количество карточек')
            }
        }
    },
    mounted() {
        if (localStorage.data !== undefined) {
            let data = JSON.parse(localStorage.data);
            this.columns = data.columns;
        }

        eventBus.$on('cards-update', cardsUpdate => {
            console.log('Данные загружены в LocalStorage');
            let columns = {columns: this.columns}
            localStorage.data = JSON.stringify(columns);
        })
        eventBus.$on('columns-update', columnsUpdate => {
            console.log('Данные загружены в LocalStorage');
            let columns = {columns: this.columns}
            localStorage.data = JSON.stringify(columns);
        })
        eventBus.$on('move-card-to-second-column', moveToSecond = (cardTitle) => {
            for (let i = 0; i < this.columns[0].cards.length; ++i){
                if (this.columns[0].cards[i].title === cardTitle) {
                    let tempCards = this.columns[0].cards[i];
                    this.columns[0].cards.splice(i,1);
                    this.columns[1].cards.push(tempCards);
                }
            }
            eventBus.$emit('columns-update');
        })

        eventBus.$on('move-card-to-third-column', moveToThird = (cardTitle) => {
            for (let i = 0; i < this.columns[1].cards.length; ++i){
                if (this.columns[1].cards[i].title === cardTitle) {
                    let tempCard = this.columns[1].cards[i];
                    let timeNow = new Date();
                    tempCard.completeTime = timeNow;
                    this.columns[1].cards.splice(i,1);
                    this.columns[2].cards.push(tempCard);
                }
            }
            eventBus.$emit('columns-update');
        })
    }

})

Vue.component('board-column', {
    template: `
    <div>
        <board-card class="card" v-for="card in this.column.cards" :key="card.title" :card="card" :columns="columns"></board-card>
    </div>
 `,
    props: {
        columns: Array,
        column: Object
    },
    data() {
        return {
        }
    },
})

Vue.component('modal-form',{
    template: `
    <div>
      
    <p><input v-model="title" type="text" placeholder="Имя списка"></p>
    <p><input v-model="taskList.task1" type="text" placeholder="Задача"></p>
    <p><input v-model="taskList.task2" type="text" placeholder="Задача"></p>
    <p><input v-model="taskList.task3" type="text" placeholder="Задача"></p>
    <p><input v-model="taskList.task4" type="text" placeholder="Задача"></p>
    <p><input v-model="taskList.task5" type="text" placeholder="Задача"></p>
    <div class="buttons">
        <button @click="addCard" class="addButton">Добавить задачу</button>
        <button @click="$emit('close-modal', 'close');">X</button>
    </div>
    </div>  
    `,
    props: {
        columns: Array
    },
    data () {
        return {
            title: null,
            completeTime: null,
            taskList: [
                {task1: null},
                {task2: null},
                {task3: null},
                {task4: null},
                {task5: null},
            ]
        }

    },
    methods: {
        addCard () {
            if (this.columns[0].canAdd === true) {
                let taskList = [this.taskList.task1, this.taskList.task2, this.taskList.task3, this.taskList.task4, this.taskList.task5];

                let createdTask = {
                    title: this.title,
                    completeTime: null,
                    tasks: [

                    ]

                }

                for (let i = 0; i < taskList.length; ++i) {
                    if (taskList[i] !== null && taskList[i] !== undefined) {
                        let task = {
                            desc: '' + taskList[i],
                            status: {
                                complete: false,
                                disabled: false,
                            }
                        }

                        createdTask.tasks.push(task);
                    }
                }

                if (createdTask.tasks.length < 3) {
                    alert('У списка должно быть минимум 3 задачи');
                    return
                }

                this.$emit('add-task', createdTask);
                eventBus.$emit('cards-update');

                taskList.task1 = null;
                taskList.task2 = null;
                taskList.task3 = null;
                taskList.task4 = null;
                taskList.task5 = null;
            } else {
                alert('Первый столбец заблокирован');
            }
        }
    }
})

Vue.component('board-card', {
    template: `
    <div>
        <h2>{{ title }}</h2>
        <p v-for="task in tasks" :key="task.title">
            <input 
            type="checkbox"
            @change="tasksUpdate(task.desc)" 
            :checked="task.status.complete"
            :disabled="task.status.disabled"
            >
            {{ task.desc }}
        </p>
        <p v-if="completeTime !== null">Complete :{{  completeTime }}</p>
    </div>
 `,
    props: {
        card: Object,
        columns: Array
    },
    data() {
        return {
            title: this.card.title,
            completeTime: this.card.completeTime,
            tasks: this.card.tasks,
        }
    },
    methods: {
        tasksUpdate (desc) {

            console.log(this.columns);

            for (let i = 0; i < this.tasks.length; ++i) {
                if (this.tasks[i].desc === desc) {
                    this.tasks[i].status.complete = true;
                    this.tasks[i].status.disabled = true;
                }
            }

            let tasksComplete = 0;
            for (let i = 0; i < this.tasks.length; ++i) {
                if (this.tasks[i].status.complete === true) {
                    tasksComplete += 1;
                }
            }

            if (tasksComplete >= (this.tasks.length / 2)) {
                if (this.columns[1].cards.length < 5) {
                    eventBus.$emit('move-card-to-second-column', this.title);
                    eventBus.$emit('cards-update');
                } else {
                    for (let i = 0; i < this.columns[0].cards.length; ++i) {
                        for (let j = 0; j < this.columns[0].cards[i].tasks.length; ++j) {
                            this.columns[0].cards[i].tasks[j].status.disabled = true;
                        }
                    }
                    this.columns[0].canAdd = false;
                }
            }
            if (tasksComplete === (this.tasks.length)) {
                eventBus.$emit('move-card-to-third-column', this.title);
                console.log(this.columns[1].cards)
                if (this.columns[1].cards.length < 5) {
                    eventBus.$emit('cards-update');
                    for (let i = 0; i < this.columns[0].cards.length; ++i) {
                        for (let j = 0; j < this.columns[0].cards[i].tasks.length; ++j) {
                            if (this.columns[0].cards[i].tasks[j].status.complete !== true) {
                                this.columns[0].cards[i].tasks[j].status.disabled = false;
                            }
                        }
                    }
                    this.columns[0].canAdd = true;
                }
            }

        }
    }
})

let eventBus = new Vue()


let app = new Vue({
    el: '#app',
})