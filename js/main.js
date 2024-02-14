Vue.component('board', {
    template: `
    <div>
        <board-column class="column" v-for="column in columns" :key="column.index" :column="column"></board-column>
    </div>
 `,
    data() {
        return {
            columns: [ [{title: 'Задача 1', tasks: [{taskDesc: "Сходить в магазин", status: false}]}], [], []],
        }
    },
})

Vue.component('board-column', {
    template: `
    <div>
        <board-card class="card" v-for="card in column" :key="card.title" :card="card"></board-card>
    </div>
 `,
    props: {
        column: Array
    },
    data() {
        return {

        }
    },
})

Vue.component('board-card', {
    template: `
    <div>
        <h2>{{ card.title }}</h2>
        <p v-for:="task in this.card.tasks"><input type="checkbox" >{{  }}</p>
    </div>
 `,
    props: {
        card: Object
    },
    data() {
        return {
        }
    },
})

let app = new Vue({
    el: '#app',
})