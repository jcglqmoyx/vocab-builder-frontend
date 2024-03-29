<template>
  <ContentBase @keydown="handleKeydown" tabindex="0">
    <div v-if="dataStatus === 1" class="word-card">
      <div class="header">
        <el-button v-if="showHeader" class="centered-button" circle @click="showSearchDrawer = !showSearchDrawer">
          <el-icon>
            <el-icon>
              <Search/>
            </el-icon>
          </el-icon>
        </el-button>
        &nbsp;
        <el-button v-if="showHeader" class="centered-button" circle @click="showEditNoteDrawer = !showEditNoteDrawer">
          <el-icon>
            <EditPen/>
          </el-icon>
        </el-button>
        &nbsp;
        <el-button v-if="showHeader" class="centered-button" circle @click="markAsUnwanted">
          <el-icon>
            <Delete/>
          </el-icon>
        </el-button>
      </div>

      <div>
        <div class="word">{{ words[idx].word }}</div>
        <div v-if="status === 2 || status === 3" class="word">{{ words[idx].meaning }}</div>
      </div>

      <div class="footer">
        <el-button v-if="status === 1" @click="handleFamiliar">认识</el-button>
        <el-button v-if="status === 1" @click="handleUnfamiliar">不认识</el-button>
        <el-button v-if="status === 2" @click="gotItWrong">记错了</el-button>
        <el-button v-if="status === 2 || status === 3" @click="showNextWord">下一词</el-button>
      </div>
    </div>
    <div v-else-if="dataStatus === 2" class="word-card">
      <h1 class="word">Loading data...</h1>
    </div>
    <div v-else-if="dataStatus === 3" class="word-card">
      <h1 class="word">当前任务已完成</h1>
    </div>

    <!-- Search Drawer 必须置于ContentBase中，如果不放在ContentBase中，则按下s键（搜索单词）后，ContentBase将失去焦点，再次按快捷键将无效 -->
    <el-drawer v-model="showSearchDrawer" title="搜索" :with-header="true">
      <p v-for="(dictionary, index) in dictionaries" :key="dictionary.id">
        <a :href="dictionary.prefix + words[idx].word + (dictionary.suffix || '') " target="_blank">
          <b>{{ index + 1 }}. {{ dictionary.title }}</b>
        </a>
        <el-divider/>
      </p>
    </el-drawer>
  </ContentBase>

  <el-drawer v-model="showEditNoteDrawer" title="笔记" :with-header="true">
    <el-input
        type="textarea"
        placeholder="添加笔记"
        v-model="currentWordNote"
        :rows="30"
        maxlength="1000"
        show-word-limit
    ></el-input>
    <el-divider/>
    <el-button type="primary" @click="updateNote">确定</el-button>
  </el-drawer>
</template>

<script setup>
import {ElButton, ElDivider, ElDrawer, ElIcon, ElInput} from 'element-plus';
import {Delete, EditPen, Search} from "@element-plus/icons-vue";
import ContentBase from "@/components/ContentBase.vue";

import {useStore} from "vuex";
import {defineProps, onMounted, reactive, ref} from "vue";

import {getUserProfile} from "@/assets/js/module/user/query";
import {getDictionaryList} from "@/assets/js/module/dictionary/query";
import {fetchWords} from "@/assets/js/module/entry/query";
import {
  resetEntryStudyCountToZero,
  setUnwanted,
  updateEntryNote,
  updateEntryStudyCount
} from "@/assets/js/module/entry/update";

const props = defineProps(["type"]);
/*
 * 1: 加载成功
 * 2: 加载中
 * 3: 学习或复习任务已完成
 */
const dataStatus = ref(2);

const showHeader = ref(true);
const showSearchDrawer = ref(false);
const showEditNoteDrawer = ref(false);

let dictionaries = reactive([]);

let words = reactive([]);
let idx = ref(0);
let countRecognitionTime = {};
const timesCountedAsKnown = ref(0);

/*
 * 1: 刚开始的页面
 * 2: 选择了认识
 * 3: 选择了不认识
 */
const status = ref(1);

const checkResponse = (response) => {
  if (response == null || response.code === 2) {
    const store = useStore();
    store.dispatch("logout")
    location.reload();
  }
}

onMounted(
    async () => {
      const fetchWordsResponse = await fetchWords(props.type);
      checkResponse(fetchWordsResponse)
      words = fetchWordsResponse.data;
      if (words == null || words.length === 0) {
        dataStatus.value = 3;
        return;
      } else {
        dataStatus.value = 1;
        for (let i = 0; i < words.length; i++) {
          countRecognitionTime[i] = 0;
        }
      }

      const getDictionaryListResponse = await getDictionaryList();
      checkResponse(getDictionaryListResponse);
      dictionaries = getDictionaryListResponse.data;

      const getUserProfileResponse = await getUserProfile();
      checkResponse(getUserProfileResponse);
      timesCountedAsKnown.value = getUserProfileResponse.times_counted_as_known;
    }
);

const handleKeydown = async (event) => {
  if (!showEditNoteDrawer.value) {
    if ('0123456789'.includes(event.key)) {
      let number = +event.key;
      if (number === 0) number = 10;
      if (number <= dictionaries.length) {
        window.open(dictionaries[number - 1].prefix + words[idx.value].word + (dictionaries[number - 1].suffix || ""), '_blank');
      }
    } else if (event.key === 's') {
      showSearchDrawer.value = !showSearchDrawer.value;
      console.log(showSearchDrawer.value);
    } else if (event.key === "n") {
      if (status.value !== 2 && status.value !== 3) {
        return true;
      }
      await showNextWord();
    } else if (event.key === "u") {
      if (status.value !== 2) {
        return true;
      }
      await gotItWrong();
    } else if (event.key === "j") {
      if (status.value !== 1) {
        return true;
      }
      await handleFamiliar();
    } else if (event.key === "k") {
      if (status.value !== 1) {
        return true;
      }
      await handleUnfamiliar();
    } else if (event.key === "d" || event.key === "D") {
      await markAsUnwanted();
    } else {
      return true;
    }
  }
};

const markAsUnwanted = async () => {
  countRecognitionTime[idx.value] = timesCountedAsKnown.value;
  const markedAsUnwantedResponse = await setUnwanted(words[idx.value].id);
  checkResponse(markedAsUnwantedResponse);
  await showNextWord();
};

const handleUnfamiliar = async () => {
  countRecognitionTime[idx.value] = 0;
  const resetEntryStudyCountToZeroResponse = await resetEntryStudyCountToZero(words[idx.value].id);
  checkResponse(resetEntryStudyCountToZeroResponse);
  status.value = 3;
};

const handleFamiliar = async () => {
  countRecognitionTime[idx.value]++;
  if (countRecognitionTime[idx.value] >= timesCountedAsKnown.value) {
    const updateEntryStudyCountResponse = await updateEntryStudyCount(words[idx.value].id);
    checkResponse(updateEntryStudyCountResponse);
  }
  status.value = 2;
};

const gotItWrong = async () => {
  countRecognitionTime[idx.value] = 0;
  const resetEntryStudyCountToZeroResponse = await resetEntryStudyCountToZero(words[idx.value].id);
  checkResponse(resetEntryStudyCountToZeroResponse);
  await showNextWord();
}

const showNextWord = async () => {
  let tempIdx = idx.value;
  do {
    tempIdx = (tempIdx + 1) % words.length;
  } while (tempIdx !== idx.value && countRecognitionTime[tempIdx] >= timesCountedAsKnown.value);
  if (tempIdx === idx.value && countRecognitionTime[tempIdx] >= timesCountedAsKnown.value) {
    dataStatus.value = 3;
  } else {
    status.value = 1;
    idx.value = tempIdx;
  }
}

const updateNote = async () => {
  const updateNoteResponse = await updateEntryNote(words[idx.value].id, words[idx.value].note);
  checkResponse(updateNoteResponse);
}
</script>

<style scoped>
.word-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 80vh;
  max-width: 400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
}

.word {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.footer {
  display: flex;
  justify-content: space-around;
  padding: 10px;
}

el-icon {
  height: 100%;
  width: 100%;
}

.centered-button {
  display: grid;
  align-items: center;
  justify-content: center;
  height: 5vh;
  width: 5vh;
}
</style>