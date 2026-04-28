<template>
    <div class="bookmarks">
        <core-bookmarks>
            <template #default="{
                bookmarks, hasClear, matches, isExcluded, stickBindings,
                bookmarkBindings, removeBindings, bookmarkEvents,
                reorderBindings, reorderEvents, clearBindings,
                }">
                <a class="tag is-warning mr-1"
                    v-on="clearBindings"
                    v-if="hasClear">
                    <span class="icon is-small">
                        <fa :icon="faTrashCan"/>
                    </span>
                </a>
                <draggable class="field is-grouped bookmark-items no-scrollbars mt-0"
                    v-bind="reorderBindings"
                    v-on="reorderEvents">
                    <template #item="{ element }">
                        <span class="control"
                            v-bind="bookmarkBindings(element)">
                            <span class="tags has-addons">
                                <a :class="['tag', {'is-dark': matches($route, element)}]"
                                    v-on="bookmarkEvents(element)">
                                    <span>
                                        {{ i18n(element.meta.title) }}
                                    </span>
                                    <span class="icon is-small has-text-danger"
                                        v-if="element.state">
                                        <fa :icon="faCircle"
                                            size="xs"/>
                                    </span>
                                </a>
                                <a class="tag is-success check"
                                    v-on="stickBindings(element)"
                                    v-if="!element.sticky && !isExcluded(element)">
                                    <span class="icon is-small">
                                        <fa :icon="faCheck"/>
                                    </span>
                                </a>
                                <a class="tag is-delete"
                                    v-on="removeBindings(element)"
                                    v-if="bookmarks.length > 1 && !isExcluded(element)"/>
                            </span>
                        </span>
                    </template>
                </draggable>
            </template>
        </core-bookmarks>
    </div>
</template>

<script>
import Draggable from 'vuedraggable/src/vuedraggable';
import { FontAwesomeIcon as Fa } from '@fortawesome/vue-fontawesome';
import { faCheck, faCircle, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import CoreBookmarks from '../../core/components/Bookmarks.vue';

export default {
    name: 'Bookmarks',

    components: { Fa, CoreBookmarks, Draggable },

    inject: ['i18n'],

    data: () => ({
        faCheck,
        faCircle,
        faTrashCan,
    }),
};
</script>

<style lang="scss" src="../styles/bookmarks.scss"></style>
