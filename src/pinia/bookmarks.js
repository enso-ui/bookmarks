import { defineStore } from 'pinia';
import {
    qualifies, matches, stickies, map, index, persist,
} from '../plugins/utils';

const storedBookmarks = () => {
    const bookmarks = localStorage.getItem('bookmarks');

    return bookmarks ? JSON.parse(bookmarks) : [];
};

export const bookmarks = defineStore('bookmarks', {
    state: () => ({
        bookmarks: [],
        excluded: ['notFound', 'unauthorized'],
    }),

    getters: {
        stickies: state => stickies(state.bookmarks),
        stateByBookmark: state => bookmark => {
            const current = state.bookmarks[index(state.bookmarks, bookmark)];

            return current?.state ?? null;
        },
    },

    actions: {
        init() {
            this.bookmarks = storedBookmarks();
        },
        set(items) {
            this.bookmarks = items;
            persist(this.bookmarks);
        },
        updateState({ bookmark, data }) {
            const current = this.bookmarks[index(this.bookmarks, bookmark)];

            if (!current) {
                return;
            }

            current.state = data ?? null;
            persist(this.bookmarks);
        },
        exclude(items) {
            this.excluded = this.excluded.concat(items);
        },
        push(bookmark) {
            this.bookmarks = this.bookmarks.filter(({ sticky, state }) => sticky || state);

            if (qualifies(this.bookmarks, bookmark)) {
                this.bookmarks.push(map(bookmark));
                persist(this.bookmarks);
            }
        },
        stick(bookmark) {
            const current = this.bookmarks[index(this.bookmarks, bookmark)];

            if (!current) {
                return;
            }

            current.sticky = true;
            persist(this.bookmarks);
        },
        remove(bookmark) {
            this.bookmarks.splice(index(this.bookmarks, bookmark), 1);
            persist(this.bookmarks);
        },
        clear(current) {
            const bookmark = this.bookmarks[index(this.bookmarks, current)];

            if (!bookmark) {
                return;
            }

            bookmark.sticky = false;
            this.bookmarks = [bookmark];
            persist(this.bookmarks);
        },
        empty() {
            this.bookmarks = [];
            persist(this.bookmarks);
        },
    },
});
