<template>
  <el-menu
      :default-active="navbarActiveIndex"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
  >
    <router-link :to=" {name: 'word'} ">
      <el-menu-item index="1">
        <template #title>单词</template>
      </el-menu-item>
    </router-link>

    <el-sub-menu index="2">
      <template #title>设置</template>
      <router-link :to="{ name: 'book_setting' }">
        <el-menu-item index="2-1">词书设置</el-menu-item>
      </router-link>
      <router-link :to="{ name: 'dictionary_setting' }">
        <el-menu-item index="2-2">词典设置</el-menu-item>
      </router-link>
      <router-link :to="{ name: 'user_setting' }">
        <el-menu-item index="2-3">用户设置</el-menu-item>
      </router-link>
    </el-sub-menu>
    <el-sub-menu index="3">
      <template #title>工具</template>
      <el-menu-item index="3-1" @click="handleRecordAudio">
        口语录音
      </el-menu-item>
    </el-sub-menu>

    <el-menu-item index="4" @click="handleOpenHelpPage">
      帮助
    </el-menu-item>

    <LoginAndLogoutMenuItem/>
  </el-menu>
</template>

<script setup>
import "element-plus/dist/index.css";
import {ref} from 'vue';
import {ElMenu, ElMenuItem, ElSubMenu} from 'element-plus';
import LoginAndLogoutMenuItem from "@/views/menu_item/LoginAndLogoutMenuItem.vue";
import {useStore} from "vuex";

const navbarActiveIndex = ref('4');
const store = useStore();
if (store.state.user.isAuthenticated) {
  navbarActiveIndex.value = '1'
}

const handleRecordAudio = () => {
  window.open('https://jcglqmoyx.gitee.io/audio-recorder', '_blank');
}

const handleOpenHelpPage = () => {
  window.open('https://jcglqmoyx.gitee.io/vocab-builder-helper/posts/vocab-builder-helper/', '_blank');
}
</script>

<style scoped>
el-menu-item {
  width: 5px;
  color: black;
}
</style>