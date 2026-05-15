const withoutTab = query => Object.keys(query)
    .filter(key => key !== 'tab')
    .reduce((clean, key) => {
        clean[key] = query[key];

        return clean;
    }, {});

const matchesValues = (first, second) => Object.keys(first)
    .every(key => first[key] == second[key])
    && Object.keys(second)
        .every(key => second[key] == first[key]);

const matches = (first, second) => first.name === second.name
    && matchesValues(first.params, second.params)
    && matchesValues(withoutTab(first.query), withoutTab(second.query));

const qualifies = (bookmarks, bookmark) => bookmark && bookmark.name
    && !bookmark.meta.guestGuard
    && !bookmarks.some(existing => matches(existing, bookmark));

const map = bookmark => ({
    name: bookmark.name,
    meta: JSON.parse(JSON.stringify(bookmark.meta)),
    params: JSON.parse(JSON.stringify(bookmark.params)),
    query: JSON.parse(JSON.stringify(bookmark.query)),
    sticky: false,
    state: null,
});

const sync = (current, bookmark) => {
    current.meta = JSON.parse(JSON.stringify(bookmark.meta));
    current.params = JSON.parse(JSON.stringify(bookmark.params));
    current.query = JSON.parse(JSON.stringify(bookmark.query));
};

const index = (bookmarks, bookmark) => bookmarks.findIndex(existing => matches(existing, bookmark));

const stickies = bookmarks => bookmarks.filter(({ sticky, state }) => sticky || state);

const persist = bookmarks => {
    localStorage.setItem('bookmarks', JSON.stringify(stickies(bookmarks)));
};

export {
    qualifies, matches, stickies, map, sync, index, persist,
};
