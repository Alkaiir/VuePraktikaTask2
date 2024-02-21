Vue.component('board', {
    template: `
    <div>
        <button class="openModalButton" @click="modal = true">+</button>
        <modal-form v-if="modal" class="modal" @close-modal="updateModal" @add-task="addList" :columns="columns" :taskIdList="taskIdList" :listIdList="listIdList"></modal-form>
        <board-column class="column" v-for="column in columns" :key="column.position" :column="column" :columns="columns"></board-column>
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
            taskIdList: null,
            listIdList: null
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
            this.taskIdList = data.taskIdList;
            this.listIdList = data.listIdList;
        }

        if (this.taskIdList === null) {
            this.taskIdList = 0;
        }

        if (this.listIdList === null) {
            this.listIdList = 0;
        }

        eventBus.$on('update-list-id-list', updateListIdList => {
            this.listIdList += 1;
        })

        eventBus.$on('update-task-id-list', updateTaskIdList => {
            this.taskIdList += 1;
        })

        eventBus.$on('data-update', dataUpdate => {
            console.log('Данные загружены в LocalStorage');
            let data = {
                columns: this.columns,
                taskIdList: this.taskIdList,
                listIdList: this.listIdList
            };
            localStorage.data = JSON.stringify(data);
        })
        eventBus.$on('move-card-to-second-column', moveToSecond = (cardId) => {
            for (let i = 0; i < this.columns[0].cards.length; ++i){
                if (this.columns[0].cards[i].listID === cardId) {
                    let tempCards = this.columns[0].cards[i];
                    this.columns[0].cards.splice(i,1);
                    this.columns[1].cards.push(tempCards);
                }
            }
            eventBus.$emit('data-update');
        })

        eventBus.$on('move-card-to-third-column', moveToThird = (cardId) => {
            for (let i = 0; i < this.columns[1].cards.length; ++i){
                if (this.columns[1].cards[i].listID === cardId) {
                    let tempCard = this.columns[1].cards[i];
                    let timeNow = new Date();
                    tempCard.completeTime = timeNow;
                    this.columns[1].cards.splice(i,1);
                    this.columns[2].cards.push(tempCard);
                }
            }
            eventBus.$emit('data-update');
        })
    }

})

Vue.component('board-column', {
    template: `
    <div>
        <board-card class="card" v-for="card in this.column.cards" :key="card.listID" :card="card" :columns="columns"></board-card>
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
        columns: Array,
        taskIdList: Number,
        listIdList: Number
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
            ],
            til: this.taskIdList
        }

    },
    methods: {
        addCard () {
            if (this.columns[0].canAdd === true) {
                let taskList = [this.taskList.task1, this.taskList.task2, this.taskList.task3, this.taskList.task4, this.taskList.task5];

                let createdTask = {
                    title: this.title,
                    completeTime: null,
                    listID: this.listIdList,
                    tasks: [

                    ]

                }

                for (let i = 0; i < taskList.length; ++i) {
                    if (taskList[i] !== null && taskList[i] !== undefined) {
                        let task = {
                            desc: '' + taskList[i],
                            taskID: this.til,
                            status: {
                                complete: false,
                                disabled: false,
                            }
                        }
                        this.til += 1;
                        eventBus.$emit('update-task-id-list')
                        createdTask.tasks.push(task);
                    }
                }

                if (createdTask.tasks.length < 3) {
                    alert('У списка должно быть минимум 3 задачи');
                    return
                }

                eventBus.$emit('update-list-id-list')

                this.$emit('add-task', createdTask);
                taskList.task1 = null;
                taskList.task2 = null;
                taskList.task3 = null;
                taskList.task4 = null;
                taskList.task5 = null;
                eventBus.$emit('data-update');
            } else {
                alert('Первый столбец заблокирован');
            }
        }
    }
})

Vue.component('board-card', {
    template: `
    <div>
        <h2>{{ this.card.title}}</h2>
        <p v-for="task in this.card.tasks" :key="task.taskID">
            <input 
            type="checkbox"
            @change="tasksUpdate(task.taskID)" 
            :checked="task.status.complete"
            :disabled="task.status.disabled"
            >
            {{ task.desc }}
        </p>
        <p v-if="this.card.completeTime !== null">Complete :{{  this.card.completeTime }}</p>
    </div>
 `,
    props: {
        card: Object,
        columns: Array
    },
    data() {
        return {

        }
    },
    methods: {
        tasksUpdate (taskID) {

            for (let i = 0; i < this.card.tasks.length; ++i) {
                if (this.card.tasks[i].taskID === taskID) {
                    this.card.tasks[i].status.complete = true;
                    this.card.tasks[i].status.disabled = true;
                }
            }

            let tasksComplete = 0;

            for (let i = 0; i < this.card.tasks.length; ++i) {
                if (this.card.tasks[i].status.complete === true) {
                    tasksComplete += 1;
                }
            }

            if (tasksComplete >= (this.card.tasks.length / 2)) {
                if (this.columns[1].cards.length < 5) {
                    eventBus.$emit('move-card-to-second-column', this.card.listID);
                    eventBus.$emit('data-update');
                } else {
                    for (let i = 0; i < this.columns[0].cards.length; ++i) {
                        for (let j = 0; j < this.columns[0].cards[i].tasks.length; ++j) {
                            this.columns[0].cards[i].tasks[j].status.disabled = true;
                        }
                    }
                    this.columns[0].canAdd = false;
                }
            }
            if (tasksComplete === (this.card.tasks.length)) {
                eventBus.$emit('move-card-to-third-column', this.card.listID);
                eventBus.$emit('data-update');
                if (this.columns[1].cards.length < 5) {
                    eventBus.$emit('data-update');
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