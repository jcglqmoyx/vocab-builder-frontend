<template>
  <ContentBase>
    <el-container v-if="dataLoaded">
      <el-main>
        <el-table :data="words">
          <el-table-column label="单词" prop="word"/>
          <el-table-column label="含义" prop="meaning"/>
          <el-table-column label="备注" prop="note"/>
          <el-table-column label="不想学" prop="unwanted"/>
          <el-table-column label="学习次数" prop="study_count"/>
          <el-table-column label="复习日期" prop="date_to_review" :formatter="formatDate"/>
          <el-table-column label="创建时间" prop="created_at" :formatter="formatDateTime"/>
          <el-table-column label="更新时间" prop="updated_at" :formatter="formatDateTime"/>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button @click="handleEditWord(scope.row)">编辑</el-button>
              <el-button @click="handleDeleteEntry(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div>
          <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[5, 10, 20, 50, 100]"
              :background="true"
              layout="total, sizes, prev, pager, next, jumper"
              :total="countTotalRecords"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
          />
        </div>
      </el-main>
      <br>
      <el-footer>
        <el-button type="primary" @click="showAddDialog">添加</el-button>
      </el-footer>
    </el-container>


    <el-dialog v-model="editFormVisible" title="编辑条目">
      <el-form :model="word">
        <el-form-item label="单词">
          <el-input v-model="word.word" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="含义">
          <el-input type="textarea" :autosize="{minRows: 5}" v-model="word.meaning" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" :autosize="{minRows: 3}" v-model="word.note" autocomplete="off"/>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="word.unwanted" label="标记为不想学" size="large"/>
        </el-form-item>
        <el-form-item label="学习次数">
          <el-input-number v-model="word.study_count" :min="0" :max="30"/>
        </el-form-item>
        <el-form-item label="下次复习日期">
          <div class="block">
            <el-date-picker
                v-model="dateToReviewEdit"
                :disabled-date="disabledDateToReview"
                type="date"
                placeholder="选择日期"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
                <span class="dialog-footer">
                  <el-button @click="cancelUpdate">取消</el-button>
                  <el-button type="primary" @click="confirmUpdate">确认</el-button>
                </span>
      </template>
    </el-dialog>

    <el-dialog v-model="addFormVisible" title="新建条目">
      <el-form :model="newWord">
        <el-form-item label="单词">
          <el-input v-model="newWord.word" @keyup.enter="confirmAdd" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="含义">
          <el-input v-model="newWord.meaning" @keyup.enter="confirmAdd" autocomplete="off"/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="newWord.note" @keyup.enter="confirmAdd" autocomplete="off"/>
        </el-form-item>
      </el-form>
      <template #footer>
                <span class="dialog-footer">
                  <el-button @click="cancelAdd">Cancel</el-button>
                  <el-button type="primary" @click="confirmAdd">确认</el-button>
                </span>
      </template>
    </el-dialog>
  </ContentBase>
</template>

<script setup>
import "element-plus/dist/index.css"
import {formatDate, formatDateTime} from "@/assets/js/util/datetime_util";
import {
  ElButton,
  ElCheckbox,
  ElContainer,
  ElDatePicker,
  ElDialog,
  ElFooter,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMain,
  ElNotification,
  ElPagination,
  ElTable,
  ElTableColumn,
} from "element-plus";
import {onMounted, reactive, ref} from "vue";
import ContentBase from "@/components/ContentBase.vue";
import {getWordCount, getWordList} from "@/assets/js/module/entry/query";
import {useStore} from "vuex";
import {updateEntry} from "@/assets/js/module/entry/update";
import {deleteEntry} from "@/assets/js/module/entry/delete";
import {AddEntry} from "@/assets/js/module/entry/add";

const bookId = parseInt(localStorage.getItem("book_id"));
let words = reactive([]);
let pageSize = ref(5);
let currentPage = ref(1);

const store = useStore();
const checkResponse = (response) => {
  if (response == null || response.code === 2) {
    store.dispatch("logout")
    location.reload();
  }
}

const dataLoaded = ref(false);
let countTotalRecords = ref(0);
onMounted(
    async () => {
      const getWordCountResponse = await getWordCount(bookId);
      checkResponse(getWordCountResponse);
      countTotalRecords.value = getWordCountResponse.data;

      const getWordListResponse = await getWordList(bookId, pageSize.value, currentPage.value);
      checkResponse(getWordListResponse);
      words = getWordListResponse.data;
      dataLoaded.value = true;
    }
);

const handleCurrentChange = async () => {
  dataLoaded.value = false;
  const getWordListResponse = await getWordList(bookId, pageSize.value, currentPage.value);
  checkResponse(getWordListResponse);
  words = getWordListResponse.data;
  dataLoaded.value = true;
};

const handleSizeChange = async () => {
  dataLoaded.value = false;
  const getWordListResponse = await getWordList(bookId, pageSize.value, currentPage.value);
  checkResponse(getWordListResponse)
  words = getWordListResponse.data;
  dataLoaded.value = true;
}

const word = ref(null);
const editFormVisible = ref(false);


const handleDeleteEntry = async (row) => {
  ElNotification({
    title: '删除条目',
    message: '条目删除中, 请稍等...',
    type: 'info',
    duration: 1000,
  });
  const deleteEntryResponse = await deleteEntry(row.id);
  checkResponse(deleteEntryResponse);
  if (deleteEntryResponse.code === 0) {
    dataLoaded.value = false;
    const getEntryCountResponse = await getWordCount(bookId);
    checkResponse(getEntryCountResponse);
    countTotalRecords.value = getEntryCountResponse.data;
    const getEntryListResponse = await getWordList(bookId, pageSize.value, currentPage.value);
    checkResponse(getEntryListResponse);
    words = getEntryListResponse.data;
    dataLoaded.value = true;
    ElNotification({
      title: 'Success',
      message: '删除成功',
      type: 'success',
      duration: 1000,
    });
  }
}

const disabledDateToReview = (date) => {
  const year = date.getFullYear();
  return year < 2000 || year > 2099;
}

const dateToReviewEdit = ref(0)
const handleEditWord = (row) => {
  word.value = row;
  const dateNumber = row.date_to_review;
  const year = Math.floor(dateNumber / 10000);
  const month = Math.floor((dateNumber % 10000) / 100) - 1; // 月份是从0开始的，所以需要减1
  const day = dateNumber % 100;
  const dateObj = new Date(year, month, day);
  dateToReviewEdit.value = dateObj.getTime();
  editFormVisible.value = true;
}

const cancelUpdate = () => {
  editFormVisible.value = false;
  location.reload();
}

const confirmUpdate = async () => {
  editFormVisible.value = false;
  dataLoaded.value = false;

  const date = new Date(dateToReviewEdit.value);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  word.value.date_to_review = year * 10000 + month * 100 + day;

  const updateEntryResponse = await updateEntry(
      word.value.id,
      word.value.word,
      word.value.meaning,
      word.value.book_id,
      word.value.note,
      word.value.unwanted,
      word.value.study_count,
      word.value.date_to_review,
      word.value.created_at,
  )
  checkResponse(updateEntryResponse);
  dataLoaded.value = true;
}

const addFormVisible = ref(false);
const showAddDialog = () => {
  addFormVisible.value = true;
}

const newWord = reactive({
  word: '',
  meaning: '',
  note: '',
})
const cancelAdd = () => {
  addFormVisible.value = false;
  newWord.word = '';
  newWord.meaning = '';
  newWord.note = '';
}
const handleAddWordError = (response) => {
  ElNotification({
    title: 'Error',
    message: response.message,
    type: 'error',
    duration: 1000,
  })
}
const confirmAdd = async () => {
  addFormVisible.value = false;
  dataLoaded.value = false;
  const addEntryResponse = await AddEntry(bookId, newWord.word, newWord.meaning, newWord.note);
  checkResponse(addEntryResponse);
  if (addEntryResponse.code === 0) {
    ElNotification({
      title: 'Success',
      message: '添加成功',
      type: 'success',
      duration: 1000,
    });
  } else {
    handleAddWordError(addEntryResponse);
  }
  const getWordCountResponse = await getWordCount(bookId);
  checkResponse(getWordCountResponse);
  countTotalRecords.value = getWordCountResponse.data.data;
  const getWordListResponse = await getWordList(bookId, pageSize.value, currentPage.value);
  checkResponse(getWordListResponse);
  words = getWordListResponse.data;
  dataLoaded.value = true;
  newWord.word = '';
  newWord.meaning = '';
  newWord.note = '';
}
</script>

<style scoped>
</style>