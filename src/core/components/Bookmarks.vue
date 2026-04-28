<script>
import { bookmarks } from '../../pinia/bookmarks';
import { index, matches } from '../../plugins/utils';

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
        ready: false,
        scrollInterval: null,
        scrollStep: 5,
        ref: 'items',
    }),

    computed: {
        container() {
            return this.ready
                ? this.$parent.$refs[this.ref].$el
                : null;
        },
    },

    watch: {
        $route: {
            handler: 'add',
            deep: true,
        },
    },

    created() {
        bookmarks().init();
        bookmarks().exclude(this.excluded);
    },

    mounted() {
        this.ready = true;
        this.add(this.$route);
    },

    beforeUnmount() {
        this.ready = false;
        clearInterval(this.scrollInterval);
    },

    methods: {
        add(bookmark) {
            bookmarks().push(bookmark);
            this.$nextTick(this.focus);
        },
        uniqueId(bookmark) {
            const { name, params, query } = bookmark;

            return JSON.stringify({ name, params, query });
        },
        remove(bookmark) {
            const store = bookmarks();

            store.remove(bookmark);
            const { name, params, query } = store.bookmarks[store.bookmarks.length - 1];

            this.$router.push({ name, params, query })
                .catch(this.routerErrorHandler);
        },
        item(index) {
            const items = this.container.children;
            return items[index];
        },
        focus() {
            if (!this.ready) {
                return;
            }

            clearInterval(this.scrollInterval);

            const bookmark = this.item(index(bookmarks().bookmarks, this.$route));

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
        const store = bookmarks();

        return this.$slots.default({
            bookmarks: store.bookmarks,
            hasClear: store.stickies.length,
            matches,
            stick: bookmark => store.stick(bookmark),
            isExcluded: bookmark => store.excluded.includes(bookmark.name),
            stickBindings: bookmark => ({
                click: () => store.stick(bookmark),
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
                click: () => store.clear(this.$route),
            },
            reorderBindings: {
                modelValue: store.bookmarks,
                itemKey: JSON.stringify,
                ref: this.ref,
            },
            reorderEvents: {
                'update:modelValue': items => store.set(items),
            },
        });
    },
};
</script>
