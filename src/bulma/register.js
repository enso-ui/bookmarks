import BookmarksState from './components/settings/BookmarksState.vue';

export default App => {
    App.registerSettingsItem('bookmarks-state', BookmarksState, 500);
};
