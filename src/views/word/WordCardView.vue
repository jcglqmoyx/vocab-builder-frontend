<template>
  <ContentBase @keydown="handleKeydown" tabindex="0">
    <div v-if="dataLoaded" class="word-card">
      <div class="header">
        <el-button v-if="showHeader" class="centered-button" circle @click="handleSearch">
          <el-icon>
            <el-icon>
              <Search/>
            </el-icon>
          </el-icon>
        </el-button>
        &nbsp;
        <el-button v-if="showHeader" class="centered-button" circle @click="handleTakeNotes">
          <el-icon>
            <EditPen/>
          </el-icon>
        </el-button>
        &nbsp;
        <el-button v-if="showHeader" class="centered-button" circle @click="markedAsUnwanted">
          <el-icon>
            <Delete/>
          </el-icon>
        </el-button>
      </div>

      <div>
        <div class="word">{{ currentWord.word }}</div>
        <div v-if="familiarButtonClicked || unfamiliarButtonClicked" class="word">{{ currentWord.meaning }}</div>
      </div>

      <div v-if="wordArray.length !== 0" class="footer">
        <el-button v-if="showNextWordButtonClicked || gotItWrongButtonClicked" @click="handleUnfamiliar">不认识
        </el-button>
        <el-button v-if="showNextWordButtonClicked || gotItWrongButtonClicked" @click="handleFamiliar">认识</el-button>
        <el-button v-if="familiarButtonClicked" @click="gotItWrong">记错了</el-button>
        <el-button v-if="familiarButtonClicked || unfamiliarButtonClicked" @click="showNextWord">下一词</el-button>
      </div>
    </div>
    <div v-else>
      <h1>Loading data...</h1>
    </div>

    <el-drawer v-model="searchDrawer" title="搜索" :with-header="true">
      <p v-for="(dict, index) in dictionaries" :key="dict.id">
        <a :href="dict.prefix + currentWord.word + (dict.suffix || '') " target="_blank">
          <b>{{ index + 1 }}. {{ dict.title }}</b>
        </a>
        <el-divider/>
      </p>
    </el-drawer>
  </ContentBase>
  <el-drawer v-model="noteDrawer" title="笔记" :with-header="true">
    <el-input
        type="textarea"
        placeholder="添加备注"
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
import {defineProps, onMounted, reactive, ref} from "vue";
import {fetchWords} from "@/assets/js/module/entry/query";
import ContentBase from "@/components/ContentBase.vue";
import {useStore} from "vuex";
import {getDictionaryList} from "@/assets/js/module/dictionary/query";
import {setUnwanted, updateEntryNote, updateEntryStudyCount} from "@/assets/js/module/entry/update";
import {getUserProfile} from "@/assets/js/module/user/query";

const currentWordId = ref(0);
const currentWordNote = ref('');

const props = defineProps(["type"]);
const dataLoaded = ref(false);
let words = reactive([]);
let currentWord = reactive(
    {
      id: 0,
      word: "",
      meaning: "",
      book_id: 0,
      user_id: 0,
      note: "",
      study_count: 0,
    }
);
const familiarButtonClicked = ref(false);
const unfamiliarButtonClicked = ref(false);
const showNextWordButtonClicked = ref(true);
const gotItWrongButtonClicked = ref(true);

let countRecognizedTime = {};
let idx = 0;
let wordArray = [];

let dictionaries = reactive([]);

function init(words) {
  words.forEach(word => {
    countRecognizedTime[word['id']] = 0;
    wordArray.push(word);
  });
}

const store = useStore();
const checkResponse = (response) => {
  if (response == null || response.code === 2) {
    store.dispatch("logout")
    location.reload();
  }
}

const timesCountedAsKnown = ref(0);
const showHeader = ref(true);
onMounted(
    async () => {
      const fetchWordsResponse = await fetchWords(props.type);
      checkResponse(fetchWordsResponse)
      words = fetchWordsResponse.data;
      if (words == null || words.length === 0) {
        currentWord.word = "当前任务已完成";
        currentWord.meaning = "";
        dataLoaded.value = true;
        showHeader.value = false;
      } else {
        dataLoaded.value = true;
        currentWord = words[idx];
        currentWordNote.value = currentWord.note;
        currentWordId.value = currentWord.id;
        init(words);
      }

      const getDictionaryListResponse = await getDictionaryList();
      checkResponse(getDictionaryListResponse);
      dictionaries = getDictionaryListResponse.data;

      const getUserProfileResponse = await getUserProfile();
      checkResponse(getUserProfileResponse);
      timesCountedAsKnown.value = getUserProfileResponse.times_counted_as_known;
    }
);


const searchDrawer = ref(false);
const noteDrawer = ref(false);
const handleSearch = () => {
  searchDrawer.value = true;
};
const handleTakeNotes = () => {
  noteDrawer.value = true;
}

const status = ref('judge');
console.log(status.value);

const handleKeydown = async (event) => {
  if (!noteDrawer.value) {
    if ('0123456789'.includes(event.key)) {
      let number = +event.key;
      if (number === 0) number = 10;
      if (number <= dictionaries.length) {
        window.open(dictionaries[number - 1].prefix + currentWord.word + (dictionaries[number - 1].suffix || ""), '_blank');
      }
    } else if (event.key === 's' || event.key === 'S') {
      searchDrawer.value = !searchDrawer.value;
    } else if (event.key === "n" || event.key === "N") {
      if (status.value !== "then") {
        return true;
      }
      await showNextWord();
      status.value = "judge";
    } else if (event.key === "u" || event.key === "U") {
      if (status.value !== "then") {
        return true;
      }
      await gotItWrong();
      status.value = "judge";
    } else if (event.key === "j" || event.key === "J") {
      if (status.value !== "judge") {
        return true;
      }
      handleFamiliar();
      status.value = "then";
    } else if (event.key === "k" || event.key === "K") {
      if (status.value !== "judge") {
        return true;
      }
      handleUnfamiliar();
      status.value = "then";
    } else if (event.key === "d" || event.key === "D") {
      await markedAsUnwanted();
      status.value = "judge";
    } else {
      return true;
    }
  }
};
const markedAsUnwanted = async () => {
  const markedAsUnwantedResponse = await setUnwanted(currentWord.id);
  checkResponse(markedAsUnwantedResponse);
  wordArray.splice(idx, 1);
  dataLoaded.value = false;
  if (wordArray.length === 0) {
    currentWord.word = "当前任务已完成";
    currentWord.meaning = null;
    showHeader.value = false;
  } else {
    idx = (idx + 1) % wordArray.length;
    currentWord = wordArray[idx];
  }
  dataLoaded.value = true;
};

const handleUnfamiliar = () => {
  unfamiliarButtonClicked.value = true;
  showNextWordButtonClicked.value = false;
  gotItWrongButtonClicked.value = false;
};

const handleFamiliar = () => {
  familiarButtonClicked.value = true;
  showNextWordButtonClicked.value = false;
  gotItWrongButtonClicked.value = false;
  countRecognizedTime[currentWord.id]++;
};
const gotItWrong = () => {
  gotItWrongButtonClicked.value = true;
  familiarButtonClicked.value = false;
  countRecognizedTime[currentWord.id]--;
  idx = (idx + 1) % wordArray.length;
  currentWord = wordArray[idx];
}
const showNextWord = async () => {
  showNextWordButtonClicked.value = true;
  familiarButtonClicked.value = false;
  unfamiliarButtonClicked.value = false;
  if (countRecognizedTime[currentWord.id] >= timesCountedAsKnown.value) {
    const updateEntryStudyCountResponse = await updateEntryStudyCount(currentWord.id);
    checkResponse(updateEntryStudyCountResponse);
    wordArray.splice(idx, 1);
    if (wordArray.length === 0) {
      currentWord.word = "当前任务已完成";
      currentWord.meaning = null;
      showHeader.value = false;
      return;
    }
  }
  idx = (idx + 1) % wordArray.length;
  currentWord = wordArray[idx];
}

const updateNote = async () => {
  const updateNoteResponse = await updateEntryNote(currentWordId.value, currentWordNote.value);
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