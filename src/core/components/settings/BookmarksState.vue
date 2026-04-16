<script>
import { bookmarks as useBookmarks } from '../../../pinia/bookmarks';
import { preferences as usePreferences } from '@enso-ui/ui/src/pinia/preferences';

export default {
    name: 'BookmarksState',

    methods: {
        empty() {
            useBookmarks().empty();
        },
        push(route) {
            useBookmarks().push(route);
        },
        setBookmarksState(state) {
            return usePreferences().setBookmarksState(state);
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
                modelValue: usePreferences().global.bookmarks,
            },
            events: {
                'update:modelValue': state => this.update(state),
            },
        });
    },
};

</script>
