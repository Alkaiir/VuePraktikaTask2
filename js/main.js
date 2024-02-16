Vue.component('board', {
    template: `
    <div>
        <button class="openModalButton" @click="modal = true">+</button>
        <modal-form v-if="modal" class="modal" @close-modal="updateModal" @add-task="addTask"></modal-form>
        <board-column class="column" v-for="column in columns" :key="column.position" :column="column"></board-column>
    </div>
 `,
    data() {
        return {
            columns:[
                {position: 1,
                 maxCards: 3,
                 cards:[
                     {title: 'Список 1',
                      tasks: [
                          {desc: "Сходить в магазин", status: false},
                          {desc: "Погулять с собакой", status: false}
                      ]
                     }
                     ]
                },
                {position: 2,
                 maxCards: 5,
                 cards: [
                     {
                         title: 'Список 2',
                         tasks: [
                             {desc: "Приготовить ужин", status: true},
                             {desc: "Сделать уборку", status: false}
                         ]
                     },
                     {
                         title: 'Список 3',
                         tasks: [
                             {desc: "Приготовить ужин", status: true},
                             {desc: "Сделать уборку", status: false}
                         ]
                     }
                     ]
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
        addTask(card) {
            this.columns[0].cards.push(card);
        }
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

            this.$emit('add-task', createdTask);

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
        <p v-for="task in tasks" :key="task.title"><input type="checkbox" :checked="task.status">{{ task.desc }}</p>
    </div>
 `,
    props: {
        card: Object
    },
    data() {
        return {
            title: this.card.title,
            tasks: this.card.tasks
        }
    },
    methods: {

    }
})

let app = new Vue({
    el: '#app',
})