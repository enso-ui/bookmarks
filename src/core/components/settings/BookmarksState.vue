<script>
import { bookmarks } from '../../../pinia/bookmarks';
import { preferences } from '@enso-ui/ui/src/pinia/preferences';

export default {
    name: 'BookmarksState',

    render() {
        return this.$slots.default({
            bindings: {
                modelValue: preferences().global.bookmarks,
            },
            events: {
                'update:modelValue': async state => {
                    if (state) {
                        bookmarks().push(this.$route);
                    } else {
                        bookmarks().empty();
                    }

                    await preferences().setBookmarksState(state);
                },
            },
        });
    },
};

</script>
