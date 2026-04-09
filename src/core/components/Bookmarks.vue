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
    name: 'Bookmarks',

    inject: ['routerErrorHandler'],

    props: {
        excluded: {
            type: Array,
            default: () => ([]),
        },
    },

    data: () => ({
        scrollInterval: null,
        scrollStep: 5,
        ref: 'items',
    }),

    computed: {
        bookmarks() {
            return useStore('bookmarks').bookmarks;
        },
        stickies() {
            return useStore('bookmarks').stickies;
        },
        container() {
            return this.$parent.$refs[this.ref].$el;
        },
    },

    watch: {
        $route: {
            handler: 'add',
            deep: true,
        },
    },

    created() {
        this.init();
        this.exclude(this.excluded);
    },

    mounted() {
        this.add(this.$route);
    },

    methods: {
        init() {
            useStore('bookmarks').init();
        },
        set(items) {
            useStore('bookmarks').set(items);
        },
        exclude(items) {
            useStore('bookmarks').exclude(items);
        },
        push(bookmark) {
            useStore('bookmarks').push(bookmark);
        },
        stick(bookmark) {
            useStore('bookmarks').stick(bookmark);
        },
        clear(bookmark) {
            useStore('bookmarks').clear(bookmark);
        },
        splice(bookmark) {
            useStore('bookmarks').remove(bookmark);
        },
        isExcluded(bookmark) {
            return useStore('bookmarks').isExcluded(bookmark);
        },
        matches(first, second) {
            return useStore('bookmarks').matches(first, second);
        },
        index(bookmark) {
            return useStore('bookmarks').indexByBookmark(bookmark);
        },
        add(bookmark) {
            this.push(bookmark);
            setTimeout(this.focus, 1000);
        },
        uniqueId(bookmark) {
            const { name, params, query } = bookmark;

            return JSON.stringify({ name, params, query });
        },
        remove(bookmark) {
            this.splice(bookmark);
            const { name, params, query } = this.bookmarks[this.bookmarks.length - 1];
            this.$router.push({ name, params, query })
                .catch(this.routerErrorHandler);
        },
        item(index) {
            const items = this.container.children;
            return items[index];
        },
        focus() {
            clearInterval(this.scrollInterval);

            const bookmark = this.item(this.index(this.$route));

            if (!bookmark) {
                return;
            }

            const containerLeft = this.container.scrollLeft;
            const containerRight = containerLeft + this.container.clientWidth;
            const bookmarkLeft = bookmark.offsetLeft;
            const bookmarkRight = bookmarkLeft + bookmark.clientWidth;

            if (bookmarkLeft < containerLeft) {
                const remaining = (containerLeft - bookmarkLeft) % this.scrollStep;
                this.scroll(bookmarkLeft, -1, remaining);
            }

            if (bookmarkRight > containerRight) {
                const amount = bookmarkRight - containerRight;
                const remaining = amount % this.scrollStep;
                this.scroll(amount, 1, remaining);
            }
        },
        scroll(amount, direction, remaining) {
            if (remaining) {
                this.container.scrollLeft += remaining * direction;
            }

            this.scrollInterval = setInterval(() => {
                if (this.container.scrollLeft === amount) {
                    clearInterval(this.scrollInterval);
                    return;
                }

                this.container.scrollLeft += this.scrollStep * direction;
            }, 1);
        },
    },

    render() {
        return this.$slots.default({
            bookmarks: this.bookmarks,
            hasClear: this.stickies.length,
            matches: this.matches,
            stick: this.stick,
            isExcluded: this.isExcluded,
            stickBindings: bookmark => ({
                click: () => this.stick(bookmark),
            }),
            bookmarkBindings: bookmark => {
                this.uniqueId(bookmark);
            },
            removeBindings: bookmark => ({
                click: () => this.remove(bookmark),
            }),
            bookmarkEvents: ({ name, params, query }) => ({
                click: () => this.$router.push({ name, params, query })
                    .catch(this.routerErrorHandler),
            }),
            clearBindings: {
                click: () => this.clear(this.$route),
            },
            reorderBindings: {
                modelValue: this.bookmarks,
                itemKey: JSON.stringify,
                ref: this.ref,
            },
            reorderEvents: {
                'update:modelValue': this.set,
            },
        });
    },
};
</script>
