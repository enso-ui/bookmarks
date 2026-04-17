import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { bookmarks } from '../src/pinia/bookmarks';
import { preferences } from '../../ui/src/pinia/preferences';
import Bookmarks from '../src/core/components/Bookmarks.vue';
import BookmarksState from '../src/core/components/settings/BookmarksState.vue';

describe('bookmarks core components', () => {
    beforeEach(() => {
        localStorage.clear();
        setActivePinia(createPinia());
        bookmarks().$patch({ bookmarks: [], excluded: ['notFound', 'unauthorized'] });
        preferences().set({ global: { bookmarks: false }, local: {} });
        vi.clearAllMocks();
    });

    it('bookmarks state updates both stores', async () => {
        const slot = vi.fn(() => null);
        const route = {
            name: 'dashboard',
            meta: {},
            params: {},
            query: {},
        };

        BookmarksState.render.call({
            $route: route,
            $slots: { default: slot },
        });

        const { bindings, events } = slot.mock.calls[0][0];

        expect(bindings.modelValue).toBe(false);

        const setBookmarksState = vi.spyOn(preferences(), 'setBookmarksState')
            .mockImplementation(async value => {
                preferences().global.bookmarks = value;
            });

        await events['update:modelValue'](true);

        expect(preferences().global.bookmarks).toBe(true);
        expect(bookmarks().bookmarks).toHaveLength(1);
        expect(bookmarks().bookmarks[0]).toMatchObject({ name: 'dashboard' });
        expect(setBookmarksState).toHaveBeenCalledWith(true);
    });

    it('bookmarks render exposes store state and direct bindings', () => {
        const slot = vi.fn(() => null);
        bookmarks().$patch({
            bookmarks: [{
                name: 'dashboard',
                meta: {},
                params: {},
                query: {},
                sticky: true,
                state: null,
            }],
        });

        Bookmarks.render.call({
            $route: { name: 'dashboard', params: {}, query: {} },
            $slots: { default: slot },
            uniqueId: Bookmarks.methods.uniqueId,
            remove: vi.fn(),
            routerErrorHandler: vi.fn(),
            $router: { push: vi.fn(() => Promise.resolve()) },
        });

        const payload = slot.mock.calls[0][0];

        expect(payload.bookmarks).toHaveLength(1);
        expect(payload.hasClear).toBe(1);
        expect(payload.isExcluded({ name: 'unauthorized' })).toBe(true);
        expect(payload.matches(
            { name: 'dashboard', params: {}, query: {} },
            { name: 'dashboard', params: {}, query: {} },
        )).toBe(true);
    });
});
