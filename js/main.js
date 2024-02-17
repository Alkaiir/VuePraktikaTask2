Vue.component('board', {
    template: `
    <div>
        <button class="openModalButton" @click="modal = true">+</button>
        <modal-form v-if="modal" class="modal" @close-modal="updateModal" @add-task="addList"></modal-form>
        <board-column class="column" v-for="column in columns" :key="column.position" :column="column"></board-column>
<!--        <p>{{ columns }}</p>-->
    </div>
 `,
    data() {
        return {
            columns:[
                {position: 1,
                 maxCards: 3,
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
        })
    }

})

Vue.component('board-column', {
    template: `
    <div>
        <board-card class="card" v-for="card in this.column.cards" :key="card.title" :card="card"></board-card>
    </div>
 `,
    props: {
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
                        status: false
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
        }
    }
})

Vue.component('board-card', {
    template: `
    <div>
        <h2>{{ title }}</h2>
        <p v-for="task in tasks" :key="task.title"><input type="checkbox" v-model="task.status" @change="tasksUpdate" :checked="task.status" :disabled="task.status">{{ task.status }}</p>
        <p v-if="completeTime !== null">{{ completeTime }}</p>
    </div>
 `,
    props: {
        card: Object
    },
    data() {
        return {
            title: this.card.title,
            completeTime: this.card.completeTime,
            tasks: this.card.tasks
        }
    },
    methods: {
        tasksUpdate () {
            let tasksComplete = 0;
            for (let i = 0; i < this.tasks.length; ++i) {
                if (this.tasks[i].status === true) {
                    tasksComplete += 1;
                }
            }
            if (tasksComplete >= (this.tasks.length / 2)) {

                // if (this.columns[1].cards.length < this.columns[1].maxCards) {
                //
                // } else {
                //     alert('Во втором столбце не может быть больше 5 карточек');
                // }


                eventBus.$emit('move-card-to-second-column', this.title);
            }
            if (tasksComplete === (this.tasks.length)) {
                eventBus.$emit('move-card-to-third-column', this.title);
            }
            eventBus.$emit('cards-update');
        }
    }
})

let eventBus = new Vue()


let app = new Vue({
    el: '#app',
})