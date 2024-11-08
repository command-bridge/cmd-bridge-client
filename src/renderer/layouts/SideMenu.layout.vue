<template>
    <v-navigation-drawer app color="primary" :clipped="lgAndUp" :temporary="!lgAndUp" dark>
        <v-list dense>
            <!-- Home Menu Item -->
            <v-list-item @click="navigateTo('home')" class="menu-item">
                <v-icon left>mdi-home</v-icon>
                <span class="menu-text">Home</span>
            </v-list-item>

            <!-- Health Menu Item -->
            <v-list-item @click="navigateTo('health')" class="menu-item">
                <v-icon left>mdi-heart-pulse</v-icon>
                <span class="menu-text">Health</span>
            </v-list-item>

            <!-- Settings Menu Item -->
            <v-list-item @click="navigateTo('settings')" class="menu-item">
                <v-icon left>mdi-cog</v-icon>
                <span class="menu-text">Settings</span>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify/lib/framework.mjs';

export default defineComponent({
    name: 'SideMenu', 
    setup(props, { emit }) {

        const router = useRouter();

        const navigateTo = (route: string) => {
            router.push(route);
            emit('toggleDrawer');
        };

        const { lgAndUp } = useDisplay();

        return {
            navigateTo,
            lgAndUp
        };
    },
});
</script>

<style>
/* Ensure menu items are aligned in a single row */
.menu-item {
    display: flex;
    align-items: center;
    padding-left: 16px;
    /* Adjust spacing to suit your layout */
}

/* Style for the icon */
.v-icon {
    margin-right: 8px;
    /* Space between icon and text */
    font-size: 24px;
    /* Adjust icon size if needed */
}

/* Style for the text */
.menu-text {
    font-size: 16px;
    color: white;
    /* Adjust color to match your theme */
}
</style>