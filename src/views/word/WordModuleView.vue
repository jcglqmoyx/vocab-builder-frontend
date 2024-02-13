<template>
  <ContentBase>
    <el-card v-if="dataLoaded" class="card">
      <div class="image-wrapper" :style="{ backgroundImage: 'url(' + imageUrl + ')' }">
        <div class="buttons">
          <el-button text class="button" @click="handleReview">Review</el-button>
          <el-button text class="button" @click="handleLearn">Learn</el-button>
        </div>
      </div>
    </el-card>
  </ContentBase>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import "element-plus/dist/index.css";
import {ElButton, ElCard} from "element-plus";
import ContentBase from "@/components/ContentBase.vue";
import axios from "axios";
import {getHomepageImageUrlKey} from "@/assets/js/util/datetime_util";
import {useRouter} from "vue-router";

const imageUrl = ref('https://your-image-url.jpg');

const dataLoaded = ref(false);

onMounted(async () => {
  dataLoaded.value = false;
  const unsplashURL = 'https://api.unsplash.com/photos/random?client_id=dow523p27APOI8KgcFO0XXCZ2GUv_E1Xhf6iJ0z4XDA';
  let today = new Date();
  let yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  let yesterdayHomepageImageUrlKey = getHomepageImageUrlKey(yesterday);
  localStorage.removeItem(yesterdayHomepageImageUrlKey);
  let todayHomepageImageUrlKey = getHomepageImageUrlKey(today);
  let todayHomepageImageUrl = localStorage.getItem(todayHomepageImageUrlKey);
  if (todayHomepageImageUrl == null) {
    await axios.get(unsplashURL)
        .then(response => {
          todayHomepageImageUrl = response.data.urls.regular;
          localStorage.setItem(todayHomepageImageUrlKey, todayHomepageImageUrl);
        })
        .catch(error => {
          console.error('Error fetching image:', error);
        });
  }
  imageUrl.value = todayHomepageImageUrl;
  dataLoaded.value = true;
})

const router = useRouter();
const handleReview = () => {
  router.push("/review");
}
const handleLearn = () => {
  router.push("/learn");
}
</script>

<style scoped>
.card {
  position: relative;
  overflow: hidden;
  width: 90vw;
  max-width: 500px;
  margin: auto;
}

.image-wrapper {
  position: relative;
  padding-top: 160%;
  background-size: cover;
  background-position: center;
}

.buttons {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}

.button {
  background-color: rgba(255, 255, 255, 0.7);
  border: none;
}
</style>