<script>
import { getActivePinia } from 'pinia';

const useStore = id => {
    const store = getActivePinia()?._s?.get(id);

    if (!store) {
        throw new Error(`Missing Pinia store: ${id}`);
    }

    return store;
};

export default {
    name: 'BookmarksState',

    methods: {
        empty() {
            useStore('bookmarks').empty();
        },
        push(route) {
            useStore('bookmarks').push(route);
        },
        setBookmarksState(state) {
            return useStore('preferences').setBookmarksState(state);
        },
        update(state) {
            if (state) {
                this.push(this.$route);
            } else {
                this.empty();
            }

            this.setBookmarksState(state);
        },
    },

    render() {
        return this.$slots.default({
            bindings: {
                modelValue: useStore('preferences').global.bookmarks,
            },
            events: {
                'update:modelValue': state => this.update(state),
            },
        });
    },
};

</script>
